import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import styles from "./AppLayout.module.css";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "../ui/Input";

export const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
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
            <button className={styles.iconBtn}>
              <Bell size={20} />
              <span className={styles.badge}>3</span>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
