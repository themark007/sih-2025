// controllers/chatController.js
import axios from "axios";

const MODEL_API_URL = process.env.MODEL_API_URL || null;
const HF_API_KEY = process.env.HF_API_KEY || null;

if (!MODEL_API_URL) console.warn("MODEL_API_URL not set");
if (!HF_API_KEY) console.warn("HF_API_KEY not set");

function sanitizeAnswer(raw, promptText = "") {
  if (!raw) return null;
  let s = String(raw).replace(/\r\n/g, "\n");

  // Remove exact prompt echoes
  if (promptText && s.includes(promptText)) s = s.split(promptText).join("");

  // redact emails/urls and common contact phrasings
  s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redacted-email]");
  s = s.replace(/\b(?:https?:\/\/|ftp:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/\S*)?\b/g, "[redacted-url]");
  s = s.replace(/\b(You can also email|Contact us at|For more info email)\b[^\n]*/gi, "[redacted-contact]");
  s = s.replace(/\bRespond in the language code[^\n]*\n?/gi, "");
  s = s.replace(/\bDo NOT provide any contact information[^\n]*\n?/gi, "");

  s = s.replace(/\s{2,}/g, " ").trim();
  if (!s) return null;
  return s.length > 16000 ? s.slice(0, 16000) + "...[truncated]" : s;
}

function extractModelText(data) {
  if (!data) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (Array.isArray(data)) {
    for (const item of data) {
      if (!item) continue;
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item.generated_text) return String(item.generated_text).trim();
      if (item.summary_text) return String(item.summary_text).trim();
      if (item.text) return String(item.text).trim();
      if (item.generated_texts && item.generated_texts[0]) return String(item.generated_texts[0]).trim();
    }
  }
  if (typeof data === "object") {
    if (data.generated_text) return String(data.generated_text).trim();
    if (data.summary_text) return String(data.summary_text).trim();
    if (data.text) return String(data.text).trim();
    if (data?.choices && data.choices[0]) {
      const c = data.choices[0];
      if (c.text) return String(c.text).trim();
      if (c.message?.content) return String(c.message.content).trim();
    }
    try {
      const j = JSON.stringify(data);
      if (j && j.length < 20000) return j;
    } catch (e) {}
  }
  return null;
}

async function hfPost(payload, headers, timeout = 120000) {
  return axios.post(MODEL_API_URL, payload, { headers, timeout });
}

