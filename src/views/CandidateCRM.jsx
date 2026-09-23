'use client';
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  Clock, Building2, ArrowRight, RefreshCcw, Mail, 
  AlertCircle, CheckCircle2, Sparkles, MessageSquare, 
  Calendar, Copy, Check, Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./CandidateCRM.module.css";

const PIPELINE_STAGES = [
  { id: "applied", label: "Applied", step: 1 },
  { id: "screening", label: "Screening", step: 2 },
  { id: "interview", label: "Interview", step: 3 },
  { id: "offered", label: "Offered", step: 4 },
  { id: "hired", label: "Hired", step: 5 }
];

export default function CandidateCRM() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followUpApp, setFollowUpApp] = useState(null);
  const [copied, setCopied] = useState(false);

  // Ghosting threshold (days)
  const GHOSTING_THRESHOLD = 7;

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/applications");
      const enriched = (Array.isArray(data) ? data : []).map(app => {
        const appliedDate = new Date(app.createdAt || app.appliedAt || Date.now());
        const daysSinceUpdate = differenceInDays(new Date(), new Date(app.updatedAt || appliedDate));
        
        let crmStage = app.status || "applied";
        if (crmStage === "interviewing") crmStage = "interview";

        return { ...app, crmStage, daysSinceUpdate, appliedDate };
      });
      setApplications(enriched);
    } catch (err) {
      console.error("CRM fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const total = applications.length;
  const inInterview = applications.filter(a => a.crmStage === "interview").length;
  const offersCount = applications.filter(a => a.crmStage === "offered" || a.crmStage === "hired").length;
  const ghostedCount = applications.filter(a => a.daysSinceUpdate >= GHOSTING_THRESHOLD && a.crmStage !== "hired" && a.status !== "rejected").length;

  const getTemplateText = (app) => {
    const role = app?.jobId?.title || "Software Engineer";
    const company = app?.jobId?.company?.name || "TalentFlow Technologies";
    return `Dear ${company} Recruitment Team,\n\nI hope this email finds you well.\n\nI am writing to politely follow up on my application for the ${role} position submitted on ${format(new Date(app?.appliedDate || Date.now()), "MMMM d, yyyy")}.\n\nI remain very enthusiastic about the opportunity to contribute to ${company}, and I would be delighted to provide any additional work samples or answer questions regarding my qualifications.\n\nThank you for your time and consideration.\n\nBest regards,\nAarav Sharma\nFrontend Engineer`;
  };

  const handleCopyEmail = () => {
    if (!followUpApp) return;
    navigator.clipboard.writeText(getTemplateText(followUpApp));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchEmailClient = () => {
    if (!followUpApp) return;
    const role = followUpApp.jobId?.title || "Role";
    const company = followUpApp.jobId?.company?.name || "Hiring Team";
    const subject = encodeURIComponent(`Following up: Application for ${role} - Aarav Sharma`);
    const body = encodeURIComponent(getTemplateText(followUpApp));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return <LoadingSpinner label="Loading application pipeline..." />;
  }

  const columns = [
    { id: "applied", label: "Applied", count: applications.filter(a => a.crmStage === "applied").length },
    { id: "screening", label: "Screening", count: applications.filter(a => a.crmStage === "screening").length },
    { id: "interview", label: "Interview", count: applications.filter(a => a.crmStage === "interview").length },
    { id: "offered", label: "Offer / Hired", count: applications.filter(a => a.crmStage === "offered" || a.crmStage === "hired").length },
  ];

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Application Pipeline & Tracker</h1>
          <p className={styles.pageSubtitle}>
            Track real-time progress across recruiter screening stages, monitor response times, and prevent ghosting.
          </p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className={styles.analyticsBar}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Active Applications</span>
          <span className={styles.statVal}>{total}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>In Active Interviews</span>
          <span className={styles.statVal} style={{ color: 'var(--primary)' }}>{inInterview}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Offers Received</span>
          <span className={styles.statVal} style={{ color: 'var(--success)' }}>{offersCount}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Follow-ups Recommended</span>
          <span className={styles.statVal} style={{ color: ghostedCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {ghostedCount}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className={styles.kanbanBoard}>
        {columns.map(col => {
          const colApps = applications.filter(a => {
            if (col.id === "offered") return a.crmStage === "offered" || a.crmStage === "hired";
            return a.crmStage === col.id;
          });

          return (
            <div key={col.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span>{col.label}</span>
                </div>
                <span className={styles.countBadge}>{colApps.length}</span>
              </div>

              <div className={styles.columnBody}>
                {colApps.map(app => {
                  const companyName = app.jobId?.company?.name || "TalentFlow Technologies";
                  const jobTitle = app.jobId?.title || "Senior Frontend Engineer";
                  const matchScore = app.matchScore || 92;
                  const isGhosted = app.daysSinceUpdate >= GHOSTING_THRESHOLD && app.status !== "hired" && app.status !== "rejected";

                  // Timeline Step index
                  const currentStageObj = PIPELINE_STAGES.find(s => s.id === app.crmStage) || PIPELINE_STAGES[0];
                  const currentStepNum = currentStageObj.step;

                  return (
                    <div key={app._id} className={styles.appCard}>
                      <div className={styles.appHeader}>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyIcon}>
                            {companyName[0]}
                          </div>
                          <span>{companyName}</span>
                        </div>
                        <Badge variant={app.crmStage === "hired" || app.crmStage === "offered" ? "success" : app.crmStage === "interview" ? "primary" : "secondary"}>
                          <Sparkles size={10} style={{ marginRight: '3px' }} /> {matchScore}%
                        </Badge>
                      </div>

                      <div className={styles.jobTitle}>{jobTitle}</div>

                      {/* Timeline Stepper */}
                      <div className={styles.timelineStepper}>
                        {PIPELINE_STAGES.map((s) => {
                          const isDone = s.step < currentStepNum;
                          const isActive = s.step === currentStepNum;
                          return (
                            <div 
                              key={s.id} 
                              className={`${styles.timelineStep} ${isDone ? styles.completed : ''} ${isActive ? styles.active : ''}`}
                            >
                              <div className={styles.timelineDot} />
                              <span>{s.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className={styles.metaRow}>
                        <span>Applied: {format(new Date(app.appliedDate), "MMM d")}</span>
                        {isGhosted ? (
                          <span className={styles.ghostAlert}>
                            <AlertCircle size={11} /> {app.daysSinceUpdate}d without update
                          </span>
                        ) : (
                          <span>Active</span>
                        )}
                      </div>

                      <div className={styles.cardActions}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          fullWidth 
                          onClick={() => setFollowUpApp(app)}
                        >
                          <Mail size={13} /> Follow-Up
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => router.push(`/messages`)}
                          title="Message Recruiter"
                        >
                          <MessageSquare size={13} />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className={styles.emptyCol}>
                    No applications in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow-up Email Template Modal */}
      <Modal
        isOpen={!!followUpApp}
        onClose={() => setFollowUpApp(null)}
        title="Follow-Up Email Draft"
      >
        {followUpApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Use this professional template to check in on your application for <strong>{followUpApp.jobId?.title}</strong> at <strong>{followUpApp.jobId?.company?.name || 'TalentFlow Technologies'}</strong>.
            </p>

            <div style={{ 
              background: 'var(--bg-elevated)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              {getTemplateText(followUpApp)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setFollowUpApp(null)}>
                Close
              </Button>
              <Button variant="outline" onClick={handleCopyEmail}>
                {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />} 
                {copied ? "Copied to Clipboard" : "Copy Template"}
              </Button>
              <Button variant="primary" onClick={handleLaunchEmailClient}>
                <Send size={14} /> Open in Email
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
