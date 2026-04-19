import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  BarChart,
  ShieldAlert,
  LogOut,
  Mail,
  Building,
  User,
  Sun,
  Moon,
  X,
  MessageSquare,
  Sparkles,
  Inbox,
  Video,
  Menu,
  Map
} from "lucide-react";

import styles from "./Sidebar.module.css";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("rms_theme") || "light");
  const [isCollapsed, setIsCollapsed] = useState(JSON.parse(localStorage.getItem("rms_sidebar_collapsed") || "false"));
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rms_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("rms_sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        const total = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadMessages(total);
      } catch (err) {
        console.error("Fetch unread messages error:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "recruiter", "candidate"] },
    { to: "/jobs", icon: Briefcase, label: "Jobs", roles: ["admin", "recruiter", "candidate"] },
    { to: "/company", icon: Building, label: "Company", roles: ["recruiter"] },
    { to: "/candidates", icon: Users, label: "Candidates", roles: ["admin", "recruiter"] },
    { to: "/applications", icon: FileText, label: "Applications", roles: ["admin", "recruiter", "candidate"] },
    { to: "/messages", icon: MessageSquare, label: "Messages", roles: ["admin", "recruiter", "candidate"], badge: unreadMessages },
    { to: "/resume-ai", icon: Sparkles, label: "Resume AI", roles: ["candidate"] },
    { to: "/recruiter-inbox", icon: Inbox, label: "ATS Validator", roles: ["candidate"] },
    { to: "/interview-simulator", icon: Video, label: "Mock Interview", roles: ["candidate"] },
    { to: "/career-path", icon: Map, label: "Career Path", roles: ["candidate"] },
    { to: "/interviews", icon: Calendar, label: "Interviews", roles: ["admin", "recruiter", "candidate"] },
    { to: "/reports", icon: BarChart, label: "Reports", roles: ["admin", "recruiter"] },
    { to: "/profile", icon: User, label: "Profile", roles: ["candidate"] }
  ];

  const allowedLinks = navLinks.filter(link => link.roles.includes(user.role));

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={cn(
      styles.sidebar, 
      isOpen && styles.open,
      isCollapsed && styles.collapsed
    )}>
      <div className={styles.logo}>
        <button 
           className={styles.collapseToggle} 
           onClick={() => setIsCollapsed(!isCollapsed)}
        >
           <Menu size={18} className={isCollapsed ? styles.rotated : ""} />
        </button>
        <div className={styles.logoIcon}>T</div>
        <span className={styles.logoText}>TalentFlow</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        {allowedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleNavClick}
            className={({ isActive }) => cn(styles.navItem, isActive && styles.active)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <link.icon size={20} />
              <span className={styles.linkText}>{link.label}</span>
            </div>
            {link.badge > 0 && (
              <span className={styles.navBadge}>{link.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.themeToggle} onClick={toggleTheme}>
           {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
           <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <div className={styles.userInfo}>
          <img src={user.avatar} alt="Avatar" className={styles.avatar} />
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user.fname} {user.lname}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
