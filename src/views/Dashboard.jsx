'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { 
  LayoutDashboard, Briefcase, FileText, MessageSquare, 
  CalendarDays, User, Users, Bell, Search, ChevronLeft, ChevronRight, 
  TrendingUp, Eye, Zap, Award, LogOut, Settings, Sparkles, ShieldAlert,
  ArrowRight, Clock, CheckCircle, MapPin, Building2, Menu,
  Bot, Star, Bookmark, BarChart3, CheckSquare, ChevronDown,
  ArrowUpRight, Flame, Target, X, Send
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import styles from "./Dashboard.module.css";

/* ─── ANIMATED COUNTER ───────────────────────────────────────── */
function useCounter(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let rafId;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(target * ease));
      if (t < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return count;
}

/* ─── COMPONENTS ─────────────────────────────────────────────── */

function StatCardItem({ label, value, icon: Icon, color, bg, trend, up, delay }) {
  const count = useCounter(value);
  return (
    <div className={`${styles.statCard} anim-${delay}`}>
      <div className={styles.statIconWrap} style={{ background: bg }}>
        <Icon size={20} style={{ color: color }} />
      </div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{count.toLocaleString()}</div>
      {trend && (
        <div className={`${styles.statTrend} ${up ? styles.up : ""}`}>
          {up && <ArrowUpRight size={13} />}
          {trend}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "10px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#818cf8", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 12, color: p.color, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name}</span><span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── DATA ───────────────────────────────────────────────────── */

const COMPANIES = ["Amazon", "Meta", "Microsoft", "Netflix", "Tesla", "NVIDIA", "IBM", "Apple", "Google", "Salesforce", "Adobe", "Spotify"];

const PROFILE_ITEMS = [
  { label: "Basic Info", done: true },
  { label: "Work Experience", done: true },
  { label: "Skills & Expertise", done: true },
  { label: "Resume Uploaded", done: true },
  { label: "Portfolio Link", done: false },
  { label: "References", done: false },
];

const RECRUITER_TASKS = [
  { label: "Update company profile", done: false },
  { label: "Post your first job", done: false },
  { label: "Review applications", done: false },
  { label: "Schedule an interview", done: false },
];

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [dataList, setDataList] = useState([]); // Jobs for candidates, Recent Applications for recruiters
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes, compRes] = await Promise.all([
          api.get('/analytics'),
          user.role === 'candidate' ? api.get('/jobs/recommended') : api.get('/applications?limit=5'),
          api.get('/companies')
        ]);
        setStats(statsRes.data.summary);
        setChartData(statsRes.data.chartData || []);
        setActivities(statsRes.data.activities || []);
        setCompanies(compRes.data.map(c => c.name));
        
        // FIX: applications endpoint returns array directly, not {applications: []}
        setDataList(user.role === 'candidate' ? listRes.data : (listRes.data.applications || listRes.data));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (isLoading) return <LoadingSpinner label="Personalizing your workspace..." />;

  const isCandidate = user.role === 'candidate';
  const isAdmin = user.role === 'admin';

  const dashboardStats = isCandidate ? [
    { label: "APPLIED", value: stats?.applications || 0, icon: FileText, color: "#6366f1", bg: "rgba(99,102,241,0.15)", trend: stats?.applications > 0 ? "Real-time" : "Ready to start", up: true },
    { label: "INTERVIEWS", value: stats?.interviews || 0, icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.15)", trend: "Next session", up: true },
    { label: "OFFERS", value: stats?.offers || 0, icon: Award, color: "#10b981", bg: "rgba(16,185,129,0.15)", trend: "Pipeline status", up: false },
    { label: "PROFILE VIEWS", value: stats?.profileViews || 0, icon: Eye, color: "#c084fc", bg: "rgba(192,132,252,0.15)", trend: "Total activity", up: true },
  ] : isAdmin ? [
    { label: "TOTAL USERS", value: stats?.candidates || 0, icon: Users, color: "#6366f1", bg: "rgba(99,102,241,0.15)", trend: "Platform size", up: true },
    { label: "ALL JOBS", value: stats?.jobs || 0, icon: Briefcase, color: "#f59e0b", bg: "rgba(245,158,11,0.15)", trend: "Market volume", up: true },
    { label: "TOTAL APPS", value: stats?.applications || 0, icon: FileText, color: "#10b981", bg: "rgba(16,185,129,0.15)", trend: "System traffic", up: true },
    { label: "PENDING VERIF", value: stats?.pendingVerifications || 0, icon: ShieldAlert, color: "#ef4444", bg: "rgba(239,68,68,0.15)", trend: "Needs review", up: false },
  ] : [
    { label: "TOTAL CANDIDATES", value: stats?.candidates || 0, icon: User, color: "#6366f1", bg: "rgba(99,102,241,0.15)", trend: "Network size", up: true },
    { label: "ACTIVE JOBS", value: stats?.jobs || 0, icon: Briefcase, color: "#f59e0b", bg: "rgba(245,158,11,0.15)", trend: "Open requirements", up: false },
    { label: "APPLICATIONS", value: stats?.applications || 0, icon: FileText, color: "#10b981", bg: "rgba(16,185,129,0.15)", trend: "Queue volume", up: true },
    { label: "INTERVIEWS", value: stats?.interviews || 0, icon: Zap, color: "#c084fc", bg: "rgba(192,132,252,0.15)", trend: "Schedule load", up: true },
  ];

  const profileTasks = isCandidate ? PROFILE_ITEMS : RECRUITER_TASKS;
  const doneTasks = profileTasks.filter(t => t.done).length;
  const taskPct = Math.round((doneTasks / profileTasks.length) * 100);

  return (
    <div className={styles.page}>
      {/* ─── Hero Section ─── */}
      <div className={`${styles.hero} anim-0`}>
        <div className={styles.heroContent}>
          <div className={styles.heroGreeting}>Welcome back, {user.fname}! 👋</div>
          <div className={styles.heroSub}>
            {isCandidate 
              ? `You have ${stats?.jobs || 0} active matching jobs and ${stats?.interviews || 0} interview(s) in your pipeline.`
              : `You have ${dataList?.length || 0} new applications to review today.`}
          </div>
          <div className={styles.heroChips}>
            {isCandidate ? (
              <>
                <div className={styles.heroChip}><Zap size={12} /> {stats?.interviews || 0} scheduled interviews</div>
                <div className={styles.heroChip}><FileText size={12} /> {stats?.applications || 0} active applications</div>
                <div className={styles.heroChip}><TrendingUp size={12} /> {stats?.profileViews || 0} profile views</div>
              </>
            ) : (
              <>
                <div className={styles.heroChip}><Users size={12} /> {stats?.candidates || 0} total candidates</div>
                <div className={styles.heroChip}><MessageSquare size={12} /> {stats?.unreadMessages || 0} unread messages</div>
                <div className={styles.heroChip}><CheckCircle size={12} /> {stats?.jobs || 0} active job posts</div>
              </>
            )}
          </div>
        </div>
        <div className={styles.heroRight}>
          <button className={styles.heroCta} onClick={() => router.push(isCandidate ? '/jobs' : '/applications')}>
            {isCandidate ? <Briefcase size={15} /> : <FileText size={15} />} 
            {isCandidate ? 'Browse Jobs' : 'Review Apps'} <ArrowRight size={14} />
          </button>
          <button className={styles.heroCtaSecondary}>
            <Sparkles size={14} /> AI Insights
          </button>
        </div>
      </div>

      {/* ─── Dashboard Mockup (Dynamic) ─── */}
      <div className={`${styles.heroMockup} anim-2`}>
        <div className={styles.mmBar}>
          <div className={styles.mmDot} style={{ background: "#ef4444" }}></div>
          <div className={styles.mmDot} style={{ background: "#f59e0b" }}></div>
          <div className={styles.mmDot} style={{ background: "#22c55e" }}></div>
          <div className={styles.mmBarSearch}></div>
        </div>
        <div className={styles.mmBody}>
          <div className={styles.mmSidebar}>
            <div className={styles.mmLogoRow}>
              <div className={styles.mmLogoIco}>T</div>
              <span className={styles.mmLogoTxt}>TalentFlow</span>
            </div>
            <div className={cn(styles.mmNavItem, styles.mmNavItemActive)}>
              <LayoutDashboard size={12} /> Dashboard
            </div>
            <div className={styles.mmNavItem}><Briefcase size={12} /> Jobs</div>
            <div className={styles.mmNavItem}><FileText size={12} /> Applications</div>
            <div className={styles.mmNavItem}><MessageSquare size={12} /> Messages</div>
          </div>
          <div className={styles.mmMain}>
            <div className={styles.mmHeroCard}>
              <div>
                <div className={styles.mmGreeting}>Welcome, {user.fname}</div>
                <div className={styles.mmGreetingSub}>
                  {isCandidate ? `${stats?.jobs || 0} active jobs` : `${stats?.candidates || 0} talent pool`}
                </div>
              </div>
              <div className={styles.mmHeroBtn}>{isCandidate ? 'Jobs' : 'Talent'}</div>
            </div>
            <div className={styles.mmStatsGrid}>
              <div className={styles.mmStatCard}>
                <div className={styles.mmStatVal} style={{ color: "#818cf8" }}>{stats?.applications || 0}</div>
                <div className={styles.mmStatLbl}>APPS</div>
              </div>
              <div className={styles.mmStatCard}>
                <div className={styles.mmStatVal} style={{ color: "#f59e0b" }}>{stats?.interviews || 0}</div>
                <div className={styles.mmStatLbl}>INTV</div>
              </div>
              <div className={styles.mmStatCard}>
                <div className={styles.mmStatVal} style={{ color: "#34d399" }}>{isCandidate ? (stats?.offers || 0) : (stats?.jobs || 0)}</div>
                <div className={styles.mmStatLbl}>{isCandidate ? 'OFFER' : 'JOBS'}</div>
              </div>
            </div>
            <div className={styles.mmJobList}>
              {dataList?.slice(0, 2).map((item, i) => (
                <div className={styles.mmJobItem} key={i}>
                  <div className={styles.mmJobLogo} style={{ background: 'var(--premium-gradient)' }}>
                    {(isCandidate ? item.company?.name?.[0] : item.candidate?.fname?.[0]) || 'T'}
                  </div>
                  <div className={styles.mmJobInfoSmall}>
                    <div className={styles.mmJobRole}>{isCandidate ? item.title : `${item.candidate?.fname} ${item.candidate?.lname}`}</div>
                    <div className={styles.mmJobMatch}>{isCandidate ? `${item.matchScore || 0}%` : 'New'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.card} anim-1`} style={{ marginTop: 24, marginBottom: 24 }}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Top {isCandidate ? 'Hiring Companies' : 'Talent Partners'}</div>
            <div className={styles.cardSubtitle}>Industry leaders within the TalentFlow system</div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.marqueeOuter}>
            <div className={styles.marqueeTrack}>
              {companies.map((c, i) => (
                <span className={styles.companyTag} key={i}>{c}</span>
              ))}
              {companies.map((c, i) => (
                <span className={styles.companyTag} key={`clone-${i}`}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* ─── Stats Grid ─── */}
      <div className={styles.statsGrid}>
        {dashboardStats.map((s, i) => <StatCardItem key={s.label} {...s} delay={i + 1} />)}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className={styles.twoCol}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          <div className={`${styles.card} anim-3`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{isCandidate ? 'Recommended Jobs' : 'Recent Applications'}</div>
                <div className={styles.cardSubtitle}>
                  {isCandidate ? 'Based on your professional identity' : 'Latest candidates joining the pipeline'}
                </div>
              </div>
              <span className={styles.sectionLink} onClick={() => router.push(isCandidate ? '/jobs' : '/applications')}>
                View all <ArrowRight size={12} />
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.jobList}>
                {isCandidate ? (
                  dataList?.map((job, i) => {
                    const match = job.matchScore || 0;
                    return (
                      <div className={styles.jobCard} key={job._id || i} onClick={() => router.push(`/jobs/${job._id}`)}>
                        <div className={styles.jobLogo} style={{ background: 'var(--premium-gradient)', opacity: 0.9 }}>
                          {job.company?.name?.[0] || 'J'}
                        </div>
                        <div className={styles.jobInfo}>
                          <div className={styles.jobRole}>{job.title}</div>
                          <div className={styles.jobMeta}>
                            <span className={styles.jobMetaItem}><Building2 size={11} />{job.company?.name || 'MNC'}</span>
                            <span className={styles.jobMetaItem}><MapPin size={11} />{job.location}</span>
                            <span className={styles.typeTag}>{job.type || 'Full-time'}</span>
                          </div>
                        </div>
                        <div className={styles.jobRight}>
                          <div className={`${styles.matchBadge} ${match >= 90 ? styles.matchHigh : styles.matchMed}`} style={{ 
                            background: match >= 90 ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                            color: match >= 90 ? '#34d399' : '#818cf8'
                          }}>
                            {match}% match
                          </div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button className={styles.applyBtn}>Quick Apply</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  dataList?.map((app, i) => (
                    <div className={styles.jobCard} key={app._id || i} onClick={() => router.push(`/applications/${app._id}`)}>
                      <div className={styles.jobLogo} style={{ background: 'var(--premium-gradient)', opacity: 0.8 }}>
                        {app.candidate?.fname?.[0] || 'C'}
                      </div>
                      <div className={styles.jobInfo}>
                        <div className={styles.jobRole}>{app.candidate?.fname} {app.candidate?.lname}</div>
                        <div className={styles.jobMeta}>
                          <span className={styles.jobMetaItem}><Briefcase size={11} />{app.job?.title}</span>
                          <span className={styles.typeTag} style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{app.status}</span>
                        </div>
                      </div>
                      <div className={styles.jobRight}>
                        <div className={styles.jobMetaItem}><Clock size={11} />{new Date(app.createdAt).toLocaleDateString()}</div>
                        <button className={styles.applyBtn} style={{ background: 'var(--bg-elevated-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Details</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 20 }}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Recent Activity</div>
                <div className={styles.cardSubtitle}>Your latest system interactions</div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.activityFeed}>
                {activities.length > 0 ? (
                  activities.map((act, i) => (
                    <div className={styles.activityItem} key={act._id || i}>
                      <div className={styles.activityDot} style={{ background: 'var(--primary)' }} />
                      <div className={styles.activityContent}>
                        <p className={styles.activityAction}>{act.action}: {act.details || 'System event'}</p>
                        <span className={styles.activityTime}>{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyActivity}>
                    <p>No recent activity recorded.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          <div className={`${styles.card} anim-4`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{isCandidate ? 'Application Activity' : 'Hiring Pipeline'}</div>
                <div className={styles.cardSubtitle}>Monthly performance overview</div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#6366f1" }} />Apps</div>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#f59e0b" }} />Interviews</div>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#10b981" }} />Placements</div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Applications" stroke="#6366f1" strokeWidth={2} fill="url(#gApp)" dot={false} />
                    <Area type="monotone" dataKey="Interviews" stroke="#f59e0b" strokeWidth={2} fill="url(#gInt)" dot={false} />
                    <Area type="monotone" dataKey="Hired" stroke="#10b981" strokeWidth={2} fill="url(#gOff)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`${styles.card} anim-5`} style={{ marginTop: 20 }}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{isCandidate ? 'Profile Strength' : 'Recruitment Health'}</div>
                <div className={styles.cardSubtitle}>{doneTasks} of {profileTasks.length} objectives met</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{taskPct}%</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.progressBar} style={{ marginBottom: 14 }}>
                <div className={styles.progressFill} style={{ width: `${taskPct}%` }} />
              </div>
              <div className={styles.profileItems}>
                {profileTasks.map((item) => (
                  <div key={item.label} className={`${styles.profileItem} ${item.done ? styles.done : styles.pending}`}>
                    {item.done
                      ? <CheckSquare size={14} style={{ color: "#6366f1", flexShrink: 0 }} />
                      : <div style={{ width: 14, height: 14, borderRadius: 4, border: "1.5px solid #334155", flexShrink: 0 }} />}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
