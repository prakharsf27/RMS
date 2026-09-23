'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
;
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import styles from "./AppLayout.module.css";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "../ui/Input";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { AIWidget } from "../ui/AIWidget";


export const AppLayout = ({ children, noPadding = false }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read && !n.isRead).length);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Click outside to close notification dropdown
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleMarkAsRead = async (id) => {
    // Immediate optimistic UI update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.put(`/notifications/${id}/read`).catch(() => api.put(`/notifications/${id}`));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={styles.main}>
        <header className={styles.header}>
          {/* Hamburger button — visible on mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className={styles.searchBar}>
            <Input icon={Search} placeholder="Search jobs, candidates..." className={styles.searchInput} />
          </div>

          <div className={styles.actions}>
            <span className={styles.rolePill}>
              {user.role === 'admin' ? 'Admin Console' : user.role === 'recruiter' ? 'Recruiter ATS' : 'Candidate Portal'}
            </span>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                className={styles.iconBtn} 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>
              
              {showNotifications && (
                <NotificationDropdown 
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            <button 
              className={styles.userBtn}
              onClick={() => router.push('/profile')}
              title="View profile settings"
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fname || 'user'}`}
                alt=""
                className={styles.headerAvatar}
              />
              <span className={styles.headerUserName}>{user.fname}</span>
            </button>
          </div>
        </header>

        <div className={`${styles.content} ${noPadding ? styles.noPadding : ''}`}>
          {children}
        </div>
        <AIWidget />
      </main>
    </div>
  );
};

