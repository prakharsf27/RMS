'use client';
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import styles from "./Modal.module.css";
import { Button } from "./Button";

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={cn(styles.modal, "animate-fade-in", className)} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </Button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};
