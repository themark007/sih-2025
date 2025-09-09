// components/FarmerInfo/FarmerInfo.js
import React from 'react';
import styles from './FarmerInfo.module.css';

const FarmerInfo = ({ farmer }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.cardHeader}>
        <h2>Farmer Information</h2>
        <div className={styles.decoration}>
          <img src="https://cdn-icons-png.flaticon.com/512/992/992001.png" alt="Farm" />
        </div>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Name:</span>
          <span className={styles.value}>{farmer.name}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>District:</span>
          <span className={styles.value}>{farmer.district}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Village:</span>
          <span className={styles.value}>{farmer.village}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Language:</span>
          <span className={styles.value}>{farmer.preferred_language}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Crops:</span>
          <span className={styles.value}>{farmer.crops}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Phone:</span>
          <span className={styles.value}>{farmer.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default FarmerInfo;