import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { EmailTemplate } from "../components/ui/EmailTemplate";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Mail, Inbox, Archive, Trash2, Clock } from "lucide-react";
import styles from "./NotificationCenter.module.css";

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      if (data.length > 0 && !selectedNote) setSelectedNote(data[0]);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user._id]);

  const handleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state to reflect read status
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  return (
    <div className={styles.container + " animate-fade-in"}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
           <h1 className="text-gradient">Message Center</h1>
           <p>Manage your job application updates and professional correspondence.</p>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner label="Accessing encrypted mailbox..." />
      ) : (
        <div className={styles.mailbox}>
          <aside className={styles.sidebar}>
            <div className={styles.inboxStats}>
              <Inbox size={18} />
              <span>Inbox ({notifications.filter(n => !n.read).length})</span>
            </div>
            
            <div className={styles.noteList}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-tertiary)" }}>
                    <Clock size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
                    <p>No messages found</p>
                </div>
              ) : (
                notifications.map(note => (
                  <div 
                    key={note._id} 
                    className={`${styles.noteItem} ${selectedNote?._id === note._id ? styles.active : ''} ${!note.read ? styles.unread : ''}`}
                    onClick={() => { setSelectedNote(note); handleRead(note._id); }}
                  >
                    <div className={styles.noteIndicator}></div>
                    <div className={styles.noteMeta}>
                      <span className={styles.noteSender}>{note.sender}</span>
                      <span className={styles.noteSubject}>{note.subject}</span>
                      <span className={styles.noteSnippet}>{note.message.substring(0, 40)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <main className={styles.content}>
            {selectedNote ? (
              <div className="animate-fade-in">
                  <EmailTemplate notification={selectedNote} />
              </div>
            ) : (
              <div className={styles.noSelection}>
                <Mail size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>Select a message to view the details.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
