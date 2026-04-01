import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import styles from "./TimePicker.module.css";

export const TimePicker = ({ value, onChange, label, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div 
        className={cn(styles.inputContainer, isOpen && styles.isOpen, error && styles.error)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className={styles.icon} size={18} />
        <span className={styles.value}>{value || "Select time..."}</span>
        <ChevronDown className={cn(styles.chevron, isOpen && styles.rotate)} size={16} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {times.map((t) => (
            <div 
              key={t} 
              className={cn(styles.option, value === t && styles.selected)}
              onClick={() => {
                onChange(t);
                setIsOpen(false);
              }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