export const chat = async (req, res) => {
  try {
    const { question = "", lang = "en", image_base64 = null } = req.body || {};

    if (!question.trim() && !image_base64) {
      return res.status(400).json({ error: "Provide question text or image_base64" });
    }
    if (!MODEL_API_URL || !HF_API_KEY) {
      return res.status(500).json({ error: "Server misconfigured: MODEL_API_URL or HF_API_KEY missing" });
    }

    const promptText = `You are an agricultural assistant for farmers.
Answer in the language code "${lang}" (en/kn/ml/hi). Be concise, practical, and give step-by-step suggestions where applicable.
Do NOT provide any contact information, email addresses, phone numbers, or external links. If you would otherwise give a contact, reply instead: "[contact removed]".
Question: ${question}`;

    const headers = { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" };

    // Primary params: request not to return full text / echo if endpoint supports it
    const primaryParams = {
      max_new_tokens: 512,
      temperature: 0.2,
      top_k: 50,
      top_p: 0.95,
      // try both flags many endpoints accept: 'return_full_text' and 'echo'
      return_full_text: false,
      echo: false,
    };

    // Stricter retry params
    const retryParams = {
      max_new_tokens: 320,
      temperature: 0.0,
      top_k: 1,
      top_p: 0.9,
      return_full_text: false,
      echo: false,
    };

    // candidate payload shapes - we'll try in order
    const candidatePayloads = [];

    // shape A: multimodal object (text + optional image)
    const inputsObj = { text: promptText };
    if (image_base64) inputsObj.image = image_base64;
    candidatePayloads.push({ inputs: inputsObj, parameters: primaryParams, options: { wait_for_model: true } });

    // shape B: simple string inputs (text-only)
    candidatePayloads.push({ inputs: promptText, parameters: primaryParams, options: { wait_for_model: true } });

    // shape C: alternate wrapper sometimes required
    candidatePayloads.push({ input: promptText, parameters: primaryParams, options: { wait_for_model: true } });

    let hfRes = null;
    let usedShape = -1;
    let lastErr = null;

    for (let i = 0; i < candidatePayloads.length; i++) {
      const p = candidatePayloads[i];
      try {
        console.info(`[chat] attempting payload shape #${i + 1}`);
        hfRes = await hfPost(p, headers);
        usedShape = i + 1;
        break;
      } catch (err) {
        lastErr = err;
        const errBody = err?.response?.data;
        console.warn(`[chat] shape #${i + 1} failed:`, err?.response?.status || err.message, errBody ? (typeof errBody === "object" ? JSON.stringify(errBody).slice(0,400) : String(errBody).slice(0,400)) : "");
        // continue to next shape
      }
    }

    if (!hfRes) {
      return res.status(502).json({ error: "Error contacting model endpoint", details: lastErr?.response?.data || lastErr?.message });
    }

    // debug: small slice of model raw response
    try {
      const slice = typeof hfRes.data === "string" ? hfRes.data.slice(0, 2000) : JSON.stringify(hfRes.data).slice(0, 2000);
      console.debug(`[chat] model raw slice (shape ${usedShape}):`, slice);
    } catch (e) {}

    // extract and sanitize
    let extracted = extractModelText(hfRes.data);
    let sanitized = sanitizeAnswer(extracted, promptText);

    // detect echo if sanitized is empty or contains model's initial instruction
    const echoDetected = !sanitized || sanitized.length === 0 || (extracted && (extracted.includes("You are an agricultural assistant") || extracted.includes("Answer in the language code")));

    if (echoDetected) {
      console.warn("[chat] echo detected. Retrying with stricter params (temperature=0, top_k=1) and explicit no-echo flags.");
      // Build retry payloads (prefer text-only string)
      const retryCandidates = [];
      retryCandidates.push({ inputs: promptText, parameters: retryParams, options: { wait_for_model: true } });
      if (image_base64) retryCandidates.push({ inputs: { text: promptText, image: image_base64 }, parameters: retryParams, options: { wait_for_model: true } });

      let hfRes2 = null;
      let lastErr2 = null;
      for (let i = 0; i < retryCandidates.length; i++) {
        try {
          console.info(`[chat] retry attempt #${i + 1}`);
          hfRes2 = await hfPost(retryCandidates[i], headers);
          break;
        } catch (err2) {
          lastErr2 = err2;
          console.warn("[chat] retry attempt failed:", err2?.response?.status || err2?.message);
          continue;
        }
      }

      if (hfRes2) {
        try {
          const slice2 = typeof hfRes2.data === "string" ? hfRes2.data.slice(0, 2000) : JSON.stringify(hfRes2.data).slice(0, 2000);
          console.debug("[chat] model raw slice (retry):", slice2);
        } catch (e) {}
        extracted = extractModelText(hfRes2.data);
        sanitized = sanitizeAnswer(extracted, promptText);
      } else {
        // nothing usable from retry — return best-effort sanitized original or error note
        const fallback = sanitized || extracted || "[model echoed prompt; no usable answer]";
        return res.status(200).json({ answer: fallback, note: "Model echoed prompt and retries failed." });
      }
    }

    if (!sanitized) {
      return res.status(200).json({ answer: "[model returned no usable answer after sanitization]" });
    }

    // success
    console.info(`[chat] success (usedPayloadShape=${usedShape}, echoDetected=${echoDetected ? "yes" : "no"})`);
    return res.status(200).json({ answer: sanitized, meta: { usedPayloadShape: usedShape, echoDetected } });
  } catch (err) {
    console.error("chatController unexpected error:", err);
    return res.status(500).json({ error: "Internal server error", details: err?.message || String(err) });
  }
};
