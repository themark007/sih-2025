import React, { useState, useRef, useEffect } from "react";
import "./GetVDisease.css";

const DEFAULT_API = "http://localhost:4000";

export default function GetVDisease({ apiUrl = `${DEFAULT_API}/predict`, labelsUrl = `${DEFAULT_API}/labels`, topK = 5 }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [labels, setLabels] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropAI, setShowCropAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const inputRef = useRef(null);
  const xhrRef = useRef(null);
  const resultRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Sample AI responses for demonstration
  const aiResponses = {
    "treatment": "For this disease, recommended treatments include organic fungicides, proper plant spacing for air circulation, and removing affected leaves. Would you like more specific treatment options?",
    "prevention": "To prevent this disease, practice crop rotation, ensure proper drainage, use disease-resistant varieties, and avoid overhead watering. Regular monitoring is also crucial.",
    "symptoms": "Common symptoms include yellowing leaves, dark spots, wilting, and stunted growth. Early detection is key to effective management.",
    "default": "I can help you with information about this plant disease, including treatment options, prevention methods, and symptom identification. What would you like to know more about?"
  };

  useEffect(() => {
    // Fetch label mapping once on mount
    (async () => {
      try {
        const res = await fetch(labelsUrl);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.labels) {
          setLabels(json.labels);
        }
      } catch (e) {
        console.warn("Could not fetch labels:", e);
      }
    })();
    
    // Scroll to result when it appears
    if (result && result.success) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
      // Add initial AI message when result is available
      if (aiMessages.length === 0) {
        addAiMessage("Hello! I'm your Crop AI assistant. I can provide information about this plant disease and answer your questions.");
      }
    }
    
    // Cleanup preview url on unmount
    return () => preview && URL.revokeObjectURL(preview);
  }, [labelsUrl, preview, result]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  function onFileSelected(fileObj) {
    setError(null);
    setResult(null);
    setAiMessages([]);
    if (!fileObj) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(fileObj);
    const url = URL.createObjectURL(fileObj);
    setPreview(url);
  }

  function handleInputChange(e) {
    const f = e.target.files && e.target.files[0];
    onFileSelected(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    onFileSelected(f);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function reset() {
    if (xhrRef.current) try { xhrRef.current.abort(); } catch {}
    xhrRef.current = null;
    setUploading(false);
    setProgress(0);
    setResult(null);
    setError(null);
    setFile(null);
    setAiMessages([]);
    setShowCropAI(false);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    if (inputRef.current) inputRef.current.value = "";
  }

  function formatPct(p) {
    if (p === null || p === undefined) return "-";
    const n = Number(p);
    if (Number.isNaN(n)) return "-";
    return (n * 100).toFixed(2) + "%";
  }

  function mapLabel(classIdxOrName) {
    if (!labels) return classIdxOrName;
    const asNum = typeof classIdxOrName === "number" ? classIdxOrName : parseInt(classIdxOrName, 10);
    if (!Number.isNaN(asNum) && (labels[asNum] || labels[String(asNum)])) {
      return labels[asNum] || labels[String(asNum)];
    }
    return classIdxOrName;
  }

  function addAiMessage(message) {
    setAiMessages(prev => [...prev, { type: 'ai', content: message }]);
  }

  function addUserMessage(message) {
    setAiMessages(prev => [...prev, { type: 'user', content: message }]);
  }

  function simulateAiResponse(input) {
    setIsAiTyping(true);
    addUserMessage(input);
    setUserInput("");
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = aiResponses.default;
      
      if (lowerInput.includes("treat") || lowerInput.includes("cure") || lowerInput.includes("fix")) {
        response = aiResponses.treatment;
      } else if (lowerInput.includes("prevent") || lowerInput.includes("avoid") || lowerInput.includes("stop")) {
        response = aiResponses.prevention;
      } else if (lowerInput.includes("symptom") || lowerInput.includes("sign") || lowerInput.includes("look")) {
        response = aiResponses.symptoms;
      }
      
      addAiMessage(response);
      setIsAiTyping(false);
    }, 1500);
  }

  function handleChatSubmit(e) {
    e.preventDefault();
    if (userInput.trim() === "" || isAiTyping) return;
    simulateAiResponse(userInput);
  }

  function uploadImage() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    setUploading(true);
    setProgress(0);
    setResult(null);
    setError(null);
    setAiMessages([]);

    const form = new FormData();
    form.append("image", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", apiUrl, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      setUploading(false);
      xhrRef.current = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && data.success && data.prediction) {
            const mapped = {
              ...data,
              prediction: {
                ...data.prediction,
                class_name: mapLabel(data.prediction.class_idx ?? data.prediction.class_name)
              }
            };
            if (Array.isArray(mapped.prediction.topk)) {
              mapped.prediction.topk = mapped.prediction.topk.map(t => ({
                ...t,
                class_name: mapLabel(t.class_idx ?? t.class_name)
              }));
            }
            setResult(mapped);
            setError(null);
          } else {
            setResult(data);
          }
        } catch (err) {
          setError("Failed to parse server response.");
        }
      } else {
        setError(`Server error ${xhr.status}: ${xhr.responseText}`);
      }
      setProgress(100);
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Network error during upload.");
      xhrRef.current = null;
    };

    xhr.send(form);
  }

  const topk = result && result.success && result.prediction && Array.isArray(result.prediction.topk)
    ? result.prediction.topk.slice(0, topK)
    : [];

  return (
    <div className="getvdisease-container">
      <div className="header-section">
        <h2 className="title">Plant Disease Detection</h2>
        <p className="subtitle">Upload an image to identify potential plant diseases</p>
      </div>

      <div className="upload-section">
        <div
          className={`drop-area ${isDragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={handleInputChange} style={{ display: "none" }} />
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="preview" className="preview-img" />
              <div className="preview-overlay">
                <span className="change-text">Click to change image</span>
              </div>
            </div>
          ) : (
            <div className="drop-content">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="drop-text">
                <p>Drag & drop an image here</p>
                <p className="drop-subtext">or click to browse files</p>
                <p className="format-info">Supports: JPG, PNG, JPEG</p>
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <button 
            className={`btn btn-primary ${uploading ? 'uploading' : ''}`} 
            onClick={uploadImage} 
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading... {progress}%
              </>
            ) : (
              <>
                <span className="icon">🌿</span>
                Analyze Plant Health
              </>
            )}
          </button>
          <button className="btn btn-secondary" onClick={reset}>
            Clear
          </button>
        </div>

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="message-box error-message animate-shake">
          <div className="message-icon">⚠️</div>
          <div className="message-content">{error}</div>
        </div>
      )}

      {result && result.success && (
        <div ref={resultRef} className="result-section">
          <div className="result-card animate-slide-up">
            <div className="card-header">
              <h3>Analysis Results</h3>
              <div className="confidence-badge" style={{ 
                backgroundColor: `hsl(${result.prediction.probability * 120}, 70%, 40%)` 
              }}>
                {formatPct(result.prediction.probability)} confidence
              </div>
            </div>

            <div className="result-top">
              <div className="prediction-main">
                <span className="pred-name">{result.prediction.class_name}</span>
              </div>
            </div>

            {topk.length > 0 && (
              <div className="topk-section">
                <h4>Top {topk.length} Predictions</h4>
                <div className="topk-list">
                  {topk.map((t, index) => (
                    <div key={t.class_idx} className="topk-item">
                      <div className="topk-rank">#{index + 1}</div>
                      <div className="topk-name">{t.class_name}</div>
                      <div className="topk-bar">
                        <div 
                          className="topk-bar-fill" 
                          style={{ width: `${t.probability * 100}%` }}
                        ></div>
                      </div>
                      <div className="topk-prob">{formatPct(t.probability)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="result-actions">
              <button 
                className="btn btn-ai"
                onClick={() => setShowCropAI(!showCropAI)}
              >
                <span className="icon">🤖</span>
                {showCropAI ? 'Hide' : 'Talk to'} Crop AI
              </button>
              
              <details className="raw-details">
                <summary>View Raw Response</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          </div>

          {showCropAI && (
            <div className="ai-chat-container animate-slide-up">
              <div className="ai-chat-header">
                <h4>Crop AI Assistant</h4>
                <button 
                  className="btn-close-chat"
                  onClick={() => setShowCropAI(false)}
                >
                  ×
                </button>
              </div>
              
              <div ref={chatContainerRef} className="ai-chat-messages">
                {aiMessages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-avatar">
                      {message.type === 'ai' ? '🤖' : '👤'}
                    </div>
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="message ai">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleChatSubmit} className="ai-chat-input">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about treatment, prevention, symptoms..."
                  disabled={isAiTyping}
                />
                <button type="submit" disabled={isAiTyping}>
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {result && !result.success && (
        <div className="message-box warning-message">
          <div className="message-icon">ℹ️</div>
          <div className="message-content">Prediction failed: {result.error || "Unknown error"}</div>
        </div>
      )}
    </div>
  );
}