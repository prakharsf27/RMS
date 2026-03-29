import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { format } from "date-fns";
import { Users, Briefcase, FileText, CheckCircle } from "lucide-react";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, auditRes, jobsRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/audit'),
          api.get('/jobs?limit=4')
        ]);
        
        setStats(statsRes.data.summary);
        setActivities(auditRes.data.slice(0, 6));
        setJobs(jobsRes.data.jobs);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner label="Synchronizing with TalentFlow..." />;

  const getCandidateMetrics = () => [
    { label: "Applied Jobs", count: stats?.applications || 0, icon: FileText, color: "var(--primary)" },
    { label: "Active Postings", count: stats?.jobs || 0, icon: Briefcase, color: "var(--info)" },
    { label: "Interviews", count: stats?.interviews || 0, icon: CheckCircle, color: "var(--success)" }
  ];

  const getAdminMetrics = () => [
    { label: "Active Jobs", count: stats?.jobs || 0, icon: Briefcase, color: "var(--primary)" },
    { label: "Total Candidates", count: stats?.candidates || 0, icon: Users, color: "var(--info)" },
    { label: "Applications", count: stats?.applications || 0, icon: FileText, color: "var(--warning)" },
    { label: "Hired", count: 0, icon: CheckCircle, color: "var(--success)" }
  ];

  const metrics = user.role === "candidate" ? getCandidateMetrics() : getAdminMetrics();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerFlex}>
          <div>
            <h1 className={styles.title}>Welcome back, {user.fname}! 👋</h1>
            <p className={styles.subtitle}>Here's what's happening with your recruitment today.</p>
          </div>
          {user.role === "candidate" && (
            <div className={styles.ctaCard}>
                <h3 className="text-gradient">Get hired in the top MNC</h3>
                <p>Your dream role at a Fortune 500 company is just one application away.</p>
            </div>
          )}
        </div>
      </header>

      {user.role === "candidate" && (
        <section className={styles.mncSection}>
           <div className={styles.mncHeader}>
              <h2 className="text-gradient">Get hired in the top MNCs</h2>
              <p>Trusted by industry leaders worldwide for talent acquisition.</p>
           </div>
           <div className={styles.mncSlider}>
              <div className={styles.mncTrack}>
                {[
                  "Google", "Amazon", "Meta", "Microsoft", "Netflix", 
                  "Apple", "Tesla", "NVIDIA", "Intel", "IBM", 
                  "Adobe", "Salesforce", "Oracle", "Spotify", "Uber", 
                  "Airbnb", "Stripe", "LinkedIn", "Twitter", "Reddit"
                ].map(company => (
                    <div key={company} className={styles.mncLogo}>
                        <div className={styles.mncIcon}>{company[0]}</div>
                        <span>{company}</span>
                    </div>
                ))}
                {[
                  "Google", "Amazon", "Meta", "Microsoft", "Netflix", 
                  "Apple", "Tesla", "NVIDIA", "Intel", "IBM", 
                  "Adobe", "Salesforce", "Oracle", "Spotify", "Uber", 
                  "Airbnb", "Stripe", "LinkedIn", "Twitter", "Reddit"
                ].map(company => (
                    <div key={`${company}-dup`} className={styles.mncLogo}>
                         <div className={styles.mncIcon}>{company[0]}</div>
                        <span>{company}</span>
                    </div>
                ))}
              </div>
           </div>
        </section>
      )}

      {user.role !== "candidate" && (
        <div className={styles.metricsGrid}>
          {metrics.map(m => (
            <Card key={m.label} className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: m.color, color: "#fff" }}>
                <m.icon size={24} />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>{m.label}</span>
                <h3 className={styles.metricValue}>{m.count}</h3>
              </div>
            </Card>
          ))}
        </div>
      )}

      {user.role === "candidate" && (
        <Card className={styles.candidateWelcome}>
          <h2>Ready for your next opportunity?</h2>
          <p>Browse open jobs and track your applications easily.</p>
        </Card>
      )}

      <div className={styles.dashboardGrid}>
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h3>{user.role === "candidate" ? "Recommended for You" : "Recent Job Postings"}</h3>
            <button className={styles.viewAll}>View All</button>
          </div>
          <div className={styles.jobList}>
            {jobs.map(job => (
              <Card key={job._id} className={styles.jobCard} glow>
                <div className={styles.jobInfo}>
                  <h4>{job.title}</h4>
                  <p>{job.department} · {job.location}</p>
                </div>
                <div className={styles.jobMeta}>
                  <span>{format(new Date(job.createdAt), "MMM d")}</span>
                  <span className={styles.applicantBadge}>{job.applicantsCount} applied</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h3>Global Market Trends</h3>
          </div>
          <Card className={styles.newsSection}>
             <div className={styles.newsGrid}>
                {[
                  { title: "Generative AI in Recruitment", trend: "Up 45%", detail: "AI-driven screening is becoming the standard for 2024." },
                  { title: "Remote-First Stability", trend: "Steady", detail: "MNCs are standardizing hybrid models across EU/US." },
                  { title: "FinTech Hiring Surge", trend: "High Demand", detail: "Massive scaling in embedded finance sectors." }
                ].map((news, i) => (
                    <div key={i} className={styles.newsItem}>
                        <div className={styles.newsTag}>Trending</div>
                        <h4>{news.title}</h4>
                        <p>{news.detail}</p>
                        <span className={styles.newsStats}>{news.trend}</span>
                    </div>
                ))}
             </div>
          </Card>
          
          <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
            <h3>System Activity</h3>
          </div>
          <Card className={styles.activityFeed}>
             {activities.length > 0 ? (
                <div className={styles.activityList}>
                    {activities.map(log => (
                        <div key={log._id} className={styles.activityItem}>
                            <div className={styles.activityDot}></div>
                            <div className={styles.activityContent}>
                                <p className={styles.activityAction}>{log.action}</p>
                                <p className={styles.activityDetails}>{log.details}</p>
                                <span className={styles.activityTime}>{format(new Date(log.timestamp), "h:mm a")}</span>
                            </div>
                        </div>
                    ))}
                </div>
             ) : (
                <p className={styles.emptyActivity}>No recent activity found.</p>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
