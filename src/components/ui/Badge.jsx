'use client';
import { cn } from "../../lib/utils";
import styles from "./Badge.module.css";

export const Badge = ({ children, variant = "info", className }) => {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
};
