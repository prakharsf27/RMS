'use client';
import { Inbox } from "lucide-react";
import { Button } from "./Button";
import styles from "./EmptyState.module.css";
import { cn } from "../../lib/utils";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "Get started by adding your first entry or adjust your search filters.",
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.iconCircle}>
        <Icon size={28} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className={styles.cta}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
