import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import styles from "./AppLayout.module.css";
import { Bell, Search } from "lucide-react";
import { Input } from "../ui/Input";

export const AppLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
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
