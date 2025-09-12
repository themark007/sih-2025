// CropChatFrontend.jsx
import React, { useEffect, useRef, useState } from "react";

const TRANSLATIONS = {
  en: {
    title: "CropCare Chat",
    placeholder: "Ask about crop issues, pests, diseases...",
    send: "Send",
    upload: "Attach photo",
    language: "Language",
    analyzing: "Analyzing...",
    tipsTitle: "Tips for useful questions",
    aboutTitle: "About",
    clearChat: "Clear Chat",
    examples: "Example Questions",
    example1: "What's wrong with my tomato leaves?",
    example2: "How to treat aphids on cabbage?",
    example3: "Why are my chili plants wilting?",
  },
  kn: {
    title: "CropCare ಚಾಟ್",
    placeholder: "ಬೀಜ, ಕೀಟ, ರೋಗಗಳ ಕುರಿತು ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    upload: "ಚಿತ್ರ ಅಟ್ಯಾಚ್ ಮಾಡಿ",
    language: "ಭಾಷೆ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    tipsTitle: "ಉಪಯುಕ್ತ ಪ್ರಶ್ನೆಗಳ ಸಲಹೆಗಳು",
    aboutTitle: "ಅಬೌಟ್",
    clearChat: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ",
    examples: "ಉದಾಹರಣೆ ಪ್ರಶ್ನೆಗಳು",
    example1: "ನನ್ನ ಟೊಮೇಟೊ ಎಲೆಗಳಿಗೆ ಏನು ತಪ್ಪಾಗಿದೆ?",
    example2: "ಕೋಸುಗೆ ಏಫಿಡ್ಸ್ ಚಿಕಿತ್ಸೆ ಹೇಗೆ?",
    example3: "ನನ್ನ ಮೆಣಸಿನ ಗಿಡಗಳು ಯಾಕೆ ವಿಲ್ಟ್ ಆಗುತ್ತಿವೆ?",
  },
  ml: {
    title: "CropCare ചാറ്റ്",
    placeholder: "ഫലങ്ങള്‍, കീടങ്ങള്‍, രോഗങ്ങള്‍ പ്പറ്റി ചോദിക്കുക...",
    send: "അയക്കൂ",
    upload: "ചിത്രം അറ്റാച്ച് ചെയ്യുക",
    language: "ഭാഷ",
    analyzing: "വിശ്ലേഷണം നടത്തുന്നു...",
    tipsTitle: "ഉപയോഗപ്രദമായ ചോദ്യങ്ങൾക്കുള്ള ടിപ്പുകൾ",
    aboutTitle: "വിവരണം",
    clearChat: "ചാറ്റ് മായ്ക്കുക",
    examples: "ഉദാഹരണ ചോദ്യങ്ങൾ",
    example1: "എന്റെ തക്കാളി ഇലകൾക്ക് എന്ത് പ്രശ്നമാണ്?",
    example2: "കാബേജിൽ ആഫിഡുകൾക്ക് എങ്ങനെ ചികിത്സിക്കാം?",
    example3: "എന്തുകൊണ്ടാണ് എന്റെ മുളക് ചെടികൾ വാടുന്നത്?",
  },
  hi: {
    title: "CropCare चैट",
    placeholder: "फसल, कीट या रोग के बारे में पूछें...",
    send: "भेजें",
    upload: "फोटो जोड़ें",
    language: "भाषा",
    analyzing: "विश्लेषण जारी है...",
    tipsTitle: "उपयोगी प्रश्नों के लिए टिप्स",
    aboutTitle: "के बारे में",
    clearChat: "चैट साफ़ करें",
    examples: "उदाहरण प्रश्न",
    example1: "मेरी टमाटर की पत्तियों में क्या समस्या है?",
    example2: "पत्तागोभी पर एफिड्स का इलाज कैसे करें?",
    example3: "मेरी मिर्च की पौध मुरझा क्यों रही है?",
  },
};

