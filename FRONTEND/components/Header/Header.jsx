// components/Header/Header.js
import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png" alt="Farm Logo" />
        <h1>Farmer's Dashboard</h1>
      </div>
      <div className={styles.userInfo}>
        <span>Welcome, Mark</span>
        <div className={styles.profilePic}>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" />
        </div>
      </div>
    </header>
  );
};

export default Header;