import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css"; // We'll create a new CSS file
import useUserPhoneStore from "../src/store/userPhoneStore";
import useAuthStore from "../src/store/authStore";

const API_BASE = "http://localhost:3000/api";

function Login() {
  const navigate = useNavigate();
  const setPhoneInStore = useUserPhoneStore((s) => s.setPhone);
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [language, setLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const resendTimerRef = useRef(null);

  // Language options
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "ml", name: "മലയാളം" },
  ];

  // Translations
  const translations = {
    en: {
      title: "Farmer Helpdesk — Login",
      subtitle: "Sign in with your phone (WhatsApp OTP)",
      phonePlaceholder: "+919876543210",
      sendOtp: "Send OTP",
      sending: "Sending...",
      otpSent: "OTP sent to",
      enterOtp: "Enter OTP",
      otpPlaceholder: "6-digit code",
      verify: "Verify",
      verifying: "Verifying...",
      changePhone: "Change Phone",
      resendOtp: "Resend OTP",
      resendIn: "Resend in",
      trusted: "Trusted by growers",
      multilingual: "Multilingual support available",
      loginSuccess: "Login successful!",
      selectLanguage: "Select Language",
    },
    hi: {
      title: "किसान हेल्पडेस्क — लॉगिन",
      subtitle: "अपने फोन से साइन इन करें (WhatsApp OTP)",
      phonePlaceholder: "+919876543210",
      sendOtp: "OTP भेजें",
      sending: "भेज रहे हैं...",
      otpSent: "OTP भेजा गया",
      enterOtp: "OTP दर्ज करें",
      otpPlaceholder: "6-अंकों का कोड",
      verify: "सत्यापित करें",
      verifying: "सत्यापित कर रहे हैं...",
      changePhone: "फोन बदलें",
      resendOtp: "OTP पुनः भेजें",
      resendIn: "पुनः भेजें",
      trusted: "किसानों द्वारा विश्वसनीय",
      multilingual: "बहुभाषिक समर्थन उपलब्ध",
      loginSuccess: "लॉगिन सफल!",
      selectLanguage: "भाषा चुनें",
    },
    ta: {
      title: "விவசாயி ஹெல்ப்டெஸ்க் — உள்நுழை",
      subtitle: "உங்கள் தொலைபேசியுடன் உள்நுழைக (WhatsApp OTP)",
      phonePlaceholder: "+919876543210",
      sendOtp: "OTP அனுப்பு",
      sending: "அனுப்புகிறது...",
      otpSent: "OTP அனுப்பப்பட்டது",
      enterOtp: "OTP உள்ளிடுக",
      otpPlaceholder: "6-இலக்க குறியீடு",
      verify: "சரிபார்க்க",
      verifying: "சரிபார்க்கிறது...",
      changePhone: "தொலைபேசியை மாற்று",
      resendOtp: "OTP மீண்டும் அனுப்பு",
      resendIn: "மீண்டும் அனுப்பு",
      trusted: "விவசாயிகள் நம்புகிறார்கள்",
      multilingual: "பல மொழி ஆதரவு கிடைக்கும்",
      loginSuccess: "உள்நுழைவு வெற்றிகரமாக завершено!",
      selectLanguage: "மொழியை தேர்ந்தெடுக்கவும்",
    },
    te: {
      title: "రైతు హెల్ప్డెస్క్ — లాగిన్",
      subtitle: "మీ ఫోన్‌తో సైన్ ఇన్ చేయండి (WhatsApp OTP)",
      phonePlaceholder: "+919876543210",
      sendOtp: "OTP పంపండి",
      sending: "పంపడం...",
      otpSent: "OTP పంపబడింది",
      enterOtp: "OTP నమోదు చేయండి",
      otpPlaceholder: "6-అంకెల కోడ్",
      verify: "ధృవీకరించండి",
      verifying: "ధృవీకరిస్తోంది...",
      changePhone: "ఫోన్ మార్చండి",
      resendOtp: "OTP మళ్లీ పంపండి",
      resendIn: "మళ్లీ పంపండి",
      trusted: "రైతులచే నమ్మకం",
      multilingual: "బహుభాషా మద్దతు అందుబాటులో ఉంది",
      loginSuccess: "లాగిన్ విజయవంతమైంది!",
      selectLanguage: "భాషను ఎంచుకోండి",
    },
    ml: {
      title: "കർഷക ഹെൽപ്പ്‌ഡെസ്ക് — ലോഗിൻ",
      subtitle: "നിങ്ങളുടെ ഫോൺ ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുക (WhatsApp OTP)",
      phonePlaceholder: "+919876543210",
      sendOtp: "OTP അയക്കുക",
      sending: "അയക്കുന്നു...",
      otpSent: "OTP അയച്ചു",
      enterOtp: "OTP നൽകുക",
      otpPlaceholder: "6-അക്ക കോഡ്",
      verify: "സ്ഥിരീകരിക്കുക",
      verifying: "സ്ഥിരീകരിക്കുന്നു...",
      changePhone: "ഫോൺ മാറ്റുക",
      resendOtp: "OTP വീണ്ടും അയക്കുക",
      resendIn: "വീണ്ടും അയക്കുക",
      trusted: "കർഷകർ വിശ്വസിക്കുന്നു",
      multilingual: "മൾട്ടിലിംഗ്വൽ പിന്തുണ ലഭ്യമാണ്",
      loginSuccess: "ലോഗിൻ വിജയിച്ചു!",
      selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (resendCooldown <= 0 && resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [resendCooldown]);

  const startResendCooldown = (seconds = 30) => {
    setResendCooldown(seconds);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(resendTimerRef.current);
          resendTimerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const isValidPhone = (p) => /^\+?\d{7,15}$/.test(p.trim());

  const requestOtp = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Enter a valid phone number (e.g. +919876543210).");
      return;
    }
    try {
      setSendLoading(true);
      const resp = await fetch(`${API_BASE}/login/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        if (data.message?.toLowerCase().includes("user not found")) {
          toast.info("User not found — please signup first.");
          return;
        }
        toast.success("OTP sent via WhatsApp.");
        setStep("otp");
        startResendCooldown(30);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error.");
      console.error("requestOtp error:", err);
    } finally {
      setSendLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Invalid phone.");
      return;
    }
    if (!otp.trim()) {
      toast.warning("Enter the OTP.");
      return;
    }
    try {
      setVerifyLoading(true);
      const resp = await fetch(`${API_BASE}/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.success) {
        setPhoneInStore(phone);
        login();
        toast.success(t.loginSuccess);
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error("Network error.");
      console.error("verifyOtp error:", err);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background with animation */}
      <div className="background-animation">
        <div className="floating-icon icon-1">🌱</div>
        <div className="floating-icon icon-2">🌾</div>
        <div className="floating-icon icon-3">🚜</div>
        <div className="floating-icon icon-4">💧</div>
      </div>

      {/* Back Button */}
      <button className="back-arrow" onClick={() => navigate(-1)}>
        ←
      </button>

      {/* Language Selector */}
      <div className="language-selector">
        <button 
          className="language-button"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        >
          🌐 {languages.find(lang => lang.code === language)?.name}
        </button>
        {showLanguageDropdown && (
          <div className="language-dropdown">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`language-option ${language === lang.code ? "active" : ""}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setShowLanguageDropdown(false);
                }}
              >
                {lang.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🌾</span>
          </div>
          <h1 className="login-title">{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        {step === "phone" && (
          <div className="form-section animate-slide-up">
            <div className="input-group">
              <label className="label" htmlFor="phone">
                {t.selectLanguage}
              </label>
              <input
                id="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className={`btn primary ${sendLoading ? "loading" : ""}`}
              onClick={requestOtp}
              disabled={sendLoading}
            >
              {sendLoading ? (
                <>
                  <span className="spinner"></span>
                  {t.sending}
                </>
              ) : (
                t.sendOtp
              )}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="form-section animate-slide-up">
            <p className="info-text">
              {t.otpSent} <strong>{phone}</strong>
            </p>
            <div className="input-group">
              <label className="label" htmlFor="otp">
                {t.enterOtp}
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder={t.otpPlaceholder}
                className="input-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
              />
            </div>
            
            {/* Visual OTP Timer */}
            <div className="otp-timer">
              <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 36 36">
                  <path
                    className="timer-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="timer-circle-progress"
                    strokeDasharray={`${(resendCooldown / 30) * 100}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="timer-text">{resendCooldown}s</span>
              </div>
            </div>
            
            <div className="actions">
              <button
                className={`btn primary ${verifyLoading ? "loading" : ""}`}
                onClick={verifyOtp}
                disabled={verifyLoading}
              >
                {verifyLoading ? (
                  <>
                    <span className="spinner"></span>
                    {t.verifying}
                  </>
                ) : (
                  t.verify
                )}
              </button>
              <button className="btn ghost" onClick={() => setStep("phone")}>
                {t.changePhone}
              </button>
              <button
                className="btn ghost"
                onClick={requestOtp}
                disabled={resendCooldown > 0 || sendLoading}
              >
                {resendCooldown > 0 ? `${t.resendIn} ${resendCooldown}s` : t.resendOtp}
              </button>
            </div>
          </div>
        )}

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🌾</span>
            <span>Crop Advice</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌧️</span>
            <span>Weather Alerts</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>Market Prices</span>
          </div>
        </div>

        <p className="footnote">{t.trusted} • {t.multilingual}</p>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Login;