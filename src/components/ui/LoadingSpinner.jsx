'use client';
import styles from "./LoadingSpinner.module.css";

export const LoadingSpinner = ({ size = "md", label = "Loading data..." }) => {
  const sizeClass = styles[size] || styles.md;
  
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
};
