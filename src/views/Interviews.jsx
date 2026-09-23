'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  Calendar, Clock, Video, MapPin, Plus, CheckCircle, 
  XCircle, MessageSquare, Users as UsersIcon, Sparkles, 
  ExternalLink, CalendarDays, ArrowRight
} from "lucide-react";
import { useRouter } from 'next/navigation';
import styles from "./Interviews.module.css";
import { format, isValid, parseISO } from "date-fns";

const safeFormat = (dateStr, formatStr) => {
  if (!dateStr) return "TBD";
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return isValid(date) ? format(date, formatStr) : "Invalid Date";
  } catch (err) {
    return "TBD";
  }
};

export default function Interviews() {
  const { user } = useAuth();
  const router = useRouter();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'scheduled' | 'completed'
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    candidateId: "",
    jobTitle: "Senior Frontend Engineer",
    stage: "Technical Architecture",
    date: "",
    time: "14:00",
    duration: "45 Minutes",
    interviewer: "Sarah Jenkins",
    type: "virtual",
    location: "https://meet.google.com/talentflow-demo",
    notes: "Review component architecture and Core Web Vitals optimization experience."
  });

  // Destructive Confirmation
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intRes, appRes, usersRes] = await Promise.all([
        api.get("/interviews").catch(() => ({ data: [] })),
        user?.role !== "candidate" ? api.get("/applications").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        user?.role !== "candidate" ? api.get("/auth/users").catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      let loadedInts = Array.isArray(intRes.data) ? intRes.data : [];
      // Provide robust sample interview if empty
      if (loadedInts.length === 0) {
        loadedInts = [
          {
            _id: "demo-int-1",
            candidateId: { fname: "Aarav", lname: "Sharma", email: "candidate@rms.com" },
            jobTitle: "Senior Frontend Engineer",
            companyName: "TalentFlow Technologies",
            interviewer: "Sarah Jenkins",
            date: new Date(Date.now() + 86400000).toISOString(),
            time: "14:00 EST",
            type: "virtual",
            location: "https://meet.google.com/xyz-tf-arch",
            status: "scheduled",
            notes: "Technical Architecture & Core Web Vitals discussion."
          }
        ];
      }

      setInterviews(loadedInts);
      setApplications(appRes.data || []);
      setCandidates((usersRes.data || []).filter(u => u.role === "candidate"));
    } catch (err) {
      console.error("Fetch interviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post("/interviews", formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStatus = (id, status) => {
    const isCancel = status === 'cancelled';
    setConfirmDialog({
      isOpen: true,
      title: isCancel ? "Cancel Interview Session" : "Mark Interview Complete",
      message: isCancel 
        ? "Are you sure you want to cancel this scheduled interview? A calendar update will be dispatched."
        : "Mark this interview as completed to record evaluation scores.",
      variant: isCancel ? "danger" : "primary",
      confirmLabel: isCancel ? "Cancel Session" : "Mark Completed",
      onConfirm: async () => {
        try {
          await api.put(`/interviews/${id}`, { status });
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const filteredInterviews = interviews.filter(item => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  return (
    <div className={`animate-fade-in ${styles.pageContainer}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Interview Schedules & Coordination</h1>
          <p className={styles.pageSubtitle}>
            {user?.role === "candidate"
              ? "Access upcoming interview meeting rooms, calendar exports, and practice in the AI simulator."
              : "Coordinate candidate assessments, set meeting links, and manage recruiter calendars."}
          </p>
        </div>

        {user?.role !== "candidate" && (
          <Button onClick={() => setShowModal(true)} size="md">
            <Plus size={16} /> Schedule Interview
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Sessions ({interviews.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "scheduled" ? styles.active : ""}`}
          onClick={() => setActiveTab("scheduled")}
        >
          Upcoming / Scheduled
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "completed" ? styles.active : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <LoadingSpinner label="Loading calendar..." />
      ) : filteredInterviews.length > 0 ? (
        <div className={styles.cardsGrid}>
          {filteredInterviews.map((int) => {
            const candidateName = `${int.candidateId?.fname || 'Candidate'} ${int.candidateId?.lname || ''}`;
            const companyName = int.companyName || "TalentFlow Technologies";
            const interviewerName = int.interviewer || "Sarah Jenkins";
            const isVirtual = int.type === 'virtual' || !int.type;

            return (
              <div key={int._id} className={styles.intCard}>
                <div>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.roleTitle}>{int.jobTitle || "Senior Frontend Engineer"}</h3>
                      <div className={styles.companyText}>
                        {companyName} • {user?.role === "candidate" ? "Candidate Practice Session" : candidateName}
                      </div>
                    </div>
                    <Badge variant={int.status === 'scheduled' ? 'primary' : 'success'}>
                      {int.status ? int.status.charAt(0).toUpperCase() + int.status.slice(1) : 'Scheduled'}
                    </Badge>
                  </div>

                  <div className={styles.metaRow} style={{ marginTop: '0.85rem' }}>
                    <span className={styles.metaItem}>
                      <CalendarDays size={14} /> {safeFormat(int.date, "EEEE, MMM d, yyyy")}
                    </span>
                    <span className={styles.metaItem}>
                      <Clock size={14} /> {int.time || '2:00 PM EST'}
                    </span>
                    <span className={styles.metaItem}>
                      <Video size={14} /> {isVirtual ? "Virtual (Google Meet)" : "On-site"}
                    </span>
                  </div>

                  <div className={styles.interviewerBox} style={{ marginTop: '0.85rem' }}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${interviewerName}`} 
                      alt="" 
                      className={styles.interviewerAvatar} 
                    />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{interviewerName}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>
                        Lead Technical Recruiter
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <a 
                      href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview: ${int.jobTitle} - ${companyName}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.calLink}
                    >
                      + Google Cal
                    </a>
                    <a 
                      href={int.location || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.calLink}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Meeting Link
                    </a>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user?.role === "candidate" ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="ai"
                          onClick={() => router.push('/interview-simulator')}
                        >
                          <Sparkles size={13} /> AI Mock Prep
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => window.open(int.location || "https://meet.google.com", "_blank")}
                        >
                          Join Call <ExternalLink size={12} />
                        </Button>
                      </>
                    ) : (
                      <>
                        {int.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleUpdateStatus(int._id, 'completed')}
                            >
                              <CheckCircle size={13} /> Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleUpdateStatus(int._id, 'cancelled')}
                              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            >
                              <XCircle size={13} /> Cancel
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className={styles.emptyCard}>
          <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No interview sessions found
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            {user?.role === "candidate" 
              ? "You do not have any interviews scheduled currently." 
              : "No candidates currently scheduled in this category."}
          </p>
        </Card>
      )}

      {/* Recruiter Schedule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule Candidate Assessment"
      >
        <form onSubmit={handleSchedule} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Candidate</label>
            <select
              className={styles.select}
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              required
            >
              <option value="">Select candidate from pipeline...</option>
              {candidates.map(c => (
                <option key={c._id} value={c._id}>{c.fname} {c.lname} ({c.email})</option>
              ))}
              <option value="aarav-demo">Aarav Sharma (candidate@rms.com)</option>
            </select>
          </div>

          <div className={styles.row2}>
            <div className={styles.formGroup}>
              <label>Requisition Position</label>
              <input 
                className={styles.input} 
                value={formData.jobTitle} 
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Interview Stage</label>
              <select
                className={styles.select}
                value={formData.stage}
                onChange={e => setFormData({ ...formData, stage: e.target.value })}
              >
                <option value="Initial Screening">Initial Screening (30m)</option>
                <option value="Technical Architecture">Technical Architecture (45m)</option>
                <option value="System Design">System Design (60m)</option>
                <option value="Culture & Leadership">Culture & Leadership (45m)</option>
              </select>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.formGroup}>
              <label>Date</label>
              <input 
                type="date" 
                className={styles.input} 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Time</label>
              <input 
                type="time" 
                className={styles.input} 
                value={formData.time} 
                onChange={e => setFormData({ ...formData, time: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Assigned Interviewer</label>
            <input 
              className={styles.input} 
              value={formData.interviewer} 
              onChange={e => setFormData({ ...formData, interviewer: e.target.value })} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Meeting Link (Google Meet / Zoom)</label>
            <input 
              className={styles.input} 
              value={formData.location} 
              onChange={e => setFormData({ ...formData, location: e.target.value })} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Internal Notes & Topics</label>
            <textarea 
              className={styles.textarea} 
              rows={3} 
              value={formData.notes} 
              onChange={e => setFormData({ ...formData, notes: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm & Dispatch Invites
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
