'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { 
  Briefcase, FileText, MessageSquare, 
  CalendarDays, User, Users, TrendingUp, Zap, Award, 
  Settings, Sparkles, ShieldAlert, ArrowRight, Clock, 
  CheckCircle, MapPin, Building2, CheckSquare,
  ArrowUpRight, AlertCircle, ChevronRight, Eye, ShieldCheck
} from "lucide-react";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CandidateDrawer } from "../components/features/CandidateDrawer";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Candidate Drawer state for recruiters
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes, jobsRes, intRes, msgRes] = await Promise.all([
          api.get('/analytics').catch(() => ({ data: { summary: {} } })),
          api.get('/applications').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/interviews').catch(() => ({ data: [] })),
          api.get('/messages').catch(() => ({ data: [] }))
        ]);

        setStats(statsRes.data?.summary || {});
        setActivities(statsRes.data?.activities || []);
        setInterviews(Array.isArray(intRes.data) ? intRes.data : []);
        setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);

        if (user.role === 'candidate') {
          setDataList(jobsRes.data || []);
        } else {
          setDataList(appsRes.data || []);
        }
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner label="Loading recruitment dashboard..." />;
  }

  const isCandidate = user.role === 'candidate';
  const isRecruiter = user.role === 'recruiter';
  const isAdmin = user.role === 'admin';

  // Candidate Specific Demo Data & Checklists
  const profileTasks = [
    { label: "Identity & Contact Information", done: true },
    { label: "Work Experience & History", done: true },
    { label: "Verified Technical Skills", done: true },
    { label: "ATS-Compliant Resume Uploaded", done: true },
    { label: "Portfolio / GitHub URL Connected", done: true },
    { label: "Mock Interview Simulation Complete", done: false },
  ];
  const doneTasks = profileTasks.filter(t => t.done).length;
  const profilePct = Math.round((doneTasks / profileTasks.length) * 100);

  // Recruiter Funnel Metrics
  const totalApps = stats?.applications || dataList.length || 12;
  const screeningCount = Math.max(1, Math.round(totalApps * 0.5));
  const interviewCount = Math.max(1, stats?.interviews || 2);
  const offerCount = Math.max(1, stats?.offers || 1);
  const hiredCount = Math.max(1, Math.round(offerCount * 0.8));

  const handleOpenDrawer = (app) => {
    setSelectedCandidate(app.candidateId || null);
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  return (
    <div className={styles.page}>
      {/* ─── Hero Overview ─── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroGreeting}>Welcome back, {user.fname}!</h1>
          <p className={styles.heroSub}>
            {isCandidate 
              ? "Your career search pipeline is active. Review matched opportunities, upcoming interviews, and recruiter messages."
              : isRecruiter
              ? "Review incoming candidates, monitor hiring funnel velocity, and advance qualified talent."
              : "Enterprise platform control center. Monitor system utilization, organizations, and active directory accounts."}
          </p>
          <div className={styles.heroChips}>
            {isCandidate ? (
              <>
                <div className={styles.heroChip}><Sparkles size={13} style={{ color: '#6366f1' }} /> 92% ATS Compatibility</div>
                <div className={styles.heroChip}><FileText size={13} /> Resume Score: 88/100</div>
                <div className={styles.heroChip}><Briefcase size={13} /> {dataList.length || 5} Matching Positions</div>
              </>
            ) : isRecruiter ? (
              <>
                <div className={styles.heroChip}><Users size={13} /> {stats?.candidates || 4} Candidates in Pipeline</div>
                <div className={styles.heroChip}><Zap size={13} /> {interviewCount} Interviews Scheduled</div>
                <div className={styles.heroChip}><Clock size={13} /> Avg. Time to Hire: 18 Days</div>
              </>
            ) : (
              <>
                <div className={styles.heroChip}><ShieldCheck size={13} /> System Health: Operational</div>
                <div className={styles.heroChip}><Users size={13} /> Active Directory: Multi-tenant</div>
              </>
            )}
          </div>
        </div>

        <div className={styles.heroRight}>
          <Button 
            variant="ai" 
            size="md" 
            onClick={() => router.push(isCandidate ? '/jobs' : isRecruiter ? '/candidates' : '/verification')}
          >
            {isCandidate ? 'Browse All Jobs' : isRecruiter ? 'Manage Candidates' : 'Verification Queue'} <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* ─── Candidate View ─── */}
      {isCandidate && (
        <>
          {/* Key Candidate Metrics */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                  <Award size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>Verified</span>
              </div>
              <div className={styles.statLabel}>Resume Score</div>
              <div className={styles.statValue}>88<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/100</span></div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <Sparkles size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>High Pass</span>
              </div>
              <div className={styles.statLabel}>ATS Compatibility</div>
              <div className={styles.statValue}>92%</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <FileText size={18} />
                </div>
                <span className={styles.statTrend}>Active</span>
              </div>
              <div className={styles.statLabel}>Applications</div>
              <div className={styles.statValue}>{stats?.applications || 1}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                  <CalendarDays size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>Next Up</span>
              </div>
              <div className={styles.statLabel}>Upcoming Interview</div>
              <div className={styles.statValue}>{interviews.length || 1}</div>
            </div>
          </div>

          {/* Your Job Search Section */}
          <div className={styles.twoCol}>
            {/* Left: Recommended Jobs */}
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>
                    <Briefcase size={18} /> Your Job Search & Top AI Matches
                  </h2>
                  <p className={styles.sectionSubtitle}>Recommended positions matching your skills and experience</p>
                </div>
                <button className={styles.sectionLink} onClick={() => router.push('/jobs')}>
                  View all ({dataList.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.jobList}>
                {dataList.slice(0, 4).map((job, idx) => (
                  <div key={job._id || idx} className={styles.jobCard} onClick={() => router.push(`/jobs`)}>
                    <div className={styles.jobLogo}>
                      {job.company?.name?.[0] || 'T'}
                    </div>
                    <div className={styles.jobInfo}>
                      <div className={styles.jobRole}>{job.title}</div>
                      <div className={styles.jobMeta}>
                        <span className={styles.jobMetaItem}><Building2 size={12} /> {job.company?.name || 'TalentFlow Tech'}</span>
                        <span className={styles.jobMetaItem}><MapPin size={12} /> {job.location || 'Remote'}</span>
                        <Badge variant="secondary">{job.type || 'Full-time'}</Badge>
                      </div>
                    </div>
                    <div className={styles.jobRight}>
                      <span className={`${styles.matchBadge} ${styles.matchHigh}`}>
                        <Sparkles size={11} /> 94% Match
                      </span>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push('/jobs'); }}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Upcoming Interview & Profile Completeness */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Upcoming Interview Card */}
              <Card>
                <div className={styles.sectionHeader} style={{ marginBottom: '0.75rem' }}>
                  <div className={styles.sectionTitle} style={{ fontSize: '1rem' }}>
                    <CalendarDays size={16} /> Upcoming Interview
                  </div>
                  <Badge variant="primary">Confirmed</Badge>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.938rem', color: 'var(--text-primary)' }}>
                    Technical Architecture Round
                  </div>
                  <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    TalentFlow Technologies • Senior Frontend Engineer
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> Tomorrow, 2:00 PM EST
                    </span>
                    <span>Interviewer: Sarah Jenkins</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="ai" fullWidth onClick={() => router.push('/interview-simulator')}>
                    <Sparkles size={13} /> Practice Mock Prep
                  </Button>
                  <Button size="sm" variant="outline" fullWidth onClick={() => router.push('/interviews')}>
                    Details
                  </Button>
                </div>
              </Card>

              {/* Profile Completeness Gauge */}
              <Card>
                <div className={styles.gaugeWrap}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Profile Completeness</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doneTasks} of {profileTasks.length} milestones complete</div>
                  </div>
                  <div className={styles.gaugePct}>{profilePct}%</div>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${profilePct}%` }} />
                </div>
                <div className={styles.checklist}>
                  {profileTasks.map((t, i) => (
                    <div key={i} className={`${styles.checkItem} ${t.done ? styles.done : ''}`}>
                      {t.done 
                        ? <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        : <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--text-tertiary)', flexShrink: 0 }} />
                      }
                      <span>{t.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ─── Recruiter View ─── */}
      {isRecruiter && (
        <>
          {/* ATS Performance Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                  <Briefcase size={18} />
                </div>
                <span className={styles.statTrend}>Openings</span>
              </div>
              <div className={styles.statLabel}>Active Jobs</div>
              <div className={styles.statValue}>{stats?.jobs || 4}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Users size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>Verified</span>
              </div>
              <div className={styles.statLabel}>Total Candidates</div>
              <div className={styles.statValue}>{stats?.candidates || 4}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                  <CalendarDays size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>Active</span>
              </div>
              <div className={styles.statLabel}>In Interview</div>
              <div className={styles.statValue}>{interviewCount}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <Award size={18} />
                </div>
                <span className={styles.statTrend}>Offers</span>
              </div>
              <div className={styles.statLabel}>Offers Extended</div>
              <div className={styles.statValue}>{offerCount}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)' }}>
                  <Clock size={18} />
                </div>
                <span className={styles.statTrend}>Industry Target</span>
              </div>
              <div className={styles.statLabel}>Time to Hire</div>
              <div className={styles.statValue}>18<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}> days</span></div>
            </div>
          </div>

          {/* Hiring Funnel & Jobs Needing Attention */}
          <Card>
            <div className={styles.sectionHeader} style={{ marginBottom: '0.5rem' }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <TrendingUp size={18} /> Current Hiring Pipeline Funnel
                </h2>
                <p className={styles.sectionSubtitle}>Candidate distribution across active recruitment stages</p>
              </div>
            </div>

            <div className={styles.funnelGrid}>
              <div className={styles.funnelStep}>
                <div className={styles.funnelVal}>{totalApps}</div>
                <div className={styles.funnelLabel}>Applied</div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelVal}>{screeningCount}</div>
                <div className={styles.funnelLabel}>Screening</div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelVal}>{interviewCount}</div>
                <div className={styles.funnelLabel}>Interview</div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelVal}>{offerCount}</div>
                <div className={styles.funnelLabel}>Offer</div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelVal}>{hiredCount}</div>
                <div className={styles.funnelLabel}>Hired</div>
              </div>
            </div>
          </Card>

          {/* Applications Queue & Recent Activity */}
          <div className={styles.twoCol}>
            {/* Recent Applications */}
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>
                    <FileText size={18} /> Recent Applications
                  </h2>
                  <p className={styles.sectionSubtitle}>Click candidate to open candidate profile drawer</p>
                </div>
                <button className={styles.sectionLink} onClick={() => router.push('/candidates')}>
                  View all talent <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.jobList}>
                {dataList.slice(0, 5).map((app, idx) => {
                  const candidate = app.candidateId || {};
                  const job = app.jobId || {};
                  const match = app.matchScore || 85;

                  return (
                    <div 
                      key={app._id || idx} 
                      className={styles.jobCard}
                      onClick={() => handleOpenDrawer(app)}
                    >
                      <div className={styles.jobLogo}>
                        {candidate.fname?.[0] || 'C'}
                      </div>
                      <div className={styles.jobInfo}>
                        <div className={styles.jobRole}>{candidate.fname} {candidate.lname}</div>
                        <div className={styles.jobMeta}>
                          <span className={styles.jobMetaItem}><Briefcase size={12} /> {job.title || 'Senior Frontend Engineer'}</span>
                          <span className={styles.jobMetaItem}><Clock size={12} /> {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={styles.jobRight}>
                        <span className={`${styles.matchBadge} ${match >= 85 ? styles.matchHigh : styles.matchMed}`}>
                          <Sparkles size={11} /> {match}%
                        </span>
                        <Badge variant={app.status === 'interview' ? 'primary' : 'secondary'}>
                          {app.status || 'Applied'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Jobs Needing Attention & Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card>
                <div className={styles.sectionHeader} style={{ marginBottom: '0.75rem' }}>
                  <div className={styles.sectionTitle} style={{ fontSize: '1rem' }}>
                    <AlertCircle size={16} /> Jobs Needing Attention
                  </div>
                  <Badge variant="warning">Action Req</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Senior Frontend Engineer</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      3 candidates awaiting initial screening review.
                    </div>
                    <Button size="sm" variant="outline" style={{ marginTop: '0.5rem' }} onClick={() => router.push('/candidates')}>
                      Review Candidates
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Activity Log */}
              <Card>
                <div className={styles.sectionHeader} style={{ marginBottom: '0.75rem' }}>
                  <div className={styles.sectionTitle} style={{ fontSize: '1rem' }}>
                    <Clock size={16} /> Recent Audit Activity
                  </div>
                </div>
                <div className={styles.activityFeed}>
                  {activities.length > 0 ? (
                    activities.slice(0, 4).map((act, i) => (
                      <div key={act._id || i} className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div>
                          <div className={styles.activityText}>{act.action}: {act.details || 'System activity'}</div>
                          <div className={styles.activityTime}>{new Date(act.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.activityItem}>
                      <div className={styles.activityDot} />
                      <div>
                        <div className={styles.activityText}>Application received for Senior Frontend Engineer</div>
                        <div className={styles.activityTime}>Today, 10:14 AM</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ─── Admin View ─── */}
      {isAdmin && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                  <Users size={18} />
                </div>
                <span className={styles.statTrend}>Platform</span>
              </div>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statValue}>{stats?.candidates || 6}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <Building2 size={18} />
                </div>
                <span className={styles.statTrend}>Partners</span>
              </div>
              <div className={styles.statLabel}>Companies</div>
              <div className={styles.statValue}>4</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Briefcase size={18} />
                </div>
                <span className={styles.statTrend}>Openings</span>
              </div>
              <div className={styles.statLabel}>Active Jobs</div>
              <div className={styles.statValue}>{stats?.jobs || 4}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                  <ShieldAlert size={18} />
                </div>
                <span className={`${styles.statTrend} ${styles.up}`}>Queue</span>
              </div>
              <div className={styles.statLabel}>Pending Verification</div>
              <div className={styles.statValue}>{stats?.pendingVerifications || 0}</div>
            </div>
          </div>

          <div className={styles.equalTwoCol}>
            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Users size={18} /> User Management Control
                </div>
                <Button size="sm" variant="outline" onClick={() => router.push('/candidates')}>
                  Open Directory
                </Button>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Audit platform identities, manage recruiter enterprise credentials, and control access permissions.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="primary" onClick={() => router.push('/candidates')}>
                  Manage Users
                </Button>
                <Button size="sm" variant="secondary" onClick={() => router.push('/verification')}>
                  Review Approvals
                </Button>
              </div>
            </Card>

            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <ShieldCheck size={18} /> Security & System Audit
                </div>
                <Button size="sm" variant="outline" onClick={() => router.push('/audit')}>
                  View Logs
                </Button>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time security tracking, authorization events, and platform activity records.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" onClick={() => router.push('/reports')}>
                  Platform Analytics
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Candidate Profile Drawer (for recruiter interactions) */}
      <CandidateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidate={selectedCandidate}
        application={selectedApp}
        onStageChange={async (appId, newStage) => {
          try {
            await api.put(`/applications/${appId}`, { status: newStage });
            setIsDrawerOpen(false);
          } catch (err) {
            console.error("Stage error:", err);
          }
        }}
      />
    </div>
  );
}
