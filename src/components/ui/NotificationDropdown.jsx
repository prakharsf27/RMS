import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, X } from "lucide-react";
import styles from "./NotificationDropdown.module.css";
import { Button } from "./Button";

export const NotificationDropdown = ({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3>Notifications</h3>
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount} new</span>}
        </div>
        <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
      </header>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={40} className={styles.emptyIcon} />
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
              onClick={() => onMarkAsRead(notification._id)}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.subject}>{notification.subject}</span>
                  <span className={styles.time}>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                </div>
                <p className={styles.message}>{notification.message}</p>
                <div className={styles.sender}>— {notification.sender}</div>
              </div>
              {!notification.read && <div className={styles.indicator} />}
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <footer className={styles.footer}>
          <Button variant="ghost" size="sm" style={{ width: '100%', fontSize: '0.8rem' }}>
            View All Activity
          </Button>
        </footer>
      )}
    </div>
  );
};
