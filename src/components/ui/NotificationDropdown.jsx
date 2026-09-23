'use client';
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, X, ArrowRight, ArrowUpRight, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getNotificationRoute } from "../../lib/notificationRoutes";
import styles from "./NotificationDropdown.module.css";
import { cn } from "../../lib/utils";

export const NotificationDropdown = ({ 
  notifications = [], 
  onMarkAsRead, 
  onClose 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isNotificationUnread = (n) => !n.read && !n.isRead;

  const unreadCount = notifications.filter(isNotificationUnread).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(isNotificationUnread)
    : notifications;

  const handleNotificationClick = async (notification, e) => {
    e.stopPropagation();
    
    // 1. Immediately mark as read optimistically
    if (isNotificationUnread(notification)) {
      onMarkAsRead?.(notification._id);
    }
    
    // 2. Close dropdown
    onClose?.();

    // 3. Resolve target destination & navigate
    const destination = getNotificationRoute(notification, user?.role);
    if (destination?.path) {
      router.push(destination.path);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={styles.dropdown} 
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Notifications popover"
    >
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={onClose} 
            className={styles.closeBtn} 
            aria-label="Close notifications popover"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filterRow}>
        <button
          type="button"
          className={cn(styles.filterTab, filter === 'all' && styles.filterTabActive)}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
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
          filteredNotifications.map(notification => {
            const destination = getNotificationRoute(notification, user?.role);
            const unread = isNotificationUnread(notification);
            const displayTitle = notification.subject || notification.title || "Notification";

            return (
              <div 
                key={notification._id} 
                className={cn(styles.item, unread && styles.unread)}
                onClick={(e) => handleNotificationClick(notification, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNotificationClick(notification, e);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${displayTitle}. Navigate to ${destination.label}`}
                title={`Click to open ${destination.label}`}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <span className={styles.subject}>{displayTitle}</span>
                    <span className={styles.time}>
                      {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : 'Recent'}
                    </span>
                  </div>
                  <p className={styles.message}>{notification.message}</p>
                  <div className={styles.footerRow}>
                    <span className={styles.sender}>— {notification.sender || 'TalentFlow'}</span>
                    <span className={styles.actionChip}>
                      <span>{destination.label}</span>
                      <ArrowUpRight size={11} />
                    </span>
                  </div>
                </div>
                {unread && <div className={styles.indicator} title="Unread" />}
              </div>
            );
          })
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
