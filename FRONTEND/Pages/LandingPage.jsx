import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [language, setLanguage] = useState("en");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const sectionRefs = useRef([]);

  const features = [
    {
      title: {
        en: "Voice Assistance in Malayalam",
        ml: "മലയാളത്തിൽ വോയ്സ് സഹായം"
      },
      description: {
        en: "Speak naturally in your language and get expert farming advice",
        ml: "നിങ്ങളുടെ ഭാഷയിൽ സ്വാഭാവികമായി സംസാരിച്ച് വിദഗ്ധ കൃഷി ഉപദേശം നേടുക"
      },
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
    },
    {
      title: {
        en: "Image-Based Diagnosis",
        ml: "ചിത്ര-അടിസ്ഥാനത്തിലുള്ള രോഗനിർണ്ണയം"
      },
      description: {
        en: "Upload photos of crops to identify diseases and get treatment advice",
        ml: "രോഗങ്ങൾ തിരിച്ചറിയാനും ചികിത്സാ ഉപദേശം നേടാനും വിളകളുടെ ഫോട്ടോകൾ അപ്ലോഡ് ചെയ്യുക"
      },
      image: "https://images.unsplash.com/photo-1591735179859-4b15a10c9313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      title: {
        en: "Personalized Recommendations",
        ml: "വ്യക്തിഗത ശുപാർശകൾ"
      },
      description: {
        en: "Get advice tailored to your specific crops, location, and conditions",
        ml: "നിങ്ങളുടെ നിർദ്ദിഷ്ട വിളകൾ, സ്ഥാനം, സാഹചര്യങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യമായ ഉപദേശം നേടുക"
      },
      image: "https://images.unsplash.com/photo-1625246335525-6b52dec022bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  ];

  const testimonials = [
    {
      name: { en: "Rajesh, Thrissur", ml: "രാജേഷ്, തൃശൂർ" },
      text: {
        en: "\"The voice feature in Malayalam has been a game changer for me. I can get advice without typing!\"",
        ml: "\"മലയാളത്തിലെ വോയ്‌സ് ഫീച്ചർ എനിക്ക് ഒരു ഗെയിം ചേഞ്ചറായിരുന്നു. ടൈപ്പ് ചെയ്യാതെ തന്നെ എനിക്ക് ഉപദേശം ലഭിക്കും!\""
      },
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      name: { en: "Sreedevi, Palakkad", ml: "ശ്രീദേവി, പാലക്കാട്" },
      text: {
        en: "\"Identified my rice disease accurately and suggested organic treatment that worked perfectly.\"",
        ml: "\"എന്റെ നെല്ലിന്റെ രോഗം കൃത്യമായി തിരിച്ചറിഞ്ഞ് തികഞ്ഞ ജൈവ ചികിത്സാ രീതി നിർദ്ദേശിച്ചു.\""
      },
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      name: { en: "Mohan, Kottayam", ml: "മോഹൻ, കോട്ടയം" },
      text: {
        en: "\"The personalized advice helped increase my coconut yield by 30% in just one season.\"",
        ml: "\"വ്യക്തിഗത ഉപദേശം ഒരു സീസണിൽ തന്നെ എന്റെ തേങ്ങയുടെ വിളവ് 30% വർദ്ധിപ്പിക്കാൻ സഹായിച്ചു.\""
      },
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Animation for sections on scroll
      sectionRefs.current.forEach((section) => {
        if (section) {
          const sectionTop = section.getBoundingClientRect().top;
          const sectionVisible = 150;
          if (sectionTop < window.innerHeight - sectionVisible) {
            section.classList.add('active');
          }
        }
      });
    };

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    window.addEventListener('scroll', handleScroll);
    
    // Trigger once on mount to check initial positions
    handleScroll();

    return () => {
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [features.length, testimonials.length]);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="logo">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png"
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
      <section className="hero" ref={el => sectionRefs.current[0] = el}>
        <div className="hero-content">
          <h1>
            {language === "en" 
              ? <>AI-Powered Farming Assistance in <span className="highlight">Malayalam</span></>
              : <>കൃഷിക്കാർക്ക് <span className="highlight">മലയാളത്തിൽ</span> എ.ഐ അടിസ്ഥാനത്തിലുള്ള സഹായം</>
            }
          </h1>
          <p>
            {language === "en" 
              ? "Get expert agricultural advice through voice, text, or image uploads - all in your native language"
              : "ശബ്ദം, എഴുത്ത്, അല്ലെങ്കിൽ ചിത്രം അപ്‌ലോഡ് ചെയ്ത് വിദഗ്ധ കാർഷിക ഉപദേശം സ്വന്തമാക്കൂ"
            }
          </p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate("/signup")}>
              {language === "en" ? "Get Started" : "തുടങ്ങൂ"}
            </button>
            <button className="cta-secondary" onClick={() => navigate("/login")}>
              {language === "en" ? "Try Demo" : "ഡെമോ പരീക്ഷിക്കുക"}
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-cards">
            <div className="card card-1">
              <img
                src="https://images.unsplash.com/photo-1625246335525-6b52dec022bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Farming"
              />
              <p>{language === "en" ? "Crop Health Analysis" : "വിള ആരോഗ്യ പരിശോധന"}</p>
            </div>
            <div className="card card-2">
              <img
                src="https://images.unsplash.com/photo-1591735179859-4b15a10c9313?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Farming"
              />
              <p>{language === "en" ? "Personalized Advice" : "വ്യക്തിഗത ഉപദേശം"}</p>
            </div>
            <div className="card card-3">
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Farming"
              />
              <p>{language === "en" ? "Disease Detection" : "രോഗ നിർണയം"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" ref={el => sectionRefs.current[1] = el}>
        <h2>
          {language === "en"
            ? "How Digital Krishi Officer Helps Farmers"
            : "ഡിജിറ്റൽ കൃഷി ഓഫീസർ കർഷകർക്ക് എങ്ങനെ സഹായിക്കുന്നു"}
        </h2>

        <div className="features-container">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${
                index === currentFeature ? "active" : ""
              }`}
            >
              <div className="feature-image">
                <img src={feature.image} alt={feature.title[language]} />
                <div className="feature-overlay"></div>
              </div>
              <div className="feature-content">
                <h3>{feature.title[language]}</h3>
                <p>{feature.description[language]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="feature-indicators">
          {features.map((_, index) => (
            <button
              key={index}
              className={index === currentFeature ? "active" : ""}
              onClick={() => setCurrentFeature(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" ref={el => sectionRefs.current[2] = el}>
        <h2>{language === "en" ? "How It Works" : "എങ്ങനെ പ്രവർത്തിക്കുന്നു"}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            </div>
            <h3>{language === "en" ? "Ask Your Question" : "നിങ്ങളുടെ ചോദ്യം ചോദിക്കുക"}</h3>
            <p>
              {language === "en" 
                ? "Use voice, text, or upload an image of your crop issue in Malayalam"
                : "വോയ്സ്, ടെക്സ്റ്റ് അല്ലെങ്കിൽ വിളയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്ത് പ്രശ്നം പങ്കിടുക"
              }
            </p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
              </svg>
            </div>
            <h3>{language === "en" ? "AI Analysis" : "AI വിശകലനം"}</h3>
            <p>
              {language === "en" 
                ? "Our system analyzes your query using advanced AI models"
                : "നമ്മുടെ സിസ്റ്റം നിങ്ങളുടെ ചോദ്യം പുരോഗമിച്ച AI മോഡലുകൾ ഉപയോഗിച്ച് വിശകലനം ചെയ്യുന്നു"
              }
            </p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>{language === "en" ? "Get Expert Advice" : "വിദഗ്ദ്ധരുടെ ഉപദേശം നേടുക"}</h3>
            <p>
              {language === "en" 
                ? "Receive actionable, personalized recommendations for your farm"
                : "നിങ്ങളുടെ ഫാമിന് അനുയോജ്യമായ പ്രവർത്തനപരമായ, വ്യക്തിഗത ശുപാർശകൾ ലഭിക്കും"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" ref={el => sectionRefs.current[3] = el}>
        <div className="testimonials-header">
          <h2>{language === "en" ? "What Farmers Say" : "കർഷകർ പറയുന്നത്"}</h2>
          <p>{language === "en" ? "Hear from farmers across Kerala" : "കേരളത്തിലെ കർഷകരിൽ നിന്നുള്ള അഭിപ്രായങ്ങൾ"}</p>
        </div>
        <div className="testimonial-container">
          <div className="testimonial-track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-slide">
                <div className="testimonial">
                  <div className="testimonial-image">
                    <img src={testimonial.image} alt={testimonial.name[language]} />
                    <div className="testimonial-overlay"></div>
                  </div>
                  <div className="testimonial-content">
                    <p>{testimonial.text[language]}</p>
                    <span>{testimonial.name[language]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="testimonial-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={index === activeTestimonial ? "active" : ""}
              onClick={() => setActiveTestimonial(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta" ref={el => sectionRefs.current[4] = el}>
        <div className="cta-content">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" ref={el => sectionRefs.current[5] = el}>
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png"
                alt="Digital Krishi Officer"
              />
              <h3>Digital Krishi Officer</h3>
            </div>
            <p>
              {language === "en"
                ? "AI-powered agricultural assistance for Malayalam-speaking farmers"
                : "മലയാളം സംസാരിക്കുന്ന കർഷകർക്ക് വേണ്ടി AI അടിസ്ഥാനമാക്കിയ കാർഷിക സഹായം"}
            </p>
            <div className="social-icons">
              <a href="#facebook" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#twitter" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#instagram" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>{language === "en" ? "Quick Links" : "പെട്ടെന്ന് എത്തിച്ചേരുക"}</h4>
            <ul>
              <li>
                <a href="#features">{language === "en" ? "Features" : "സവിശേഷതകൾ"}</a>
              </li>
              <li>
                <a href="#how-it-works">{language === "en" ? "How It Works" : "എങ്ങനെ പ്രവർത്തിക്കുന്നു"}</a>
              </li>
              <li>
                <a href="#testimonials">{language === "en" ? "Testimonials" : "അഭിപ്രായങ്ങൾ"}</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{language === "en" ? "Support" : "സപ്പോർട്ട്"}</h4>
            <ul>
              <li>
                <a href="#help">{language === "en" ? "Help Center" : "സഹായ കേന്ദ്രം"}</a>
              </li>
              <li>
                <a href="#contact">{language === "en" ? "Contact Us" : "ഞങ്ങളെ ബന്ധപ്പെടുക"}</a>
              </li>
              <li>
                <a href="#faq">{language === "en" ? "FAQs" : "പതിവുചോദ്യങ്ങൾ"}</a>
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