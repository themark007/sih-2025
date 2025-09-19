import React, { useState, useEffect } from "react";
import "./weather.css";

const API_BASE = "https://api.openweathermap.org/data/2.5";

export default function WeatherPage({ apiKey = process.env.REACT_APP_OWM_API_KEY }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [background, setBackground] = useState('default');
  const [expandedDetails, setExpandedDetails] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    updateBackground();
  }, [current]);

  const updateBackground = () => {
    if (!current) {
      setBackground('default');
      return;
    }
    
    const weatherMain = current.weather[0].main.toLowerCase();
    if (weatherMain.includes('cloud')) {
      setBackground('cloudy');
    } else if (weatherMain.includes('rain')) {
      setBackground('rainy');
    } else if (weatherMain.includes('clear')) {
      setBackground('sunny');
    } else if (weatherMain.includes('snow')) {
      setBackground('snowy');
    } else {
      setBackground('default');
    }
  };

  async function fetchWeatherByCoords(lat, lon) {
    if (!apiKey) return setError("No API key provided. Set REACT_APP_OWM_API_KEY or pass apiKey prop.");
    try {
      setLoading(true); setError(null);
      const curResp = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
      if (!curResp.ok) throw new Error("Failed to fetch current weather");
      const curData = await curResp.json();

      const fcResp = await fetch(`${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
      if (!fcResp.ok) throw new Error("Failed to fetch forecast");
      const fcData = await fcResp.json();

      setLocation(`${curData.name}, ${curData.sys?.country || ""}`);
      setCurrent(curData);
      setForecast(groupForecastByDay(fcData));
    } catch (e) {
      setError(e.message);
      setCurrent(null); setForecast([]);
    } finally { setLoading(false); }
  }

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query) return;
    if (!apiKey) return setError("No API key provided. Set REACT_APP_OWM_API_KEY or pass apiKey prop.");

    try {
      setLoading(true); setError(null);
      const curResp = await fetch(`${API_BASE}/weather?q=${encodeURIComponent(query)}&units=${unit}&appid=${apiKey}`);
      if (!curResp.ok) {
        const t = await curResp.json().catch(() => ({}));
        throw new Error(t.message || "City not found");
      }
      const curData = await curResp.json();
      const cityId = curData.id;
      const fcResp = await fetch(`${API_BASE}/forecast?id=${cityId}&units=${unit}&appid=${apiKey}`);
      if (!fcResp.ok) throw new Error("Failed to fetch forecast");
      const fcData = await fcResp.json();

      setLocation(`${curData.name}, ${curData.sys?.country || ""}`);
      setCurrent(curData);
      setForecast(groupForecastByDay(fcData));
    } catch (e) {
      setError(e.message);
      setCurrent(null); setForecast([]);
    } finally { setLoading(false); }
  }

  function groupForecastByDay(fcData) {
    if (!fcData || !fcData.list) return [];
    const dayMap = {};
    fcData.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dayMap[date]) dayMap[date] = [];
      dayMap[date].push(item);
    });

    return Object.keys(dayMap).slice(0, 5).map((date) => {
      const items = dayMap[date];
      const temps = items.map((i) => i.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const rep = items.find((it) => it.dt_txt.includes("12:00:00")) || items[Math.floor(items.length / 2)];
      return { date, min, max, icon: rep.weather?.[0]?.icon, desc: rep.weather?.[0]?.description };
    });
  }

  function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  // Re-fetch data when unit changes
  useEffect(() => {
    if (current) {
      const { coord } = current;
      fetchWeatherByCoords(coord.lat, coord.lon);
    }
  }, [unit]);

  return (
    <div className={`wp-container ${background}`}>
      <header className="wp-header">
        <h1>Weather</h1>
        <small className="wp-sub">Powered by OpenWeatherMap</small>
      </header>

      <form className="wp-search" onSubmit={handleSearch}>
        <input
          className="wp-input"
          placeholder="Enter city name (e.g. Mumbai)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn" type="submit">Search</button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigator.geolocation?.getCurrentPosition((pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude))}
        >Use my location</button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggleUnit}
        >Switch to {unit === 'metric' ? '°F' : '°C'}</button>
      </form>

      {loading && (
        <div className="wp-loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}
      {error && <div className="wp-error">{error}</div>}

      {current && (
        <section className="wp-current">
          <div className="wp-left">
            <div className="wp-place">{location}</div>
            <div className="wp-date">{formatDate(new Date())}</div>
          </div>
          <div className="wp-right">
            <div className="wp-temp">{Math.round(current.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</div>
            <div className="wp-feels">Feels like {Math.round(current.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</div>
            {current.weather?.[0] && (
              <div className="wp-weather">
                <img src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} alt="icon" />
                <div className="wp-desc">{current.weather[0].description}</div>
              </div>
            )}
          </div>

          <div className="wp-stats">
            <div>Humidity: {current.main.humidity}%</div>
            <div>Wind: {current.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</div>
            <div>Pressure: {current.main.pressure} hPa</div>
            <button 
              className="btn-more" 
              onClick={() => setExpandedDetails(!expandedDetails)}
            >
              {expandedDetails ? 'Less details' : 'More details'} ↓
            </button>
          </div>

          {expandedDetails && (
            <div className="wp-details-expanded">
              <div className="detail-item">
                <span className="detail-label">Sunrise:</span>
                <span className="detail-value">{formatTime(current.sys.sunrise)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sunset:</span>
                <span className="detail-value">{formatTime(current.sys.sunset)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Visibility:</span>
                <span className="detail-value">{(current.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cloudiness:</span>
                <span className="detail-value">{current.clouds.all}%</span>
              </div>
            </div>
          )}
        </section>
      )}

      {forecast && forecast.length > 0 && (
        <section className="wp-forecast">
          <h2>5-day forecast</h2>
          <div className="wp-forecast-grid">
            {forecast.map((d) => (
              <div key={d.date} className="wp-day">
                <div className="day-date">{formatDate(d.date)}</div>
                {d.icon && <img src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`} alt="icon" className="day-icon" />}
                <div className="day-desc">{d.desc}</div>
                <div className="day-temp">{Math.round(d.max)}° / {Math.round(d.min)}°</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!current && !loading && (
        <div className="wp-welcome">
          <h2>Welcome to Weather App</h2>
          <p>Search a city or use your location to see the weather forecast</p>
          <div className="weather-icons">
            <div className="weather-icon">☀️</div>
            <div className="weather-icon">🌧️</div>
            <div className="weather-icon">⛅</div>
            <div className="weather-icon">❄️</div>
          </div>
        </div>
      )}

      <footer className="wp-note">Note: For production, proxy API calls through your backend to keep the API key secret.</footer>
    </div>
  );
}