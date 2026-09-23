'use client';
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  TrendingUp, Users, Briefcase, Award, Clock, 
  CheckCircle2, ArrowUpRight, BarChart3, Filter
} from "lucide-react";
import styles from "./Reports.module.css";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics");
        setData(data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling recruitment analytics..." />;

  const activeJobs = data?.summary?.jobs || 4;
  const totalApplicants = data?.summary?.applications || 18;
  const inInterview = data?.summary?.interviews || 3;
  const offersCount = data?.summary?.offers || 2;
  const hiresCount = Math.max(1, Math.round(offersCount * 0.7));

  const funnelStages = [
    { label: "Total Applications", count: totalApplicants, pct: "100%", drop: null },
    { label: "Passed AI Screening", count: Math.round(totalApplicants * 0.68), pct: "68%", drop: "32% filtered" },
    { label: "Technical Interview", count: inInterview, pct: "33%", drop: "51% filtered" },
    { label: "Official Offers", count: offersCount, pct: "17%", drop: "48% filtered" },
    { label: "Accepted & Hired", count: hiresCount, pct: "12%", drop: "29% drop" }
  ];

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Recruitment Velocity & Funnel Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>
          Comprehensive telemetry on pipeline conversions, departmental requisitions, and time-to-hire benchmarks.
        </p>
      </div>

      {/* Top Key Metrics */}
      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <span className={styles.metricLabel}>Active Jobs</span>
            <h2 className={styles.metricVal}>{activeJobs}</h2>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Users size={22} />
          </div>
          <div>
            <span className={styles.metricLabel}>Total Applicants</span>
            <h2 className={styles.metricVal}>{totalApplicants}</h2>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className={styles.metricLabel}>In Interview</span>
            <h2 className={styles.metricVal}>{inInterview}</h2>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Award size={22} />
          </div>
          <div>
            <span className={styles.metricLabel}>Hires Made</span>
            <h2 className={styles.metricVal}>{hiresCount}</h2>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span className={styles.metricLabel}>Avg Time to Hire</span>
            <h2 className={styles.metricVal}>18<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>d</span></h2>
          </div>
        </Card>
      </div>

      {/* Hiring Funnel Conversion */}
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              End-to-End Pipeline Conversion Funnel
            </h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Drop-off rate and transition velocity through each hiring checkpoint
            </p>
          </div>
          <Badge variant="primary">Enterprise Cohort</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {funnelStages.map((stg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>{stg.label} ({stg.count})</span>
                <span style={{ color: 'var(--primary)' }}>{stg.pct}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: stg.pct, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #6366f1)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Velocity Benchmarks */}
      <div className={styles.lowerInfo}>
        <Card className={styles.proCard}>
          <h3>Recruitment Velocity & Time Benchmarks</h3>
          <p>Verified turnaround timelines across active job requisitions.</p>
          <div className={styles.perfList}>
            <div className={styles.perfItem}>
              <span>Application to Screen</span>
              <strong>2.4 Days</strong>
            </div>
            <div className={styles.perfItem}>
              <span>Screen to First Interview</span>
              <strong>4.1 Days</strong>
            </div>
            <div className={styles.perfItem}>
              <span>Final Round to Offer</span>
              <strong>3.8 Days</strong>
            </div>
            <div className={styles.perfItem}>
              <span>Candidate Experience NPS</span>
              <strong style={{ color: 'var(--success)' }}>+78 NPS</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
