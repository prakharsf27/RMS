import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { CalendarCustom } from "./Calendar";
import styles from "./DatePicker.module.css";

export const DatePicker = ({ value, onChange, label, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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
        <Calendar className={styles.icon} size={18} />
        <span className={styles.value}>
          {value ? format(new Date(value), "PPP") : "Select date..."}
        </span>
        <ChevronDown className={cn(styles.chevron, isOpen && styles.rotate)} size={16} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <CalendarCustom 
            selected={value ? new Date(value) : null} 
            onSelect={(date) => {
              onChange(format(date, "yyyy-MM-dd"));
              setIsOpen(false);
            }} 
          />
        </div>
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
