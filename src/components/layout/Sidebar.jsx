'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../lib/api";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  BarChart3,
  ShieldAlert,
  LogOut,
  Building,
  User,
  Sun,
  Moon,
  X,
  MessageSquare,
  Sparkles,
  Inbox,
  Video,
  ChevronLeft,
  ChevronRight,
  Map,
  Shield,
  Layers,
  Compass
} from "lucide-react";
import styles from "./Sidebar.module.css";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rms_sidebar_collapsed");
      if (saved) setIsCollapsed(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("rms_sidebar_collapsed", JSON.stringify(next));
    } catch (e) {}
  };

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        const total = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadMessages(total);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    // Core
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "recruiter", "candidate"] },
    
    // Candidate Workflow
    { href: "/jobs", icon: Briefcase, label: "Browse Jobs", roles: ["candidate"] },
    { href: "/applications", icon: Layers, label: "Application Tracker", roles: ["candidate"] },
    { href: "/resume-ai", icon: Sparkles, label: "Resume AI", roles: ["candidate"] },
    { href: "/recruiter-inbox", icon: Inbox, label: "ATS Checker", roles: ["candidate"] },
    { href: "/interview-simulator", icon: Video, label: "Mock Interview", roles: ["candidate"] },
    { href: "/career-path", icon: Compass, label: "Career Path", roles: ["candidate"] },
    { href: "/interviews", icon: Calendar, label: "My Interviews", roles: ["candidate"] },
    { href: "/messages", icon: MessageSquare, label: "Messages", roles: ["candidate"], badge: unreadMessages },
    { href: "/profile", icon: User, label: "Profile", roles: ["candidate"] },

    // Recruiter Workflow
    { href: "/candidates", icon: Users, label: "Candidates", roles: ["recruiter"] },
    { href: "/jobs", icon: Briefcase, label: "Job Postings", roles: ["recruiter"] },
    { href: "/applications", icon: Layers, label: "Hiring Pipeline", roles: ["recruiter"] },
    { href: "/interviews", icon: Calendar, label: "Interviews", roles: ["recruiter"] },
    { href: "/messages", icon: MessageSquare, label: "Messages", roles: ["recruiter"], badge: unreadMessages },
    { href: "/company", icon: Building, label: "Company Profile", roles: ["recruiter"] },
    { href: "/reports", icon: BarChart3, label: "Reports & Analytics", roles: ["recruiter"] },

    // Admin Workflow
    { href: "/candidates", icon: Users, label: "User Management", roles: ["admin"] },
    { href: "/jobs", icon: Briefcase, label: "Platform Jobs", roles: ["admin"] },
    { href: "/verification", icon: ShieldAlert, label: "Company Verification", roles: ["admin"] },
    { href: "/audit", icon: Shield, label: "Security & Audit Logs", roles: ["admin"] },
    { href: "/reports", icon: BarChart3, label: "Platform Reports", roles: ["admin"] },
  ];

  const allowedLinks = navLinks.filter(link => link.roles.includes(user?.role));

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const getRoleDisplayName = (r) => {
    if (r === 'candidate') return 'Candidate';
    if (r === 'recruiter') return 'Recruiter';
    if (r === 'admin') return 'Admin';
    return r;
  };

  return (
    <>
      <aside className={cn(
        styles.sidebar, 
        isOpen && styles.open,
        isCollapsed && styles.collapsed
      )}>
        {/* Brand Header */}
        <div className={styles.logo}>
          <Link href="/dashboard" className={styles.brandLink}>
            <div className={styles.brandIcon}>
              <span className={styles.brandLetter}>T</span>
              <span className={styles.brandDot}></span>
            </div>
            {!isCollapsed && (
              <div className={styles.brandMeta}>
                <span className={styles.brandName}>TalentFlow</span>
                <span className={styles.brandBadge}>AI</span>
              </div>
            )}
          </Link>

          <button 
            className={styles.collapseToggle} 
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Workspace Role Label */}
        {!isCollapsed && (
          <div className={styles.workspaceLabel}>
            <span>{getRoleDisplayName(user?.role)} Workspace</span>
          </div>
        )}

        {/* Navigation List */}
        <nav className={styles.nav}>
          {allowedLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={handleNavClick}
                className={cn(styles.navItem, isActive && styles.active)}
                title={isCollapsed ? link.label : undefined}
              >
                <link.icon size={18} className={styles.navIcon} />
                {!isCollapsed && <span className={styles.linkText}>{link.label}</span>}
                {link.badge > 0 && (
                  <span className={styles.navBadge}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Actions Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <div className={styles.userInfo}>
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fname || 'User'}+${user?.lname || ''}&background=6366f1&color=fff`} 
              alt="Avatar" 
              className={styles.avatar} 
            />
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.fname} {user?.lname}</span>
                <span className={styles.userRole}>{getRoleDisplayName(user?.role)}</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className={styles.logoutBtn}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Confirmed Sign Out Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Sign Out of TalentFlow"
        message="Are you sure you want to end your session? You will be redirected to the sign-in screen."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
      />
    </>
  );
};
