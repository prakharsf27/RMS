import { useState, useEffect } from "react";
import api from "../lib/api";
import { Table } from "../components/ui/Table";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { format } from "date-fns";
import { Shield, Clock } from "lucide-react";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get("/audit");
        setLogs(data);
      } catch (err) {
        console.error("Audit fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const headers = ["Timestamp", "Member", "Action", "Observation"];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Security Protocol</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>System-wide event auditing and administrative oversight logs.</p>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner label="Decrypting archives..." />
      ) : logs.length > 0 ? (
        <Table
          headers={headers}
          data={logs}
          renderRow={(log) => (
            <tr key={log._id}>
              <td style={{ whiteSpace: "nowrap", color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{log.userId?.fname} {log.userId?.lname}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{log.userId?.role}</div>
              </td>
              <td>
                <div style={{ 
                    display: 'inline-block', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: 'var(--bg-elevated-hover)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                }}>
                    {log.action}
                </div>
              </td>
              <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{log.details}</td>
            </tr>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <Clock size={48} style={{ margin: '0 auto 1rem' }} />
            <p>No activity recorded in the latest cycle.</p>
        </div>
      )}
    </div>
  );
}
