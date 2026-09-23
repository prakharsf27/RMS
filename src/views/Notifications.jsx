'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  Mail, Inbox, Clock, CheckCircle2, ArrowRight, 
  ExternalLink, Bell, Calendar, Sparkles, MessageSquare
} from "lucide-react";
import { getNotificationRoute } from "../lib/notificationRoutes";
import styles from "./NotificationCenter.module.css";
import { format } from "date-fns";

export default function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'applications' | 'interviews'

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      if (list.length > 0 && !selectedNote) {
        setSelectedNote(list[0]);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleRead = async (id) => {
    // Immediate optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true, isRead: true } : n));
    if (selectedNote?._id === id) {
      setSelectedNote(prev => prev ? { ...prev, read: true, isRead: true } : prev);
    }
    try {
      await api.put(`/notifications/${id}/read`).catch(() => api.put(`/notifications/${id}`));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const isNoteUnread = (note) => !note.read && !note.isRead;

  const filteredNotes = notifications.filter(note => {
    if (activeTab === "unread") return isNoteUnread(note);
    if (activeTab === "applications") return /applied|application|candidate/i.test((note.subject || note.title || "") + " " + (note.message || ""));
    if (activeTab === "interviews") return /interview|schedule/i.test((note.subject || note.title || "") + " " + (note.message || ""));
    return true;
  });

  const getActionForNote = (note) => {
    return getNotificationRoute(note, user?.role);
  };

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Notification Center</h1>
          <p className={styles.pageSubtitle}>
            Review application updates, candidate responses, and scheduled interview briefings.
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.tabsBar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "unread" ? styles.active : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "applications" ? styles.active : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          Applications
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "interviews" ? styles.active : ""}`}
          onClick={() => setActiveTab("interviews")}
        >
          Interviews
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading notification history..." />
      ) : (
        <div className={styles.mailbox}>
          {/* Notifications List */}
          <aside className={styles.sidebar}>
            <div className={styles.inboxHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bell size={16} style={{ color: 'var(--primary)' }} />
                <span>Inbox</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {notifications.filter(n => !n.read).length} unread
              </span>
            </div>
            
            <div className={styles.noteList}>
              {filteredNotes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-tertiary)" }}>
                  <Inbox size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                  <p style={{ fontSize: '0.875rem' }}>No notifications found in this view.</p>
                </div>
              ) : (
                filteredNotes.map(note => {
                  const isSelected = selectedNote?._id === note._id;
                  const isUnread = isNoteUnread(note);
                  const displayTitle = note.subject || note.title || "Notification";

                  return (
                    <div 
                      key={note._id} 
                      className={`${styles.noteItem} ${isSelected ? styles.active : ''} ${isUnread ? styles.unread : ''}`}
                      onClick={() => { 
                        setSelectedNote(note); 
                        if (isUnread) handleRead(note._id); 
                      }}
                    >
                      <div className={styles.noteIndicator} />
                      <div className={styles.noteMeta}>
                        <div className={styles.senderRow}>
                          <span className={styles.noteSender}>{note.sender || "TalentFlow"}</span>
                          <span className={styles.noteTime}>
                            {note.createdAt || note.timestamp ? format(new Date(note.createdAt || note.timestamp), "MMM d") : "Today"}
                          </span>
                        </div>
                        <span className={styles.noteSubject}>{displayTitle}</span>
                        <span className={styles.noteSnippet}>{note.message}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Selected Notification Inspection View */}
          <main className={styles.contentPane}>
            {selectedNote ? (
              <>
                <div className={styles.detailHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge variant={isNoteUnread(selectedNote) ? "primary" : "secondary"}>
                      {isNoteUnread(selectedNote) ? "Unread Notification" : "Read"}
                    </Badge>
                    <span style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>
                      {selectedNote.createdAt || selectedNote.timestamp ? format(new Date(selectedNote.createdAt || selectedNote.timestamp), "EEEE, MMMM d, yyyy • h:mm a") : "Recent"}
                    </span>
                  </div>
                  <h2 className={styles.detailSubject}>{selectedNote.subject || selectedNote.title}</h2>
                  <div className={styles.detailSenderRow}>
                    <span>From: <strong>{selectedNote.sender || "TalentFlow Recruitment"}</strong></span>
                  </div>
                </div>

                <div className={styles.detailBody}>
                  {selectedNote.message}
                </div>

                <div className={styles.detailActions}>
                  {(() => {
                    const action = getActionForNote(selectedNote);
                    return (
                      <Button variant="primary" size="md" onClick={() => router.push(action.path)}>
                        {action.label} <ArrowRight size={14} />
                      </Button>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className={styles.noSelection}>
                <Mail size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)' }}>
                  Select an item from the left to read full notification details.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
