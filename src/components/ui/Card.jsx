'use client';
import { cn } from "../../lib/utils";
import styles from "./Card.module.css";

export const Card = ({ className, children, glow, premium, ...props }) => {
  return (
    <div
      className={cn(
        styles.card, 
        glow && styles.glow, 
        premium && "hover-premium", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
