# app.py - complete backend with dynamic /labels loading
import io
import os
import logging
from collections import OrderedDict

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T

# -----------------------
# CONFIG - adjust paths if needed
# -----------------------
MODEL_PATH = "model_loaded_custom.pth"      # pickled model produced in Colab
ORIG_CKPT_PATH = "marklwdedekh_full.pth"   # original checkpoint that (may) contain class_to_idx
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
ALLOWED_EXT = {"png", "jpg", "jpeg"}
TOPK = 5
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB upload limit
# -----------------------

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("plant-backend")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app)

# -----------------------
# AutoBlockModel (must match the class used when saving the pickled model)
# -----------------------
class AutoBlockModel(nn.Module):
    def __init__(self, signatures=None, num_classes=None):
        super().__init__()
        if isinstance(signatures, dict):
            for prefix, sig in signatures.items():
                model_prefix = self._safe_prefix(prefix)
                parts = model_prefix.split(".")
                parent = self
                for part in parts[:-1]:
                    if not hasattr(parent, part):
                        setattr(parent, part, nn.Module())
                    parent = getattr(parent, part)
                leaf_name = parts[-1]
                weight_shape = sig.get("weight_shape")
                bias_shape = sig.get("bias_shape")
                if weight_shape and len(weight_shape) == 4:
                    out_c, in_c, kh, kw = weight_shape
                    conv = nn.Conv2d(in_channels=in_c, out_channels=out_c,
                                     kernel_size=(kh, kw), stride=1, padding=0,
                                     bias=("bias_shape" in sig))
                    setattr(parent, leaf_name, conv)
                elif weight_shape and len(weight_shape) == 2:
                    out_f, in_f = weight_shape
                    lin = nn.Linear(in_f, out_f, bias=("bias_shape" in sig))
                    setattr(parent, leaf_name, lin)
                elif "running_mean_shape" in sig or ("bias_shape" in sig and "weight_shape" not in sig):
                    num_features = None
                    if "running_mean_shape" in sig:
                        num_features = sig["running_mean_shape"][0]
                    elif "weight_shape" in sig and len(sig["weight_shape"]) == 1:
                        num_features = sig["weight_shape"][0]
                    elif "bias_shape" in sig:
                        num_features = sig["bias_shape"][0]
                    if num_features is None:
                        num_features = 1
                    bn = nn.BatchNorm2d(num_features)
                    setattr(parent, leaf_name, bn)
                else:
                    setattr(parent, leaf_name, nn.Module())

        if num_classes is not None and not hasattr(self, "classifier") and not hasattr(self, "fc"):
            inferred_in = None
            if isinstance(signatures, dict):
                for p, s in signatures.items():
                    w = s.get("weight_shape")
                    if w and len(w) == 2:
                        inferred_in = w[1]
                        break
            if inferred_in is None:
                inferred_in = 1024
            self.classifier = nn.Linear(inferred_in, num_classes)

    def _safe_prefix(self, prefix: str) -> str:
        parts = prefix.split(".")
        parts2 = [f"idx{p}" if p.isdigit() else p for p in parts]
        return ".".join(parts2)

    def forward(self, x):
        out = x
        if hasattr(self, "conv_stem"):
            try:
                out = getattr(self, "conv_stem")(out)
            except Exception:
                pass
        if hasattr(self, "bn0"):
            try:
                out = getattr(self, "bn0")(out)
            except Exception:
                pass

        if hasattr(self, "blocks"):
            blocks_mod = getattr(self, "blocks")
            names = [n for n in blocks_mod.__dict__ if n.startswith("idx")]
            try:
                names_sorted = sorted(names, key=lambda s: int(s.replace("idx", "")) if s.replace("idx","").isdigit() else s)
            except Exception:
                names_sorted = names
            for nm in names_sorted:
                blk = getattr(blocks_mod, nm)
                for sub in ("conv_dw", "conv_exp", "conv_pw", "bn1", "bn2"):
                    if hasattr(blk, sub):
                        try:
                            out = getattr(blk, sub)(out)
                        except Exception:
                            pass

        try:
            out = torch.nn.functional.adaptive_avg_pool2d(out, (1,1))
            out = torch.flatten(out, 1)
        except Exception:
            try:
                out = out.view(out.size(0), -1)
            except Exception:
                pass

        if hasattr(self, "classifier"):
            try:
                out = self.classifier(out)
            except Exception:
                pass
        elif hasattr(self, "fc"):
            try:
                out = self.fc(out)
            except Exception:
                pass

        return out

# -----------------------
# Preprocessing (adjust to your model's training transforms if needed)
# -----------------------
preprocess = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
])

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def prepare_image(image_bytes: bytes) -> torch.Tensor:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return preprocess(img).unsqueeze(0)

