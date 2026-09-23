'use client';
import { cn } from "../../lib/utils";
import styles from "./Tabs.module.css";

export const Tabs = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn(styles.tabsContainer, className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={cn(styles.tabBtn, isActive && styles.active)}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <tab.icon size={15} className={styles.tabIcon} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(styles.badge, isActive && styles.badgeActive)}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
