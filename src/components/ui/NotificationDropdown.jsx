'use client';
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, X, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "./NotificationDropdown.module.css";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export const NotificationDropdown = ({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close notifications">
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filterRow}>
        <button
          className={cn(styles.filterTab, filter === 'all' && styles.filterTabActive)}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={cn(styles.filterTab, filter === 'unread' && styles.filterTabActive)}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className={styles.list}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIconWrap}>
              <Bell size={22} className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyTitle}>All caught up</p>
            <span className={styles.emptySub}>No {filter === 'unread' ? 'unread' : 'new'} notifications right now</span>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification._id} 
              className={cn(styles.item, !notification.read && styles.unread)}
              onClick={() => onMarkAsRead(notification._id)}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.subject}>{notification.subject}</span>
                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className={styles.message}>{notification.message}</p>
                <div className={styles.sender}>— {notification.sender}</div>
              </div>
              {!notification.read && <div className={styles.indicator} />}
            </div>
          ))
        )}
      </div>

      <footer className={styles.footer}>
        <Link href="/notifications" onClick={onClose} className={styles.viewAllLink}>
          <span>Open Full Notification Center</span>
          <ArrowRight size={13} />
        </Link>
      </footer>
    </div>
  );
};
