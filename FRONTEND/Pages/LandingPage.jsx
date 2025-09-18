import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [language, setLanguage] = useState("en");
  const [isScrolled, setIsScrolled] = useState(false);

  const features = [
    {
      title: "Voice Assistance in Malayalam",
      description: "Speak naturally in your language and get expert farming advice",
      image: "https://images.unsplash.com/photo-1586769852044-692b6e5f5e13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Image-Based Diagnosis",
      description: "Upload photos of crops to identify diseases and get treatment advice",
      image: "https://images.unsplash.com/photo-1590172205846-6e9bb8ea1ed2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Personalized Recommendations",
      description: "Get advice tailored to your specific crops, location, and conditions",
      image: "https://images.unsplash.com/photo-1625246335525-6b52dec022bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(featureInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [features.length]);

  return (
    <div className="landing-page">
      /* Navigation */
<nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
  <div className="nav-container">
    <div className="logo">
      <img
        src="https://images.unsplash.com/photo-1618588507085-c79565432917?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        alt="Digital Krishi Officer"
      />
      <span>
        {language === "en" ? "Digital Krishi Officer" : "ഡിജിറ്റൽ കൃഷി ഓഫീസർ"}
      </span>
    </div>
    <div className="nav-buttons">
      <button className="login-btn" onClick={() => navigate("/login")}>
        {language === "en" ? "Login" : "ലോഗിൻ"}
      </button>
      <button className="signup-btn" onClick={() => navigate("/signup")}>
        {language === "en" ? "Sign Up" : "സൈൻ അപ്പ്"}
      </button>
      <select
        className="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ml">Malayalam</option>
      </select>
    </div>
  </div>
</nav>


      {/* Hero Section */}
<section className="hero">
  {language === "en" ? (
    <div className="hero-content">
      <h1>
        AI-Powered Farming Assistance in{" "}
        <span className="highlight">English</span>
      </h1>
      <p>
        Get expert agricultural advice through voice, text, or image uploads -
        all in your native language
      </p>
      <div className="cta-buttons">
        <button className="cta-primary" onClick={() => navigate("/signup")}>
          Get Started
        </button>
        <button className="cta-secondary" onClick={() => navigate("/login")}>
          Demo
        </button>
      </div>
    </div>
  ) : (
    <div className="hero-content">
      <h1>
        കൃഷിക്കാർക്ക് എ.ഐ അടിസ്ഥാനത്തിലുള്ള സഹായം{" "}
        <span className="highlight">മലയാളത്തിൽ</span>
      </h1>
      <p>
        ശബ്ദം, എഴുത്ത്, അല്ലെങ്കിൽ ചിത്രം അപ്‌ലോഡ് ചെയ്ത് വിദഗ്ധ
        കാർഷിക ഉപദേശം സ്വന്തമാക്കൂ
      </p>
      <div className="cta-buttons">
        <button className="cta-primary" onClick={() => navigate("/signup")}>
          തുടങ്ങൂ
        </button>
        <button className="cta-secondary" onClick={() => navigate("/login")}>
          ഡെമോ
        </button>
      </div>
    </div>
  )}

  <div className="hero-visual">
    <div className="floating-cards">
      <div className="card card-1">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          alt="Farming"
        />
        <p>{language === "en" ? "Crop Health Analysis" : "വിള ആരോഗ്യ പരിശോധന"}</p>
      </div>
      <div className="card card-2">
        <img
          src="https://images.unsplash.com/photo-1625246335525-6b52dec022bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          alt="Farming"
        />
        <p>{language === "en" ? "Personalized Advice" : "വ്യക്തിഗത ഉപദേശം"}</p>
      </div>
      <div className="card card-3">
        <img
          src="https://images.unsplash.com/photo-1590172205846-6e9bb8ea1ed2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          alt="Farming"
        />
        <p>{language === "en" ? "Disease Detection" : "രോഗ നിർണയം"}</p>
      </div>
    </div>
  </div>
</section>


      {/* Features Section */}
<section className="features">
  <h2>
    {language === "en"
      ? "How Digital Krishi Officer Helps Farmers"
      : "ഡിജിറ്റൽ കൃഷി ഓഫീസർ കർഷകർക്ക് എങ്ങനെ സഹായിക്കുന്നു"}
  </h2>

  <div className="features-container">
    {(language === "en"
      ? features
      : [
          {
            image: "https://via.placeholder.com/300",
            title: "വിളാരോഗ്യ വിശകലനം",
            description: "ചിത്രം അപ്‌ലോഡ് ചെയ്ത് വിളയുടെ ആരോഗ്യനില കണ്ടെത്താം",
          },
          {
            image: "https://via.placeholder.com/300",
            title: "വ്യക്തിഗത ഉപദേശം",
            description: "നിങ്ങളുടെ സ്ഥലത്തിനും വിളയ്ക്കും അനുയോജ്യമായ കാർഷിക ഉപദേശം",
          },
          {
            image: "https://via.placeholder.com/300",
            title: "രോഗ നിർണയം",
            description: "വിളകളിലെ രോഗങ്ങൾ കണ്ടെത്തി ശരിയായ പരിഹാരം നിർദ്ദേശിക്കുന്നു",
          },
        ]
    ).map((feature, index) => (
      <div
        key={index}
        className={`feature-card ${
          index === currentFeature ? "active" : ""
        }`}
      >
        <div className="feature-image">
          <img src={feature.image} alt={feature.title} />
        </div>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
    ))}
  </div>

  <div className="feature-indicators">
    {(language === "en" ? features : [1, 2, 3]).map((_, index) => (
      <button
        key={index}
        className={index === currentFeature ? "active" : ""}
        onClick={() => setCurrentFeature(index)}
      ></button>
    ))}
  </div>
</section>


      {/* How It Works Section */}
<section className="how-it-works">
  <h2>{language === "en" ? "How It Works" : "എങ്ങനെ പ്രവർത്തിക്കുന്നു"}</h2>
  <div className="steps">
    {language === "en" ? (
      <>
        <div className="step">
          <div className="step-number">1</div>
          <h3>Ask Your Question</h3>
          <p>Use voice, text, or upload an image of your crop issue in Malayalam</p>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <h3>AI Analysis</h3>
          <p>Our system analyzes your query using advanced AI models</p>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <h3>Get Expert Advice</h3>
          <p>Receive actionable, personalized recommendations for your farm</p>
        </div>
      </>
    ) : (
      <>
        <div className="step">
          <div className="step-number">1</div>
          <h3>നിങ്ങളുടെ ചോദ്യം ചോദിക്കുക</h3>
          <p>വോയ്സ്, ടെക്സ്റ്റ് അല്ലെങ്കിൽ വിളയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്ത് പ്രശ്നം പങ്കിടുക</p>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <h3>AI വിശകലനം</h3>
          <p>നമ്മുടെ സിസ്റ്റം നിങ്ങളുടെ ചോദ്യം പുരോഗമിച്ച AI മോഡലുകൾ ഉപയോഗിച്ച് വിശകലനം ചെയ്യുന്നു</p>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <h3>വിദഗ്ദ്ധരുടെ ഉപദേശം നേടുക</h3>
          <p>നിങ്ങളുടെ ഫാമിന് അനുയോജ്യമായ പ്രവർത്തനപരമായ, വ്യക്തിഗത ശുപാർശകൾ ലഭിക്കും</p>
        </div>
      </>
    )}
  </div>
</section>


      {/* Testimonials Section */}
<section className="testimonials">
  <h2>{language === "en" ? "What Farmers Say" : "കർഷകർ പറയുന്നത്"}</h2>
  <div className="testimonial-cards">
    {language === "en" ? (
      <>
        <div className="testimonial">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="User"
          />
          <p>
            "The voice feature in Malayalam has been a game changer for me. I
            can get advice without typing!"
          </p>
          <span>- Rajesh, Thrissur</span>
        </div>
        <div className="testimonial">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="User"
          />
          <p>
            "Identified my rice disease accurately and suggested organic
            treatment that worked perfectly."
          </p>
          <span>- Sreedevi, Palakkad</span>
        </div>
      </>
    ) : (
      <>
        <div className="testimonial">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="User"
          />
          <p>
            "മലയാളത്തിൽ ഉള്ള വോയ്സ് ഫീച്ചർ എനിക്ക് വലിയ സഹായമായി. ഇനി ടൈപ്പ്
            ചെയ്യാതെ തന്നെ ഉപദേശം ലഭിക്കുന്നു!"
          </p>
          <span>- രാജേഷ്, തൃശൂർ</span>
        </div>
        <div className="testimonial">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="User"
          />
          <p>
            "എന്റെ നെല്ലിലെ രോഗം കൃത്യമായി കണ്ടെത്തി, വളരെ ഫലപ്രദമായ ഓർഗാനിക്
            ചികിത്സ നിർദ്ദേശിച്ചു."
          </p>
          <span>- ശ്രീദേവി, പാലക്കാട്</span>
        </div>
      </>
    )}
  </div>
</section>

      {/* Final CTA Section */}
<section className="final-cta">
  <h2>
    {language === "en"
      ? "Ready to Transform Your Farming Experience?"
      : "നിങ്ങളുടെ കൃഷി അനുഭവം മാറ്റത്തിന് തയ്യാറാണോ?"}
  </h2>
  <p>
    {language === "en"
      ? "Join thousands of farmers who are already using Digital Krishi Officer"
      : "ഇപ്പോൾ തന്നെ ഡിജിറ്റൽ കൃഷി ഓഫീസർ ഉപയോഗിക്കുന്ന ആയിരക്കണക്കിന് കർഷകരിൽ ചേരൂ"}
  </p>
  <div className="cta-buttons">
    <button className="cta-primary" onClick={() => navigate("/signup")}>
      {language === "en" ? "Sign Up Free" : "സൗജന്യമായി സൈൻ അപ്പ് ചെയ്യുക"}
    </button>
    <button className="cta-secondary" onClick={() => navigate("/login")}>
      {language === "en" ? "Login" : "ലോഗിൻ"}
    </button>
  </div>
</section>


      {/* Footer */}
<footer className="footer">
  <div className="footer-content">
    <div className="footer-section">
      <h3>Digital Krishi Officer</h3>
      <p>
        {language === "en"
          ? "AI-powered agricultural assistance for Malayalam-speaking farmers"
          : "മലയാളം സംസാരിക്കുന്ന കർഷകർക്ക് വേണ്ടി AI അടിസ്ഥാനമാക്കിയ കാർഷിക സഹായം"}
      </p>
    </div>

    <div className="footer-section">
      <h4>{language === "en" ? "Quick Links" : "പെട്ടെന്ന് എത്തിച്ചേരുക"}</h4>
      <ul>
        <li>
          <a href="#about">{language === "en" ? "About" : "ഞങ്ങളേക്കുറിച്ച്"}</a>
        </li>
        <li>
          <a href="#features">{language === "en" ? "Features" : "സവിശേഷതകൾ"}</a>
        </li>
        <li>
          <a href="#contact">{language === "en" ? "Contact" : "ബന്ധപ്പെടുക"}</a>
        </li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>{language === "en" ? "Legal" : "നിയമപരമായ"}</h4>
      <ul>
        <li>
          <a href="#privacy">
            {language === "en" ? "Privacy Policy" : "സ്വകാര്യതാ നയം"}
          </a>
        </li>
        <li>
          <a href="#terms">
            {language === "en" ? "Terms of Service" : "സേവന നിബന്ധനകൾ"}
          </a>
        </li>
      </ul>
    </div>
  </div>

  <div className="footer-bottom">
    <p>
      {language === "en"
        ? "© 2023 Digital Krishi Officer. All rights reserved."
        : "© 2023 ഡിജിറ്റൽ കൃഷി ഓഫീസർ. എല്ലാ അവകാശങ്ങളും സംരക്ഷിതമാണ്."}
    </p>
  </div>
</footer>

    </div>
  );
};

export default LandingPage;