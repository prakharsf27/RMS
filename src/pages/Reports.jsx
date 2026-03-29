import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { BarChart, PieChart } from "../components/ui/Chart";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { TrendingUp, Users, Briefcase, Award } from "lucide-react";
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

  if (loading) return <LoadingSpinner label="Aggregating dataset..." />;

  const hiredCount = data.byStatus.find(s => s._id === 'offered')?.count || 0;
  const rejectedCount = data.byStatus.find(s => s._id === 'rejected')?.count || 0;
  const appliedCount = data.byStatus.find(s => s._id === 'applied')?.count || 0;
  const totalApps = data.summary.applications || 1;

  const barData = data.byDepartment.map(dept => ({
    label: dept._id,
    value: dept.count,
    color: "var(--primary)"
  }));

  const pieData = [
    { label: "Hired", value: hiredCount / totalApps, color: "var(--success)" },
    { label: "Rejected", value: rejectedCount / totalApps, color: "var(--danger)" },
    { label: "In Pipeline", value: appliedCount / totalApps, color: "var(--info)" }
  ];

  const metrics = [
    { label: "Hiring Success", val: `${((hiredCount / totalApps) * 100).toFixed(1)}%`, icon: TrendingUp, color: "var(--success)" },
    { label: "Total Talent Pool", val: data.summary.candidates, icon: Users, color: "var(--primary)" },
    { label: "Active Roles", val: data.summary.jobs, icon: Briefcase, color: "var(--info)" },
    { label: "Interviews Held", val: data.summary.interviews, icon: Award, color: "var(--warning)" }
  ];

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="text-gradient">Analytics & Reports</h1>
        <p>Real-time insights into your organization's recruitment performance.</p>
      </div>

      <div className={styles.metricsGrid}>
         {metrics.map((m, i) => (
            <Card key={i} className={styles.metricCard}>
               <div className={styles.iconWrapper} style={{ backgroundColor: m.color, color: 'white' }}>
                  <m.icon size={24} />
               </div>
               <div>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <h2 className={styles.metricVal}>{m.val}</h2>
               </div>
            </Card>
         ))}
      </div>

      <div className={styles.chartsGrid}>
         <Card className={styles.chartCard}>
            <BarChart 
               title="Application Volume by Department" 
               data={barData} 
            />
         </Card>
         <Card className={styles.chartCard}>
            <PieChart 
               title="Candidate Selection Ratio" 
               data={pieData} 
            />
         </Card>
      </div>

      <div className={styles.lowerInfo}>
         <Card className={styles.proCard}>
            <h3>Recruiter Performance Metrics</h3>
            <p>Data-driven insights to optimize your hiring efficiency.</p>
            <div className={styles.perfList}>
               <div className={styles.perfItem}>
                  <span>Average Time to Hire</span>
                  <strong>14 Days</strong>
               </div>
               <div className={styles.perfItem}>
                  <span>Cost per Hire (Est)</span>
                  <strong>$1,240</strong>
               </div>
               <div className={styles.perfItem}>
                  <span>Offer Acceptance Rate</span>
                  <strong>88%</strong>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
