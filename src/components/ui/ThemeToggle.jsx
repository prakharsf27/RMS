import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import styles from "./ThemeToggle.module.css";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={styles.toggle} 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className={styles.iconWrapper}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </div>
      <span className={styles.label}>
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
};
