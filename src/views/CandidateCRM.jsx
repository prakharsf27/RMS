'use client';
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Clock, Building, ArrowRight, RefreshCcw, Mail, AlertCircle, BarChart2 } from "lucide-react";
import styles from "./CandidateCRM.module.css";

export default function CandidateCRM() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ghosting threshold (days)
  const GHOSTING_THRESHOLD = 7;

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get("/applications");
        // Enrich data with CRM computed fields
        const enriched = data.map(app => {
          const appliedDate = new Date(app.appliedAt);
          const daysSinceUpdate = differenceInDays(new Date(), new Date(app.updatedAt || app.appliedAt));
          
          let crmStage = "applied";
          if (app.status === "rejected" || app.status === "offered") {
             crmStage = "responded";
          } else if (app.status === "interviewing") {
             crmStage = "viewed";
          } else if (daysSinceUpdate >= GHOSTING_THRESHOLD) {
             crmStage = "ghosted";
          }

          return { ...app, crmStage, daysSinceUpdate };
        });
        setApplications(enriched);
      } catch (err) {
        console.error("CRM fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // Compute analytics
  const total = applications.length;
  const ghostedCount = applications.filter(a => a.crmStage === "ghosted").length;
  const respondedCount = applications.filter(a => a.crmStage === "responded").length;
  const ghostRate = total > 0 ? Math.round((ghostedCount / total) * 100) : 0;
  const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0;

  const handleFollowUp = (app) => {
    const jobTitle = app.jobId?.title || "Role";
    const company = app.jobId?.company?.name || "Company";
    const body = encodeURIComponent(`Hi ${company} Hiring Team,\n\nI recently applied for the ${jobTitle} role and wanted to reiterate my strong interest. Please let me know if you need any additional information from my side.\n\nBest regards`);
    window.location.href = `mailto:?subject=Following up: ${jobTitle} Application&body=${body}`;
  };

  if (loading) {
     return <div style={{ padding: "40px", textAlign: "center" }}><RefreshCcw className="animate-spin" /></div>;
  }

  const columns = [
    { id: "applied", label: "Applied", icon: <ArrowRight size={16}/> },
    { id: "viewed", label: "Viewed / In Progress", icon: <Clock size={16}/> },
    { id: "ghosted", label: "Likely Ghosted", icon: <AlertCircle size={16}/> },
    { id: "responded", label: "Responded", icon: <CheckCircle /> }
  ];

  // We don't have CheckCircle locally imported for responded, we use BarChart2 as placeholder for analytics
  const renderColumn = (stageId, title, colorVariant) => {
     const apps = applications.filter(a => a.crmStage === stageId);
     return (
       <div className={styles.column}>
          <div className={styles.columnHeader}>
             <h3>{title}</h3>
             <span className={styles.countBadge}>{apps.length}</span>
          </div>
          <div className={styles.columnBody}>
             {apps.map(app => (
               <Card key={app._id} className={styles.appCard}>
                  <div className={styles.appHeader}>
                     <Building size={14} className={styles.icon} />
                     <strong>{app.jobId?.company?.name || "TalentFlow Partner"}</strong>
                  </div>
                  <div className={styles.jobTitle}>{app.jobId?.title}</div>
                  <div className={styles.meta}>
                     Applied: {format(new Date(app.appliedAt), "MMM d")}
                  </div>
                  <div className={styles.meta} style={{ color: app.daysSinceUpdate >= GHOSTING_THRESHOLD ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                     Last update: {app.daysSinceUpdate} days ago
                  </div>
                  {stageId === "ghosted" && (
                    <Button variant="secondary" size="sm" className={styles.followBtn} onClick={() => handleFollowUp(app)}>
                       <Mail size={12} /> Send Follow-up
                    </Button>
                  )}
               </Card>
             ))}
             {apps.length === 0 && <div className={styles.emptyCol}>No applications here</div>}
          </div>
       </div>
     );
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: "28px", margin: 0 }}>Ghosting Tracker (CRM)</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage your job hunt pipeline and follow-up templates.</p>
        </div>
      </div>

      <div className={styles.analyticsBar}>
         <div className={styles.statBox}>
            <span className={styles.statLabel}>Response Rate</span>
            <span className={styles.statVal}>{responseRate}%</span>
         </div>
         <div className={styles.statBox}>
            <span className={styles.statLabel}>Ghosting Rate (&gt;7 days)</span>
            <span className={styles.statVal}>{ghostRate}%</span>
         </div>
         <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Active</span>
            <span className={styles.statVal}>{total - respondedCount}</span>
         </div>
      </div>

      <div className={styles.kanbanBoard}>
         {renderColumn("applied", "Just Applied")}
         {renderColumn("viewed", "In Progress")}
         {renderColumn("ghosted", "Ghosted / Stale")}
         {renderColumn("responded", "Closed / Responded")}
      </div>
    </div>
  );
}

// Dummy CheckCircle component since it wasn't imported from lucide-react initially to avoid clutter
function CheckCircle() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
