import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import tableStyles from "../components/ui/Table.module.css";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { CheckCircle2, XCircle, Trash2, Clock, CheckSquare, Square, Mail } from "lucide-react";
import { format } from "date-fns";

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/applications");
      setApplications(data);
    } catch (err) {
      console.error("Fetch apps error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await api.put("/applications/bulk/status", { ids: selectedIds, status });
      setSelectedIds([]);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} records? This cannot be undone.`)) {
        try {
          await api.delete("/applications/bulk/delete", { data: { ids: selectedIds } });
          setSelectedIds([]);
          fetchApplications();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        }
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const headers = [
    user.role !== "candidate" && (
      <div style={{ width: '18px', display: 'flex', justifyContent: 'center' }}><Square size={16} /></div>
    ),
    <div style={{ minWidth: '200px' }}>{user.role === "candidate" ? "Company" : "Candidate"}</div>, 
    user.role === "candidate" && <div style={{ minWidth: '150px' }}>Job Role</div>, 
    <div style={{ minWidth: '120px' }}>Applied Date</div>, 
    user.role === "candidate" && <div style={{ minWidth: '100px' }}>Match Score</div>,
    <div style={{ minWidth: '100px' }}>Status</div>, 
    user.role !== "candidate" && "Actions"
  ].filter(Boolean);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
            {user.role === "candidate" ? "My Applications" : "Hiring Pipeline"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {user.role === "candidate" ? "Track your active job applications." : "Manage candidate progression and hiring decisions."}
          </p>
        </div>
      </div>

      {selectedIds.length > 0 && user.role !== "candidate" && (
        <div className="animate-fade-in" style={{ 
            backgroundColor: 'var(--bg-elevated)', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--primary-light)',
            boxShadow: 'var(--shadow-glow)'
        }}>
            <span style={{ fontWeight: 600 }}>{selectedIds.length} applications selected</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button size="sm" variant="success" onClick={() => handleBulkStatus('offered')}>Bulk Hire</Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkStatus('rejected')}>Bulk Reject</Button>
                {user.role === 'admin' && (
                    <Button size="sm" variant="secondary" onClick={handleBulkDelete} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={16} /> Delete
                    </Button>
                )}
            </div>
        </div>
      )}

      <Card>
        {loading ? (
          <LoadingSpinner label="Synchronizing pipeline..." />
        ) : applications.length > 0 ? (
          <Table 
            headers={headers} 
            data={applications} 
            renderRow={(app) => {
              const isSelected = selectedIds.includes(app._id);
              const candidate = app.candidateId || { fname: 'Deleted', lname: 'User', email: 'N/A', avatar: 'https://ui-avatars.com/api/?name=Deleted+User' };
              const job = app.jobId || { title: 'Unknown Role', department: 'Unknown' };

              return (
                <tr key={app._id} style={{ backgroundColor: isSelected ? 'var(--bg-elevated-hover)' : 'transparent' }}>
                  {user.role !== "candidate" && (
                    <td className={tableStyles.selectionCell}>
                      <button 
                          onClick={() => toggleSelect(app._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}
                      >
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                  )}

                  <td>
                    {user.role === "candidate" ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: '200px' }}>
                         <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '8px', 
                            background: 'var(--bg-elevated-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            {job.company?.logo ? (
                                <img src={job.company.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            ) : (
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                  {job.company?.name?.[0] || 'C'}
                                </span>
                            )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{job.company?.name || "TalentFlow Partner"}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{job.company?.industry || "Technology"}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
                        <img src={candidate.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{candidate.fname} {candidate.lname}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{candidate.email}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  {user.role === "candidate" && (
                    <td>
                      <div style={{ fontWeight: 600, minWidth: '150px' }}>{job.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{job.department}</div>
                    </td>
                  )}
                  <td>{app.appliedAt ? format(new Date(app.appliedAt), "MMM d, yyyy") : 'N/A'}</td>
                  {user.role === "candidate" && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              border: `3px solid ${app.matchScore > 70 ? 'var(--success)' : app.matchScore > 40 ? 'var(--warning)' : 'var(--danger)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800
                          }}>
                              {app.matchScore || 0}%
                          </div>
                      </div>
                    </td>
                  )}
                  <td>
                    <Badge variant={
                      app.status === "offered" ? "success" : 
                      app.status === "rejected" ? "danger" : 
                      app.status === "applied" ? "info" : "neutral"
                    }>
                      {app.status}
                    </Badge>
                  </td>
                  {user.role !== "candidate" && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {app.status === "applied" && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleUpdateStatus(app._id, "offered")}>
                              <CheckCircle2 size={16} /> Hire
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(app._id, "rejected")}>
                              <XCircle size={16} /> Reject
                            </Button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <Button size="sm" variant="ghost" onClick={() => handleBulkDelete()} style={{ color: 'var(--danger)' }}>
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            }} 
          />
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-tertiary)" }}>
            <Clock size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <p>No applications found in the system.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
