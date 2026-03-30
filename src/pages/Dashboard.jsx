import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Badge } from "../components/ui/Badge";
import { format } from "date-fns";
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Award, Eye, Heart, Zap, BookOpen, Clock, MapPin } from "lucide-react";
import illustration from "../assets/recruitment_illustration.png";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recRes] = await Promise.all([
          api.get('/analytics'),
          user.role === 'candidate' ? api.get('/jobs/recommended') : api.get('/jobs?limit=4')
        ]);
        
        setStats(statsRes.data.summary);
        setRecommendedJobs(user.role === 'candidate' ? recRes.data : recRes.data.jobs);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (isLoading) return <LoadingSpinner label="Synchronizing with TalentFlow..." />;

  const getCandidateMetrics = () => [
    { label: "Applied", count: stats?.applications || 0, icon: FileText, color: "var(--primary)" },
    { label: "Interviews", count: stats?.interviews || 0, icon: Zap, color: "var(--warning)" },
    { label: "Offers", count: stats?.offers || 0, icon: Award, color: "var(--success)" },
    { label: "Profile Views", count: stats?.profileViews || 0, icon: Eye, color: "var(--info)" }
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
            <p className={styles.subtitle}>
              {user.role === 'candidate' 
                ? "You have 3 new matching jobs since yesterday." 
                : "Here's the recruiter activity for today."}
            </p>
          </div>
          {user.role === "candidate" && (
            <div className={styles.headerIllustration}>
                <img src={illustration} alt="Recruitment Illustration" />
            </div>
          )}
          {user.role === "candidate" && (
            <div className={styles.ctaCard}>
                <h3 className="text-gradient">Ready for more?</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button size="sm" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                    <Button size="sm" variant="ghost">Get AI Help</Button>
                </div>
            </div>
          )}
        </div>
      </header>

      <div className={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <Card key={m.label} className={styles.metricCard} premium style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.metricIcon} style={{ backgroundColor: `${m.color}20`, color: m.color }}>
              <m.icon size={24} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.statLabel}>{m.label}</span>
              <h3 className={`${styles.statValue} animate-count`}>{m.count}</h3>
            </div>
          </Card>
        ))}
      </div>

      {user.role === "candidate" && (
        <section className={styles.mncSection}>
           <div className={styles.mncHeader}>
              <h2 className="text-gradient">Get hired in the top MNCs</h2>
              <p>Trusted by industry leaders worldwide for talent acquisition.</p>
           </div>
           <div className={styles.mncSlider}>
              <div className={styles.mncTrack}>
                {[
                  { name: "Google", logo: "https://www.vectorlogo.zone/logos/google/google-icon.svg" },
                  { name: "Amazon", logo: "https://www.vectorlogo.zone/logos/amazon/amazon-icon.svg" },
                  { name: "Meta", logo: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" },
                  { name: "Microsoft", logo: "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" },
                  { name: "Netflix", logo: "https://www.vectorlogo.zone/logos/netflix/netflix-icon.svg" },
                  { name: "Tesla", logo: "https://www.vectorlogo.zone/logos/tesla/tesla-icon.svg" },
                  { name: "NVIDIA", logo: "https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg" },
                  { name: "IBM", logo: "https://www.vectorlogo.zone/logos/ibm/ibm-icon.svg" },
                  { name: "Adobe", logo: "https://www.vectorlogo.zone/logos/adobe/adobe-icon.svg" },
                  { name: "Salesforce", logo: "https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg" },
                  { name: "Spotify", logo: "https://www.vectorlogo.zone/logos/spotify/spotify-icon.svg" },
                  { name: "Uber", logo: "https://www.vectorlogo.zone/logos/uber/uber-icon.svg" },
                  { name: "Airbnb", logo: "https://www.vectorlogo.zone/logos/airbnb/airbnb-icon.svg" }
                ].map((company, i) => (
                    <div key={i} className={styles.mncLogo}>
                        <div className={styles.mncIcon}>
                            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span>{company.name}</span>
                    </div>
                ))}
                {[
                  { name: "Google", logo: "https://www.vectorlogo.zone/logos/google/google-icon.svg" },
                  { name: "Amazon", logo: "https://www.vectorlogo.zone/logos/amazon/amazon-icon.svg" },
                  { name: "Meta", logo: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" },
                  { name: "Microsoft", logo: "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" },
                  { name: "Netflix", logo: "https://www.vectorlogo.zone/logos/netflix/netflix-icon.svg" },
                  { name: "Tesla", logo: "https://www.vectorlogo.zone/logos/tesla/tesla-icon.svg" },
                  { name: "NVIDIA", logo: "https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg" },
                  { name: "IBM", logo: "https://www.vectorlogo.zone/logos/ibm/ibm-icon.svg" },
                  { name: "Adobe", logo: "https://www.vectorlogo.zone/logos/adobe/adobe-icon.svg" },
                  { name: "Salesforce", logo: "https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg" },
                  { name: "Spotify", logo: "https://www.vectorlogo.zone/logos/spotify/spotify-icon.svg" },
                  { name: "Uber", logo: "https://www.vectorlogo.zone/logos/uber/uber-icon.svg" },
                  { name: "Airbnb", logo: "https://www.vectorlogo.zone/logos/airbnb/airbnb-icon.svg" }
                ].map((company, i) => (
                    <div key={`${i}-dup`} className={styles.mncLogo}>
                         <div className={styles.mncIcon}>
                            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                         </div>
                        <span>{company.name}</span>
                    </div>
                ))}
              </div>
           </div>
        </section>
      )}

      {user.role === "candidate" && (
        <Card className={styles.candidateWelcome} premium glow style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ready for your next opportunity?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Browse open jobs and track your applications easily.</p>
        </Card>
      )}

      <div className={styles.dashboardGrid}>
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h3>{user.role === "candidate" ? "Recommended for You" : "Recent Job Postings"}</h3>
            <button className={styles.viewAll} onClick={() => navigate('/jobs')}>View All Opportunities</button>
          </div>
          
          <div className={styles.jobList}>
            {user.role === 'candidate' ? (
              recommendedJobs.map((job, i) => (
                <Card key={job._id} className={styles.recommendationCard} premium glow style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className={styles.cardHeader}>
                    <div className={styles.companyInfo}>
                      <div className={styles.companyLogo}>
                        {job.company?.name?.[0] || job.title[0]}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.25rem' }}>{job.title}</h4>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company?.name || 'Top Tier Company'}</p>
                      </div>
                    </div>
                    <div className={`${styles.matchBadge} ${job.matchScore > 85 ? styles.matchHigh : job.matchScore > 70 ? styles.matchMed : styles.matchLow}`}>
                      {job.matchScore}% Match
                    </div>
                  </div>

                  <div className={styles.tags}>
                    <span className={styles.tag}><MapPin size={12} /> {job.location}</span>
                    <span className={styles.tag}><Clock size={12} /> {job.type}</span>
                    {job.salary && <span className={styles.tag}><TrendingUp size={12} /> {job.salary}</span>}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.salary}>{job.salary || "Competitive Pay"}</span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Button variant="ghost" size="sm" style={{ padding: '0.5rem' }}><Heart size={18} /></Button>
                      <Button size="sm" onClick={() => navigate(`/jobs/${job._id}`)}>Quick Apply</Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
                recommendedJobs.map(job => (
                    <Card key={job._id} className={styles.jobCard} premium>
                      <div className={styles.jobInfo}>
                        <h4>{job.title}</h4>
                        <p>{job.department} · {job.location}</p>
                      </div>
                      <div className={styles.jobMeta}>
                        <span>{format(new Date(job.createdAt), "MMM d")}</span>
                        <span className={styles.applicantBadge}>{job.applicantsCount} applied</span>
                      </div>
                    </Card>
                ))
            )}
          </div>
        </div>

        <div className={styles.insightsPanel}>
          <div className={styles.sectionHeader}>
            <h3>AI Talent Match</h3>
          </div>

          {user.role === 'candidate' && (
             <Card className={styles.insightCard} premium glow style={{ marginBottom: '1.5rem', background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--primary-light))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>
                        <Zap size={20} />
                    </div>
                    <div style={{ fontWeight: 700 }}>AI Resume Matcher</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>92%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OVERALL PROFILE STRENGTH</div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', marginBottom: '0.25rem' }}>
                        <span>Matching Skills</span>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>8/10</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '80%', background: 'var(--primary)', borderRadius: '10px' }} />
                    </div>
                </div>
                <Button variant="ghost" size="sm" fullWidth style={{ marginTop: '1.25rem', border: '1px dashed var(--primary)' }}>
                    Re-scan Resume
                </Button>
             </Card>
          )}

          <div className={styles.sectionHeader}>
            <h3>Intelligence & Trends</h3>
          </div>
          
          {user.role === 'candidate' && (
            <Card className={styles.insightCard} glow>
               <div className={styles.insightHeader}>
                  <BookOpen size={18} color="var(--primary)" />
                  <span>Improve your chances</span>
               </div>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                 Based on jobs you match with, adding these skills could increase your visibility by 40%.
               </p>
               <div className={styles.suggestedSkills}>
                  {[
                    { name: 'System Design', demand: 'High' },
                    { name: 'AWS Cloud', demand: 'Medium' },
                    { name: 'Redux State Management', demand: 'High' }
                  ].map((skill, i) => (
                    <div key={i} className={styles.skillItem}>
                       <span>{skill.name}</span>
                       <span className={styles.ctaLink}>Add to Profile</span>
                    </div>
                  ))}
               </div>
            </Card>
          )}

          <Card className={styles.insightCard}>
             <div className={styles.insightHeader}>
                <TrendingUp size={18} color="var(--success)" />
                <span>Global Market Trends</span>
             </div>
             <div className={styles.newsGrid} style={{ border: 'none' }}>
                {[
                  { title: "Generative AI in Recruitment", trend: "Up 45%", detail: "AI-driven screening is becoming the standard for 2024." },
                  { title: "Remote-First Stability", trend: "Steady", detail: "MNCs are standardizing hybrid models across EU/US." },
                  { title: "FinTech Hiring Surge", trend: "High Demand", detail: "Massive scaling in embedded finance sectors." }
                ].map((news, i) => (
                    <div key={i} className={styles.newsItem} style={{ border: 'none', padding: '0.75rem 0' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{news.title}</h4>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{news.detail}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>{news.trend}</span>
                    </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