export default function CropChatFrontend() {
  const [lang, setLang] = useState("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Welcome to CropCare! Select language and ask about your crop. Attach an image if helpful.",
      time: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showExamples, setShowExamples] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => scrollToBottom(), [messages]);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_DIM = 1024;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = width / height;
          if (ratio > 1) {
            width = MAX_DIM;
            height = Math.round(MAX_DIM / ratio);
          } else {
            height = MAX_DIM;
            width = Math.round(MAX_DIM * ratio);
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setImagePreview(dataUrl);
        const base64 = dataUrl.split(",")[1];
        setImageBase64(base64);
      };
      img.onerror = () => {
        const rawBase64 = ev.target.result.split(",")[1] || ev.target.result;
        setImagePreview(ev.target.result);
        setImageBase64(rawBase64);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageBase64(null);
  }

  async function sendQuestion() {
    if (!input.trim() && !imageBase64) return;
    const time = new Date().toISOString();

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: input.trim() || "[image attached]",
      image: imagePreview,
      time,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setImagePreview(null);
    setShowExamples(false);

    const placeholder = {
      id: `b-${Date.now()}`,
      sender: "bot",
      text: TRANSLATIONS[lang].analyzing,
      loading: true,
      time,
    };
    setMessages((m) => [...m, placeholder]);
    setIsLoading(true);

    try {
      const API_URL = "http://localhost:3000/api/chat";
      const body = {
        question: input.trim() || "",
        lang,
        image_base64: imageBase64 || null,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text}`);
      }
      const data = await res.json();
      const answer = (data.answer || data.result || data.text || "No answer from server").toString();

      const botMsg = {
        id: `b-res-${Date.now()}`,
        sender: "bot",
        text: answer,
        time: new Date().toISOString(),
      };

      setMessages((m) => m.map((msg) => (msg.loading ? botMsg : msg)));
    } catch (err) {
      console.error("sendQuestion error:", err);
      const errMsg = {
        id: `b-err-${Date.now()}`,
        sender: "bot",
        text: "Error connecting to server. Try again later.",
        time: new Date().toISOString(),
      };
      setMessages((m) => m.map((msg) => (msg.loading ? errMsg : msg)));
    } finally {
      setIsLoading(false);
      setImageBase64(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  }

  function clearChat() {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Welcome to CropCare! Select language and ask about your crop. Attach an image if helpful.",
        time: new Date().toISOString(),
      },
    ]);
    setShowExamples(true);
  }

  function useExample(exampleText) {
    setInput(exampleText);
  }

  return (
    <div className="crop-chat-container">
      <div className="chat-app">
        <div className="chat-header">
          <div className="header-title">
            <div className="title-icon">🌱</div>
            <h2>{TRANSLATIONS[lang].title}</h2>
          </div>
          <div className="header-controls">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select">
              <option value="en">English</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="hi">हिन्दी</option>
            </select>
            <button onClick={clearChat} className="clear-btn">
              {TRANSLATIONS[lang].clearChat}
            </button>
          </div>
        </div>

        <div className="chat-body">
          <div className="messages-container" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.sender}`}>
                <div className="message-content">
                  {m.image && <img src={m.image} alt="attached" className="message-image" />}
                  <div className="message-text">{m.text}</div>
                  {m.loading && (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
                <div className="message-time">{new Date(m.time).toLocaleTimeString()}</div>
              </div>
            ))}
            
            {showExamples && (
              <div className="examples-container">
                <h3>{TRANSLATIONS[lang].examples}</h3>
                <div className="example-buttons">
                  <button onClick={() => useExample(TRANSLATIONS[lang].example1)} className="example-btn">
                    {TRANSLATIONS[lang].example1}
                  </button>
                  <button onClick={() => useExample(TRANSLATIONS[lang].example2)} className="example-btn">
                    {TRANSLATIONS[lang].example2}
                  </button>
                  <button onClick={() => useExample(TRANSLATIONS[lang].example3)} className="example-btn">
                    {TRANSLATIONS[lang].example3}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="preview" />
                <button onClick={removeImage} className="remove-image-btn">
                  ×
                </button>
              </div>
            )}
            
            <div className="input-controls">
              <textarea
                placeholder={TRANSLATIONS[lang].placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows="1"
                className="chat-input"
              />
              <div className="action-buttons">
                <label className="file-upload-btn">
                  📎 {TRANSLATIONS[lang].upload}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
                <button onClick={sendQuestion} disabled={isLoading} className="send-btn">
                  {isLoading ? "⏳" : TRANSLATIONS[lang].send}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .crop-chat-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        
        .chat-app {
          width: 100%;
          max-width: 1000px;
          height: 90vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chat-header {
          background: linear-gradient(135deg, #2f855a 0%, #38a169 100%);
          color: white;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .title-icon {
          font-size: 24px;
        }
        
        .header-title h2 {
          margin: 0;
          font-weight: 600;
        }
        
        .header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .lang-select {
          padding: 8px 12px;
          border-radius: 20px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .lang-select:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .clear-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background: transparent;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .chat-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
          animation: fadeIn 0.3s ease;
        }
        
        .message.user {
          align-self: flex-end;
        }
        
        .message.bot {
          align-self: flex-start;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .message.user .message-content {
          background: linear-gradient(135deg, #2f855a 0%, #38a169 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .message.bot .message-content {
          background: white;
          color: #2d3748;
          border-bottom-left-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        
        .message-image {
          max-width: 200px;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .message-time {
          font-size: 11px;
          color: #718096;
          margin-top: 4px;
          padding: 0 4px;
        }
        
        .message.user .message-time {
          text-align: right;
        }
        
        .typing-indicator {
          display: flex;
          padding: 8px 0;
          gap: 4px;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background: #a0aec0;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.2s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .input-container {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          background: white;
        }
        
        .image-preview {
          position: relative;
          margin-bottom: 12px;
          display: inline-block;
        }
        
        .image-preview img {
          max-width: 150px;
          max-height: 150px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          line-height: 1;
        }
        
        .input-controls {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          resize: none;
          font-family: inherit;
          max-height: 120px;
          transition: all 0.3s ease;
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #2f855a;
          box-shadow: 0 0 0 2px rgba(47, 133, 90, 0.2);
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .file-upload-btn {
          padding: 10px 16px;
          background: #edf2f7;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }
        
        .file-upload-btn:hover {
          background: #e2e8f0;
        }
        
        .send-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #2f855a 0%, #38a169 100%);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(47, 133, 90, 0.3);
        }
        
        .send-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .examples-container {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
          animation: slideIn 0.3s ease;
        }
        
        .examples-container h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #4a5568;
        }
        
        .example-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .example-btn {
          padding: 10px 16px;
          text-align: left;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #4a5568;
        }
        
        .example-btn:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @media (max-width: 768px) {
          .chat-app {
            height: 100vh;
            border-radius: 0;
          }
          
          .message {
            max-width: 85%;
          }
          
          .header-controls {
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
}