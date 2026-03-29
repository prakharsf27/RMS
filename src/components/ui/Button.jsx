import { cn } from "../../lib/utils";
import styles from "./Button.module.css";

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) => {
  return (
    <button
      className={cn(styles.button, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
