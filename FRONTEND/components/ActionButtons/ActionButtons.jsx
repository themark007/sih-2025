// components/ActionButtons/ActionButtons.js
import React, { useState, useEffect } from "react";
import styles from "./ActionButtons.module.css";
import { useNavigate } from "react-router-dom";

const ActionButtons = () => {
  const navigate = useNavigate();
  
  // Get language from localStorage, default to 'en'
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  // Optional: if language can change dynamically elsewhere, listen for storage events
  useEffect(() => {
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem("language") || "en");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const buttons = [
    {
      id: 1,
      title: { en: "View History", ml: "ചരിത്രം കാണുക" },
      icon: "https://cdn-icons-png.flaticon.com/512/2997/2997896.png",
      description: { en: "Check your farming activities history", ml: "നിങ്ങളുടെ കൃഷി പ്രവർത്തനങ്ങളുടെ ചരിത്രം പരിശോധിക്കുക" },
      navi: "/history",
    },
    {
  id: 2,
  title: { en: "Find Disease", ml: "രോഗം കണ്ടെത്തുക" },
  icon: "https://cdn-icons-png.flaticon.com/512/2784/2784696.png",
  description: { en: "Identify crop diseases and get solutions", ml: "വിളയിലെ രോഗങ്ങൾ തിരിച്ചറിയുകയും പരിഹാരങ്ങൾ ലഭിക്കുകയും ചെയ്യുക" },
  navi: "/find-disease",
},
    {
      id: 3,
      title: { en: "Chat about Crop Health", ml: "വിളാരോഗ്യത്തെക്കുറിച്ച് ചാറ്റ് ചെയ്യുക" },
      icon: "https://cdn-icons-png.flaticon.com/512/3602/3602634.png",
      description: { en: "Connect with agricultural experts", ml: "കൃഷി വിദഗ്ധരുമായി ബന്ധപ്പെടുക" },
      navi: "/chat",
    },
    {
      id: 4,
      title: { en: "Raise a Ticket", ml: "ടിക്കറ്റ് നൽകുക" },
      icon: "https://cdn-icons-png.flaticon.com/512/1176/1176576.png",
      description: { en: "Report issues and get support", ml: "പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്ത് സഹായം നേടുക" },
      navi: "/raise-ticket",
    },
    {
      id: 5,
      title: { en: "Weather Forecast", ml: "കാലാവസ്ഥ പ്രവചനം" },
      icon: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
      description: { en: "Check weather conditions for your farm", ml: "നിങ്ങളുടെ കൃഷിയിടത്തിനുള്ള കാലാവസ്ഥാ നില പരിശോധിക്കുക" },
      navi: "/weather",
    },
    {
      id: 6,
      title: { en: "Market Prices", ml: "മാർക്കറ്റ് വിലകൾ" },
      icon: "https://cdn-icons-png.flaticon.com/512/3448/3448598.png",
      description: { en: "View current market prices for your crops", ml: "നിങ്ങളുടെ വിളകളുടെ നിലവിലെ വിപണി വിലകൾ കാണുക" },
      navi: "/market-prices",
    },
  ];

  function handleSubmit(navi) {
    if (!navi) return;
    navigate(navi);
  }

  return (
    <div className={styles.actionsContainer}>
      <h2>{language === "en" ? "Quick Actions" : "പെട്ടെന്ന് ചെയ്യുന്ന പ്രവർത്തനങ്ങൾ"}</h2>
      <div className={styles.buttonsGrid}>
        {buttons.map((button) => (
          <div key={button.id} className={styles.actionButton}>
            <div className={styles.iconContainer}>
              <img src={button.icon} alt={`${button.title[language]} icon`} />
            </div>
            <h3>{button.title[language]}</h3>
            <p>{button.description[language]}</p>
            <div className={styles.buttonOverlay}>
              <button
                type="button"
                onClick={() => handleSubmit(button.navi)}
                aria-label={`Go to ${button.title[language]}`}
              >
                {language === "en" ? "Go" : "പോകുക"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
