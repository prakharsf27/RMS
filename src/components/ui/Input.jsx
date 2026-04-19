'use client';
import { cn } from "../../lib/utils";
import styles from "./Input.module.css";

export const Input = ({ className, label, error, icon: Icon, ...props }) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {Icon && <Icon className={styles.icon} size={18} />}
        <input
          className={cn(styles.input, Icon && styles.hasIcon, error && styles.error)}
          {...props}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
