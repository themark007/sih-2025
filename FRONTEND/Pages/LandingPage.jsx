import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
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
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <img src="https://images.unsplash.com/photo-1618588507085-c79565432917?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Digital Krishi Officer" />
            <span>Digital Krishi Officer</span>
          </div>
          <div className="nav-buttons">
            <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="signup-btn" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>AI-Powered Farming Assistance in <span className="highlight">Malayalam</span></h1>
          <p>Get expert agricultural advice through voice, text, or image uploads - all in your native language</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/signup')}>Get Started</button>
            <button className="cta-secondary" onClick={() => navigate('/login')}>Demo</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-cards">
            <div className="card card-1">
              <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Farming" />
              <p>Crop Health Analysis</p>
            </div>
            <div className="card card-2">
              <img src="https://images.unsplash.com/photo-1625246335525-6b52dec022bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Farming" />
              <p>Personalized Advice</p>
            </div>
            <div className="card card-3">
              <img src="https://images.unsplash.com/photo-1590172205846-6e9bb8ea1ed2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Farming" />
              <p>Disease Detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How Digital Krishi Officer Helps Farmers</h2>
        <div className="features-container">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${index === currentFeature ? 'active' : ''}`}
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
          {features.map((_, index) => (
            <button
              key={index}
              className={index === currentFeature ? 'active' : ''}
              onClick={() => setCurrentFeature(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Farmers Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User" />
            <p>"The voice feature in Malayalam has been a game changer for me. I can get advice without typing!"</p>
            <span>- Rajesh, Thrissur</span>
          </div>
          <div className="testimonial">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User" />
            <p>"Identified my rice disease accurately and suggested organic treatment that worked perfectly."</p>
            <span>- Sreedevi, Palakkad</span>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <h2>Ready to Transform Your Farming Experience?</h2>
        <p>Join thousands of farmers who are already using Digital Krishi Officer</p>
        <div className="cta-buttons">
          <button className="cta-primary" onClick={() => navigate('/signup')}>Sign Up Free</button>
          <button className="cta-secondary" onClick={() => navigate('/login')}>Login</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Digital Krishi Officer</h3>
            <p>AI-powered agricultural assistance for Malayalam-speaking farmers</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 Digital Krishi Officer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;