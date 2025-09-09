// components/ActionButtons/ActionButtons.js
import React from "react";
import styles from "./ActionButtons.module.css";
import { useNavigate } from "react-router-dom";

const ActionButtons = () => {
  const navigate = useNavigate();

  const buttons = [
    {
      id: 1,
      title: "View History",
      icon: "https://cdn-icons-png.flaticon.com/512/2997/2997896.png",
      description: "Check your farming activities history",
      navi: "/history",
    },
    {
      id: 2,
      title: "Find Disease",
      icon: "https://cdn-icons-png.flaticon.com/512/2784/2784696.png",
      description: "Identify crop diseases and get solutions",
      navi: "/find-disease",
    },
    {
      id: 3,
      title: "Chat about Crop Health",
      icon: "https://cdn-icons-png.flaticon.com/512/3602/3602634.png",
      description: "Connect with agricultural experts",
      navi: "/chat",
    },
    {
      id: 4,
      title: "Raise a Ticket",
      icon: "https://cdn-icons-png.flaticon.com/512/1176/1176576.png",
      description: "Report issues and get support",
      navi: "/raise-ticket",
    },
    {
      id: 5,
      title: "Weather Forecast",
      icon: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
      description: "Check weather conditions for your farm",
      navi: "/weather",
    },
    {
      id: 6,
      title: "Market Prices",
      icon: "https://cdn-icons-png.flaticon.com/512/3448/3448598.png",
      description: "View current market prices for your crops",
      navi: "/market-prices",
    },
  ];

  function handleSubmit(navi) {
    // Defensive: if navi is falsy, do nothing
    if (!navi) return;
    navigate(navi);
  }

  return (
    <div className={styles.actionsContainer}>
      <h2>Quick Actions</h2>
      <div className={styles.buttonsGrid}>
        {buttons.map((button) => (
          <div key={button.id} className={styles.actionButton}>
            <div className={styles.iconContainer}>
              <img src={button.icon} alt={`${button.title} icon`} />
            </div>
            <h3>{button.title}</h3>
            <p>{button.description}</p>
            <div className={styles.buttonOverlay}>
              <button
                type="button"
                onClick={() => handleSubmit(button.navi)}
                aria-label={`Go to ${button.title}`}
              >
                Go
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
