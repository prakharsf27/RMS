'use client';
import { cn } from "../../lib/utils";
import styles from "./Button.module.css";
import { Loader2 } from "lucide-react";

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className={styles.spinner} />}
      {children}
    </button>
  );
};
