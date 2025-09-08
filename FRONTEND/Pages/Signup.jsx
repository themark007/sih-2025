import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css";
import useUserPhoneStore from "../src/store/userPhoneStore";
import useAuthStore from "../src/store/authStore";

const API_BASE = "http://localhost:3000/api"; // adjust if needed

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const resendTimerRef = useRef(null);
   const login = useAuthStore((state) => state.login);

const setPh = useUserPhoneStore((s) => s.setPhone);
  const clearPh = useUserPhoneStore((s) => s.clearPhone);

  useEffect(() => {
    if (resendCooldown <= 0 && resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
    // cleanup on unmount
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

  // simple phone validation: optional +, 7-15 digits
  const isValidPhone = (p) => {
    if (!p) return false;
    return /^\+?\d{7,15}$/.test(p.trim());
  };

  // send OTP -> POST /signup/send-otp { phone }
  const requestOtp = async () => {
    const trimmed = phone.trim();
    if (!isValidPhone(trimmed)) {
      toast.error("Please enter a valid phone number (e.g. +919876543210).");
      return;
    }

    try {
      setSendLoading(true);
      const resp = await fetch(`${API_BASE}/signup/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed }),
      });

      // try parse JSON
      const data = await resp.json().catch(() => ({}));

      // backend returns 200 with message "Login already exists" or "otp_sent"
      if (resp.ok) {
        // If backend says login exists
        if (data.message && data.message.toLowerCase().includes("login already")) {
          toast.info("Account already exists for this phone. Please log in.");
          return;
        }

        // OTP sent
        if (data.message && data.message.toLowerCase().includes("otp_sent") || data.message && data.message.toLowerCase().includes("otp sent")) {
          toast.success("OTP sent via WhatsApp. Please check your WhatsApp.");
          setStep("otp");
          startResendCooldown(30);
          return;
        }

        // fallback success
        toast.success(data.message || "OTP sent. Check WhatsApp.");
        setStep("otp");
        startResendCooldown(30);
        return;
      } else {
        // non-200
        if (data.message) {
          toast.error(data.message);
        } else {
          toast.error(`Failed to send OTP (${resp.status})`);
        }
      }
    } catch (err) {
      console.error("requestOtp error:", err);
      toast.error("Network error: could not reach server.");
    } finally {
      setSendLoading(false);
    }
  };

  // verify OTP -> POST /signup/verify-otp { phone, otp }
  const verifyOtp = async () => {
    const trimmedPhone = phone.trim();
    const enteredOtp = otp.trim();
    if (!isValidPhone(trimmedPhone)) {
      toast.error("Phone is invalid. Change phone and request OTP again.");
      return;
    }
    if (!enteredOtp) {
      toast.warning("Please enter the OTP.");
      return;
    }

    try {
      setVerifyLoading(true);
      const resp = await fetch(`${API_BASE}/signup/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone, otp: enteredOtp }),
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        // success true returned on success
        if (data.success === true || data.message && data.message.toLowerCase().includes("success")) {
          toast.success(data.message || "Signup successful! ✅");
          // navigate to home or login
           setPh(phone);
          login();
          setTimeout(() => navigate("/dashboard"), 900);
          return;
        }

        // handle case backend replies 200 but success false with message
        if (data.message) {
          toast.error(data.message);
          return;
        }

        // fallback
        toast.success("Signup complete.");
          setPh(phone);
          login();
        setTimeout(() => navigate("/details"), 900);
        return;
      } else {
        // non-200
        if (data.message) {
          toast.error(data.message);
        } else {
          toast.error(`OTP verification failed (${resp.status})`);
        }
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      toast.error("Network error: could not reach server.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChangePhone = () => {
    // reset OTP + step back
    setOtp("");
    setStep("phone");
  };

  return (
    <div className="signup-page">
      {/* Back Arrow */}
      <button
        className="back-arrow"
        aria-label="Go Back"
        onClick={() => navigate(-1)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M15.5 19l-7-7 7-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Hero */}
      <div
        className="hero-banner"
        role="img"
        aria-label="Green farm field"
      />

      {/* Card */}
      <div className="signup-container">
        <h1 className="signup-title">Farmer Helpdesk — Sign up</h1>
        <p className="subtitle">Get quick answers to your crop questions</p>

        {step === "phone" && (
          <div className="form-section fade-in">
            <label className="label" htmlFor="phone">
              Phone
            </label>
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
              {sendLoading ? "Sending..." : "Send OTP via WhatsApp"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="form-section fade-in-up">
            <p className="info-text">
              We sent an OTP to <strong>{phone}</strong>
            </p>
            <label className="label" htmlFor="otp">
              Enter OTP
            </label>
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
                {verifyLoading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button className="btn ghost" onClick={handleChangePhone}>
                Change Phone
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn ghost"
                  onClick={requestOtp}
                  disabled={resendCooldown > 0 || sendLoading}
                  title={
                    resendCooldown > 0
                      ? `Wait ${resendCooldown}s to resend`
                      : "Resend OTP"
                  }
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="footnote">
          Trusted by growers • Multilingual support coming soon
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={1800} />
    </div>
  );
}

export default Signup;
