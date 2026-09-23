'use client';
import { cn } from "../../lib/utils";
import styles from "./Badge.module.css";

export const Badge = ({ children, variant = "neutral", dot = true, size = "sm", className }) => {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
};
