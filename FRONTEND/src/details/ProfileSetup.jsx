// ProfileSetup.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../store/profileStore";
import "./profileSetup.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userPhoneStore from "../store/userPhoneStore";

const TOTAL_STEPS = 4;
const API_BASE = "http://localhost:3000/api"; // adjust if needed

export default function ProfileSetup() {
  const navigate = useNavigate();
  ph: userPhoneStore((s) => s.phone);
  // zustand profile

  // store setter
  const setProfile = useProfileStore((s) => s.setProfile);
  const savedProfile = useProfileStore((s) => s.profile);

  // form state
  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState(savedProfile?.name || "");
  const [district, setDistrict] = useState(savedProfile?.district || "");
  const [village, setVillage] = useState(savedProfile?.village || "");
  const [language, setLanguage] = useState(savedProfile?.preferred_language || "ml");
  const [cropInput, setCropInput] = useState("");
  const [crops, setCrops] = useState(
    savedProfile?.crops ? String(savedProfile.crops).split(",").map(s => s.trim()).filter(Boolean) : []
  );
  const [submitting, setSubmitting] = useState(false);

  const cropsTagsRef = useRef(null);

  useEffect(() => {
    // animate or update progress if needed
  }, [currentStep]);

  function updateProgressBar() {
    const el = document.getElementById("progress");
    if (!el) return;
    const percent = Math.round((currentStep / TOTAL_STEPS) * 100);
    el.style.width = `${percent}%`;
  }
  useEffect(() => updateProgressBar(), [currentStep]);

  function nextStep() {
    // validation per step
    if (currentStep === 1) {
      if (!name.trim()) return toast.error("Please enter your name.");
      if (!district) return toast.error("Please select your district.");
    }
    if (currentStep === 2) {
      if (!village.trim()) return toast.error("Please enter your village name.");
    }
    setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function prevStep() {
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  function selectLanguage(lang) {
    setLanguage(lang);
  }

  function addCropTag(value) {
    const txt = String(value !== undefined ? value : cropInput).trim();
    if (!txt) return;
    // allow comma-separated input: split and add unique
    const parts = txt.split(",").map(p => p.trim()).filter(Boolean);
    setCrops(prev => {
      const newCrops = [...prev];
      parts.forEach(p => {
        if (!newCrops.includes(p)) newCrops.push(p);
      });
      return newCrops;
    });
    setCropInput("");
  }

  function removeCropTag(index) {
    setCrops((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCropKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCropTag();
    }
  }

  // full handleSubmit with auto-merge of typed cropInput
  async function handleSubmit(e) {
    e.preventDefault();
    console.log("handleSubmit called — currentStep:", currentStep);

    // If user typed something but didn't press Enter/comma, include it automatically
    const typed = String(cropInput || "").trim();
    let finalCrops = [...crops];
    if (typed) {
      const parts = typed.split(",").map(p => p.trim()).filter(Boolean);
      parts.forEach(p => { if (!finalCrops.includes(p)) finalCrops.push(p); });
      // update state so UI shows them as tags immediately
      setCrops(finalCrops);
      setCropInput("");
      console.log("Auto-added typed crops on submit:", parts);
    }

    // final validation (use finalCrops instead of crops)
    if (!name.trim() || !district || !village.trim()) {
      console.log("validation failed", { name, district, village });
      return toast.error("Please complete the form before submitting.");
    }
    if (finalCrops.length === 0) {
      console.log("no crops entered (after auto-merge)");
      return toast.warning("Please enter at least one crop.");
    }

    const payload = {
      name: name.trim(),
      district,
      village: village.trim(),
      preferred_language: language,
      crops: finalCrops.join(","),
      phone:  "+918767402938", // from zustand phone store
    };

    try {
      setSubmitting(true);
      // 1) save to local store
      try {
        setProfile(payload);
      } catch (err) {
        console.error("error saving to zustand:", err);
      }

      // 2) send to backend
      const url = `${API_BASE}/details/save`;
      console.log("Submitting payload to", url, payload);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include", // enable only if you need cookies/auth; ensure server CORS allows credentials
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.warn("Could not parse JSON response", err);
      }

      console.log("Server response:", res.status, data);

      if (res.ok) {
        toast.success(data.message || "Profile saved successfully!");
        // show success step
        setCurrentStep(TOTAL_STEPS + 1);
        // navigate after a short delay
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        toast.error(data.message || `Failed to save (${res.status})`);
      }
    } catch (err) {
      console.error("submit error", err);
      toast.error("Network error. Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="header">
          <h1>Agricultural Profile Setup</h1>
          <p>Help us understand your farming preferences</p>
        </div>

        <div className="progress-container">
          <div id="progress" className="progress-bar" />
        </div>

        <div className="step-indicator">
          <div className={`step-circle ${currentStep >= 1 ? "active" : ""}`}>1</div>
          <div className={`step-line ${currentStep > 1 ? "active" : ""}`} />
          <div className={`step-circle ${currentStep >= 2 ? "active" : ""}`}>2</div>
          <div className={`step-line ${currentStep > 2 ? "active" : ""}`} />
          <div className={`step-circle ${currentStep >= 3 ? "active" : ""}`}>3</div>
          <div className={`step-line ${currentStep > 3 ? "active" : ""}`} />
          <div className={`step-circle ${currentStep >= 4 ? "active" : ""}`}>4</div>
        </div>

        <form id="profile-form" className="form-container" onSubmit={handleSubmit}>
          {/* Step 1: Name + District */}
          {currentStep === 1 && (
            <div className="step active">
              <div className="illustration">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80" alt="District" />
              </div>

              <div className="input-group">
                <label htmlFor="name">Full name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div className="input-group">
                <label htmlFor="district">Select Your District</label>
                <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required>
                  <option value="">Select your district</option>
                  <option value="alappuzha">Alappuzha</option>
                  <option value="ernakulam">Ernakulam</option>
                  <option value="idukki">Idukki</option>
                  <option value="kannur">Kannur</option>
                  <option value="kasaragod">Kasaragod</option>
                  <option value="kollam">Kollam</option>
                  <option value="kottayam">Kottayam</option>
                  <option value="kozhikode">Kozhikode</option>
                  <option value="malappuram">Malappuram</option>
                  <option value="palakkad">Palakkad</option>
                  <option value="pathanamthitta">Pathanamthitta</option>
                  <option value="thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="thrissur">Thrissur</option>
                  <option value="wayanad">Wayanad</option>
                </select>
              </div>

              <div className="buttons">
                <div />
                <button type="button" className="btn btn-next" onClick={nextStep}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 2: Village */}
          {currentStep === 2 && (
            <div className="step active">
              <div className="illustration">
                <img src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=600&q=80" alt="Village" />
              </div>

              <div className="input-group">
                <label htmlFor="village">Enter Your Village Name</label>
                <input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Enter your village name" />
              </div>

              <div className="buttons">
                <button type="button" className="btn btn-prev" onClick={prevStep}>← Previous</button>
                <button type="button" className="btn btn-next" onClick={nextStep}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Language */}
          {currentStep === 3 && (
            <div className="step active">
              <div className="illustration">
                <img src="https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80" alt="Language" />
              </div>

              <div className="input-group">
                <label>Select Preferred Language</label>
                <div className="language-options">
                  <div className={`language-option ${language === "ml" ? "selected" : ""}`} onClick={() => selectLanguage("ml")}>
                    <i className="fas fa-language" />
                    <p>Malayalam</p>
                  </div>
                  <div className={`language-option ${language === "en" ? "selected" : ""}`} onClick={() => selectLanguage("en")}>
                    <i className="fas fa-globe" />
                    <p>English</p>
                  </div>
                </div>
              </div>

              <div className="buttons">
                <button type="button" className="btn btn-prev" onClick={prevStep}>← Previous</button>
                <button type="button" className="btn btn-next" onClick={nextStep}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 4: Crops */}
          {currentStep === 4 && (
            <div className="step active">
              <div className="illustration">
                <img src="https://images.unsplash.com/photo-1590172205847-aea2d5d8c1c2?auto=format&fit=crop&w=600&q=80" alt="Crops" />
              </div>

              <div className="input-group">
                <label htmlFor="crops">Enter Crops (press Enter or comma)</label>
                <div className="crop-input-row">
                  <input
                    id="crops"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    onKeyDown={handleCropKeyDown}
                    onBlur={() => addCropTag()}
                    placeholder="e.g. banana, tomato, rice"
                  />
                  <button type="button" className="btn btn-add" onClick={() => addCropTag()}>Add</button>
                </div>

                <div className="crops-tags" ref={cropsTagsRef}>
                  {crops.map((c, i) => (
                    <div className="crop-tag" key={i}>
                      {c} <i className="fas fa-times" onClick={() => removeCropTag(i)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="buttons">
                <button type="button" className="btn btn-prev" onClick={prevStep}>← Previous</button>
                <button type="submit" className="btn btn-submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Submit ✓"}
                </button>
              </div>
            </div>
          )}

          {/* Success message */}
          {currentStep === TOTAL_STEPS + 1 && (
            <div className="step active" id="success-message">
              <div className="success-message">
                <i className="fas fa-check-circle" />
                <h2>Profile Setup Complete!</h2>
                <p>Thank you — your agricultural profile has been saved.</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
