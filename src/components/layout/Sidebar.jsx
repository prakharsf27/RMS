import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  X
} from "lucide-react";
import styles from "./Sidebar.module.css";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("rms_theme") || "light");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("rms_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "recruiter", "candidate"] },
    { to: "/jobs", icon: Briefcase, label: "Jobs", roles: ["admin", "recruiter", "candidate"] },
    { to: "/company", icon: Building, label: "Company", roles: ["recruiter"] },
    { to: "/candidates", icon: Users, label: "Candidates", roles: ["admin", "recruiter"] },
    { to: "/applications", icon: FileText, label: "Applications", roles: ["admin", "recruiter", "candidate"] },
    { to: "/notifications", icon: Mail, label: "Messages", roles: ["admin", "recruiter", "candidate"] },
    { to: "/interviews", icon: Calendar, label: "Interviews", roles: ["admin", "recruiter", "candidate"] },
    { to: "/reports", icon: BarChart, label: "Reports", roles: ["admin", "recruiter"] },
    { to: "/profile", icon: User, label: "Profile", roles: ["admin", "recruiter", "candidate"] }
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
        <div className={styles.logoIcon}>T</div>
        <span className={styles.logoText}>TalentFlow</span>
        <button 
           className={styles.collapseToggle} 
           onClick={() => setIsCollapsed(!isCollapsed)}
        >
           <Zap size={16} className={isCollapsed ? "rotate-180" : ""} />
        </button>
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
            <link.icon size={20} />
            <span>{link.label}</span>
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
