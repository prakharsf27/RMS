'use client';
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Table } from "../components/ui/Table";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { format } from "date-fns";
import { Shield, Clock, Search, Filter, RefreshCw, Download } from "lucide-react";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/audit");
      setLogs(data || []);
    } catch (err) {
      console.error("Audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("AUTH")) {
      return <Badge variant="info">{action}</Badge>;
    }
    if (act.includes("VERIF") || act.includes("APPROV") || act.includes("HIRE")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (act.includes("REJECT") || act.includes("DELETE") || act.includes("REVOKE")) {
      return <Badge variant="danger">{action}</Badge>;
    }
    if (act.includes("STAGE") || act.includes("STATUS") || act.includes("UPDATE")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="neutral">{action}</Badge>;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery.trim() || 
      `${log.userId?.fname || ''} ${log.userId?.lname || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "auth") return (log.action || '').toLowerCase().includes("login") || (log.action || '').toLowerCase().includes("auth");
    if (selectedFilter === "hiring") return (log.action || '').toLowerCase().includes("stage") || (log.action || '').toLowerCase().includes("hire") || (log.action || '').toLowerCase().includes("interview");
    if (selectedFilter === "admin") return (log.action || '').toLowerCase().includes("verif") || (log.action || '').toLowerCase().includes("admin");
    return true;
  });

  const headers = ["Timestamp", "Security Principal", "Operation", "Audit Trace & Context"];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
            System Audit & Governance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Immutable event logs, privileged administrative actions, and security compliance records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Logs
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", jsonStr);
            downloadAnchor.setAttribute("download", `talentflow_audit_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}>
            <Download size={14} /> Export JSON
          </Button>
        </div>
      </div>

      <Card style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-subtle)',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              width: '100%',
              maxWidth: '380px'
            }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search by member, action, or details..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'all', label: 'All Events' },
              { id: 'auth', label: 'Authentication' },
              { id: 'hiring', label: 'Pipeline / Hiring' },
              { id: 'admin', label: 'Administrative' }
            ].map(tab => (
              <Button 
                key={tab.id}
                variant={selectedFilter === tab.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner label="Decrypting enterprise audit logs..." />
      ) : filteredLogs.length > 0 ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            headers={headers}
            data={filteredLogs}
            renderRow={(log) => (
              <tr key={log._id}>
                <td style={{ whiteSpace: "nowrap", color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  {log.timestamp ? format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss") : "N/A"}
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.userId?.fname || 'System'} {log.userId?.lname || ''}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    {log.userId?.role || 'Service Account'}
                  </div>
                </td>
                <td>
                  {getActionBadge(log.action)}
                </td>
                <td style={{ maxWidth: '400px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {log.details || 'No extended metadata'}
                </td>
              </tr>
            )}
          />
        </Card>
      ) : (
        <EmptyState
          icon={Shield}
          title="No Audit Records Found"
          description={searchQuery ? "No log entries match your active search and filter parameters." : "No system events recorded in the current compliance cycle."}
          actionLabel={searchQuery ? "Reset Filters" : undefined}
          onAction={searchQuery ? () => { setSearchQuery(""); setSelectedFilter("all"); } : undefined}
        />
      )}
    </div>
  );
}