# -----------------------
# Model loading helpers
# -----------------------
def load_model(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at {path}")
    # Try TorchScript first
    try:
        m = torch.jit.load(path, map_location=DEVICE)
        m.to(DEVICE)
        m.eval()
        log.info("Loaded TorchScript model.")
        return m
    except Exception as e:
        log.info("torch.jit.load failed (falling back to torch.load): %s", e)

    # Fallback to torch.load (pickled nn.Module)
    m = torch.load(path, map_location=DEVICE)
    if isinstance(m, dict) and "state_dict" in m:
        raise RuntimeError("Loaded file is a checkpoint dict (contains state_dict). Expected pickled model object or TorchScript.")
    m.to(DEVICE)
    m.eval()
    log.info("Loaded pickled PyTorch model via torch.load.")
    return m

# -----------------------
# CLASS_MAP: try to load at startup if checkpoint present
# -----------------------
CLASS_MAP = None
if os.path.exists(ORIG_CKPT_PATH):
    try:
        ckpt = torch.load(ORIG_CKPT_PATH, map_location="cpu")
        if isinstance(ckpt, dict) and "class_to_idx" in ckpt:
            # invert mapping: class_name -> idx  => idx -> class_name
            class_to_idx = ckpt["class_to_idx"]
            CLASS_MAP = {int(v): k for k, v in class_to_idx.items()}
            log.info("Loaded CLASS_MAP with %d labels from checkpoint.", len(CLASS_MAP))
        else:
            log.info("Checkpoint exists but has no class_to_idx key.")
    except Exception as e:
        log.warning("Failed to load original checkpoint for labels: %s", e)

# -----------------------
# Load model (best-effort) so /predict works
# -----------------------
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
    else:
        log.warning("Model file %s not found at startup. /predict will return error until model is available.", MODEL_PATH)
except Exception as e:
    log.exception("Failed to load model at startup: %s", e)
    model = None

# -----------------------
# Endpoints
# -----------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "status": "ok", "model_loaded": model is not None})

@app.route("/labels", methods=["GET"])
def labels():
    """
    Return CLASS_MAP if available.
    If not loaded, attempt to load ORIG_CKPT_PATH now and build CLASS_MAP.
    If still not available, attempt to infer output size from loaded model and return generic class names.
    """
    global CLASS_MAP
    if CLASS_MAP:
        return jsonify({"success": True, "labels": CLASS_MAP})

    # Try to load checkpoint now
    if os.path.exists(ORIG_CKPT_PATH):
        try:
            ckpt = torch.load(ORIG_CKPT_PATH, map_location="cpu")
            if isinstance(ckpt, dict) and "class_to_idx" in ckpt:
                class_to_idx = ckpt["class_to_idx"]
                CLASS_MAP = {int(v): k for k, v in class_to_idx.items()}
                return jsonify({"success": True, "labels": CLASS_MAP})
        except Exception as e:
            return jsonify({"success": False, "error": f"Failed to load checkpoint: {e}"}), 500

    # If we have a loaded model, attempt to infer number of classes via dummy forward
    if model is not None:
        try:
            with torch.no_grad():
                ex = torch.randn(1, 3, 224, 224, device=DEVICE)
                out = model(ex)
                if isinstance(out, (list, tuple)):
                    out = out[0]
                out = out.cpu()
                if out.dim() == 1:
                    out = out.unsqueeze(0)
                n = out.size(1)
                CLASS_MAP = {i: f"class_{i}" for i in range(n)}
                return jsonify({"success": True, "labels": CLASS_MAP})
        except Exception as e:
            return jsonify({"success": False, "error": f"Failed to infer label count from model: {e}"}), 500

    return jsonify({"success": False, "error": "No label mapping available on server."}), 404

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"success": False, "error": "Model not loaded on server."}), 500

    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file part in request (field name should be 'image')"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": f"Unsupported file extension. Allowed: {ALLOWED_EXT}"}), 400

    try:
        img_bytes = file.read()
        input_tensor = prepare_image(img_bytes).to(DEVICE)
    except Exception as e:
        log.exception("Failed to prepare image: %s", e)
        return jsonify({"success": False, "error": f"Failed to process image: {e}"}), 400

    with torch.no_grad():
        outputs = model(input_tensor)
        if isinstance(outputs, (list, tuple)):
            outputs = outputs[0]
        outputs = outputs.cpu()
        if outputs.dim() == 1:
            outputs = outputs.unsqueeze(0)

        if outputs.size(1) > 1:
            probs = F.softmax(outputs, dim=1).numpy()[0]
            topk = int(min(TOPK, outputs.size(1)))
            topk_idx = probs.argsort()[::-1][:topk].tolist()
            topk_list = [
                {
                    "class_idx": int(i),
                    "class_name": CLASS_MAP.get(i, f"class_{i}") if CLASS_MAP else f"class_{i}",
                    "probability": float(probs[i])
                }
                for i in topk_idx
            ]
            pred_idx = int(topk_idx[0])
            pred_prob = float(probs[pred_idx])
            pred_name = CLASS_MAP.get(pred_idx, f"class_{pred_idx}") if CLASS_MAP else f"class_{pred_idx}"
        else:
            probs = outputs.numpy()[0]
            topk_list = []
            pred_idx = 0
            pred_prob = float(probs[0])
            pred_name = CLASS_MAP.get(0, "score") if CLASS_MAP else "score"

    return jsonify({
        "success": True,
        "prediction": {
            "class_idx": pred_idx,
            "class_name": pred_name,
            "probability": pred_prob,
            "topk": topk_list
        }
    })

# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    log.info("Starting Flask server on http://0.0.0.0:4000 (device=%s)", DEVICE)
    app.run(host="0.0.0.0", port=4000, debug=True)
