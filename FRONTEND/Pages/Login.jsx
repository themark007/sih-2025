import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css"; // reuse your existing CSS
import useUserPhoneStore from "../src/store/userPhoneStore";
import useAuthStore from "../src/store/authStore";

const API_BASE = "http://localhost:3000/api";

function Login() {
  const navigate = useNavigate();
  const setPhoneInStore = useUserPhoneStore((s) => s.setPhone);

  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const resendTimerRef = useRef(null);
    const login = useAuthStore((state) => state.login);

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

  // basic phone validation
  const isValidPhone = (p) => /^\+?\d{7,15}$/.test(p.trim());

  // ---- Request OTP ----
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

  // ---- Verify OTP ----
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
        setPhoneInStore(phone); // ✅ save phone to store
        login(); // ✅ set auth state
        toast.success("Login successful!");
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
    <div className="signup-page">
      {/* Back Button */}
      <button className="back-arrow" onClick={() => navigate(-1)}>
        ←
      </button>

      <div className="signup-container">
        <h1 className="signup-title">Farmer Helpdesk — Login</h1>
        <p className="subtitle">Sign in with your phone (WhatsApp OTP)</p>

        {step === "phone" && (
          <div className="form-section">
            <label className="label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="+919876543210"
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
            <button
              className="btn primary"
              onClick={requestOtp}
              disabled={sendLoading}
            >
              {sendLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="form-section">
            <p className="info-text">
              OTP sent to <strong>{phone}</strong>
            </p>
            <label className="label" htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <div className="actions">
              <button
                className="btn primary"
                onClick={verifyOtp}
                disabled={verifyLoading}
              >
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
              <button className="btn ghost" onClick={() => setStep("phone")}>
                Change Phone
              </button>
              <button
                className="btn ghost"
                onClick={requestOtp}
                disabled={resendCooldown > 0 || sendLoading}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <p className="footnote">Trusted by growers • Multilingual support coming soon</p>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Login;
