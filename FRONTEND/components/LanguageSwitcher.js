// src/components/LanguageSwitcher.js
import React from "react";
import useProfileStore from "../src/store/profileStore";

const LanguageSwitcher = () => {
  const lang = useProfileStore((s) => s.lang);
  const setLang = useProfileStore((s) => s.setLang);

  return (
    <select value={lang} onChange={(e) => setLang(e.target.value)}>
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
      <option value="ml">മലയാളം</option>
      <option value="kn">ಕನ್ನಡ</option>
      <option value="te">తెలుగు</option>
      <option value="ta">தமிழ்</option>
    </select>
    
  );
};

export default LanguageSwitcher;
