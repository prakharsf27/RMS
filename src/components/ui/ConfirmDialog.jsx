'use client';
import { AlertTriangle, Trash2, XCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action may be irreversible.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'primary'
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className={styles.dialogModal}>
      <div className={styles.body}>
        <div className={`${styles.iconWrap} ${styles[variant]}`}>
          {variant === "danger" ? (
            <Trash2 size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>
        <div className={styles.textWrap}>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button 
          variant={variant === "danger" ? "danger" : "primary"} 
          size="md" 
          onClick={onConfirm} 
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
