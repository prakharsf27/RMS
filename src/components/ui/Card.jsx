import { cn } from "../../lib/utils";
import styles from "./Card.module.css";

export const Card = ({ className, children, glow, ...props }) => {
  return (
    <div
      className={cn(styles.card, glow && styles.glow, className)}
      {...props}
    >
      {children}
    </div>
  );
};
