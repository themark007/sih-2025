// components/Header/Header.js
import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";

const Header = () => {
  // Load language from localStorage or default to 'en'
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  // Update localStorage whenever language changes and reload page
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    // Reload page to reflect language change globally
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png"
          alt="Farm Logo"
        />
        <h1>
          {language === "en" ? "Farmer's Dashboard" : "കർഷകന്റെ ഡാഷ്ബോർഡ്"}
        </h1>
      </div>

      <div className={styles.userInfo}>
        <span>{language === "en" ? "Welcome, Mark" : "സ്വാഗതം, മാർക്ക്"}</span>
        <div className={styles.profilePic}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
          />
        </div>

        {/* Language Selector */}
        <select
          className="language-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="ml">Malayalam</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
