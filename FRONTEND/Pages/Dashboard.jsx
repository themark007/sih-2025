import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import FarmerInfo from "../components/FarmerInfo/FarmerInfo";
import ActionButtons from "../components/ActionButtons/ActionButtons";
import useProfileStore from "../src/store/profileStore";
import "./Dashboard.css";

const Dashboard = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [weatherData, setWeatherData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const error = useProfileStore((s) => s.error);
  const loadProfileFromPhone = useProfileStore((s) => s.loadProfileFromPhone);

  // Translations
  const translations = {
    en: {
      loading: "Loading profile...",
      error: "Error",
      noProfile: "No profile found. Please create one.",
      overview: "Overview",
      weather: "Weather",
      market: "Market Prices",
      tips: "Farming Tips",
      welcome: "Welcome back",
      todaysForecast: "Today's Forecast",
      marketPrices: "Current Market Prices",
      dailyTip: "Daily Farming Tip",
      viewDetails: "View Details",
      viewAllPrices: "View All Prices",
      nextTip: "Next Tip"
    },
    hi: {
      loading: "प्रोफाइल लोड हो रही है...",
      error: "त्रुटि",
      noProfile: "कोई प्रोफाइल नहीं मिली। कृपया एक बनाएं।",
      overview: "अवलोकन",
      weather: "मौसम",
      market: "बाजार कीमतें",
      tips: "कृषि सुझाव",
      welcome: "वापसी पर स्वागत है",
      todaysForecast: "आज का पूर्वानुमान",
      marketPrices: "वर्तमान बाजार कीमतें",
      dailyTip: "दैनिक कृषि सुझाव",
      viewDetails: "विवरण देखें",
      viewAllPrices: "सभी कीमतें देखें",
      nextTip: "अगला सुझाव"
    },
    ta: {
      loading: "சுயவிவரம் ஏற்றப்படுகிறது...",
      error: "பிழை",
      noProfile: "சுயவிவரம் கிடைக்கவில்லை. தயவு செய்து ஒன்றை உருவாக்கவும்.",
      overview: "மேலோட்டம்",
      weather: "வானிலை",
      market: "சந்தை விலைகள்",
      tips: "விவசாய உதவிக்குறிப்புகள்",
      welcome: "மீண்டும் வருக",
      todaysForecast: "இன்றைய வானிலை முன்னறிவிப்பு",
      marketPrices: "தற்போதைய சந்தை விலைகள்",
      dailyTip: "தினசரி விவசாய உதவிக்குறிப்பு",
      viewDetails: "விவரங்களைக் காண்க",
      viewAllPrices: "அனைத்து விலைகளையும் காண்க",
      nextTip: "அடுத்த உதவிக்குறிப்பு"
    },
    ml: {
      loading: "പ്രൊഫൈൽ ലോഡ് ചെയ്യുന്നു...",
      error: "പിശക്",
      noProfile: "പ്രൊഫൈൽ കണ്ടെത്താനായില്ല. ദയവായി ഒരു പ്രൊഫൈൽ സൃഷ്ടിക്കുക.",
      overview: "അവലോകനം",
      weather: "കാലാവസ്ഥ",
      market: "മാർക്കറ്റ് വിലകൾ",
      tips: "കൃഷി നുറുങ്ങുകൾ",
      welcome: "വീണ്ടും സ്വാഗതം",
      todaysForecast: "ഇന്നത്തെ കാലാവസ്ഥ",
      marketPrices: "നിലവിലെ മാർക്കറ്റ് വിലകൾ",
      dailyTip: "ദൈനംദിന കൃഷി നുറുങ്ങ്",
      viewDetails: "വിശദാംശങ്ങൾ കാണുക",
      viewAllPrices: "എല്ലാ വിലകളും കാണുക",
      nextTip: "അടുത്ത നുറുങ്ങ്"
    }
  };

  const t = translations[language];

  // Mock weather data
  const mockWeather = {
    temp: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    rainfall: "10%",
    icon: "⛅"
  };

  // Mock market data
  const mockMarket = [
    { crop: "Rice", price: "₹2,500", unit: "quintal", trend: "up" },
    { crop: "Wheat", price: "₹2,100", unit: "quintal", trend: "down" },
    { crop: "Tomato", price: "₹40", unit: "kg", trend: "up" }
  ];

  // Farming tips
  const farmingTips = [
    "Water your crops early in the morning to reduce evaporation loss.",
    "Rotate crops to maintain soil fertility and reduce pest buildup.",
    "Use organic fertilizers to improve long-term soil health.",
    "Monitor weather forecasts regularly to plan farming activities.",
    "Consider intercropping to maximize land use efficiency."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const phone = localStorage.getItem("phone");
    if (!profile && phone) {
      loadProfileFromPhone(phone);
    }

    // Set mock data with a delay to simulate loading
    const timer = setTimeout(() => {
      setWeatherData(mockWeather);
      setMarketData(mockMarket);
    }, 1500);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % farmingTips.length);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(tipInterval);
    };
  }, [profile, loadProfileFromPhone]);

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % farmingTips.length);
  };

  return (
    <div className="dashboard">
      <Header language={language} setLanguage={setLanguage} />
      
      <div className="dashboard-content">
        {/* Animated background elements */}
        <div className="background-elements">
          <div className="floating-icon">🌱</div>
          <div className="floating-icon">🌾</div>
          <div className="floating-icon">🌻</div>
          <div className="floating-icon">🚜</div>
        </div>

        {/* Welcome section with animation */}
        <div className="welcome-banner animate-slide-in">
          <h1>{t.welcome}{profile ? `, ${profile.name}` : ''}!</h1>
          <p>{new Date().toLocaleDateString(language, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t.overview}
          </button>
          <button 
            className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            {t.weather}
          </button>
          <button 
            className={`tab ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            {t.market}
          </button>
          <button 
            className={`tab ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            {t.tips}
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <div>{t.loading}</div>
          </div>
        ) : error ? (
          <div className="profile-error">
            {t.error}: {error}
          </div>
        ) : profile ? (
          <>
            <FarmerInfo farmer={profile} language={language} />
            <ActionButtons language={language} />
            
            {/* Dashboard Widgets */}
            <div className="dashboard-widgets">
              {/* Weather Widget */}
              <div className="widget weather-widget">
                <h3>{t.todaysForecast}</h3>
                <div className="weather-content">
                  <div className="weather-icon">{weatherData?.icon || '☀️'}</div>
                  <div className="weather-details">
                    <div className="temperature">{weatherData?.temp || '28'}°C</div>
                    <div className="condition">{weatherData?.condition || 'Sunny'}</div>
                    <div className="extra-details">
                      <span>💧 {weatherData?.humidity || '65'}%</span>
                      <span>🌧️ {weatherData?.rainfall || '10%'}</span>
                    </div>
                  </div>
                </div>
                <button className="widget-button">{t.viewDetails}</button>
              </div>

              {/* Market Prices Widget */}
              <div className="widget market-widget">
                <h3>{t.marketPrices}</h3>
                <div className="market-list">
                  {marketData ? (
                    marketData.map((item, index) => (
                      <div key={index} className="market-item">
                        <span className="crop-name">{item.crop}</span>
                        <span className={`price ${item.trend}`}>
                          {item.price}/{item.unit} 
                          {item.trend === 'up' ? ' ↗' : ' ↘'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="market-loading">Loading market data...</div>
                  )}
                </div>
                <button className="widget-button">{t.viewAllPrices}</button>
              </div>

              {/* Farming Tips Widget */}
              <div className="widget tips-widget">
                <h3>{t.dailyTip}</h3>
                <div className="tip-content">
                  <div className="tip-icon">💡</div>
                  <p className="tip-text">{farmingTips[currentTip]}</p>
                </div>
                <button className="widget-button" onClick={handleNextTip}>
                  {t.nextTip}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-profile">
            <p>{t.noProfile}</p>
            <ActionButtons language={language} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;