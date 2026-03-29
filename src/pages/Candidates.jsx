import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ShieldOff, ShieldCheck, Trash2, CheckCircle2, Square, CheckSquare, Users } from "lucide-react";

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/auth/users');
      setCandidates(usersRes.data);
      if (user.role === "admin") {
          const pendingRes = await api.get('/auth/pending-recruiters');
          setPendingRecruiters(pendingRes.data);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusToggle = async (id) => {
    try {
      await api.put(`/auth/users/${id}/status`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await api.put("/auth/users/bulk/status", { ids: selectedIds, status });
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} users? This cannot be undone.`)) {
        try {
          await api.delete("/auth/users/bulk/delete", { data: { ids: selectedIds } });
          setSelectedIds([]);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        }
    }
  };

  const handleApproveRecruiter = async (rid) => {
    try {
      await api.put(`/auth/approve-recruiter/${rid}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const candidateHeaders = [
    <Square size={16} />,
    "Profile", 
    "Contact", 
    "Location", 
    "Status", 
    "Actions"
  ];
  const recruiterHeaders = ["Recruiter Info", "Email", "Role", "Applied On", "Actions"];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Audit recruitment participants and authorize platform access.</p>
        </div>
      </div>

      {selectedIds.length > 0 && user.role === "admin" && (
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
            <span style={{ fontWeight: 600 }}>{selectedIds.length} users selected</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button size="sm" variant="success" onClick={() => handleBulkStatus('active')}>Approve/Activate</Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkStatus('suspended')}>Suspend</Button>
                <Button size="sm" variant="secondary" onClick={handleBulkDelete} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={16} /> Delete
                </Button>
            </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Auditing directory..." />
      ) : (
        <>
          {user.role === "admin" && pendingRecruiters.length > 0 && (
             <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Badge variant="warning">Action Required</Badge> Pending Recruiter Approvals
                </h2>
                <Card>
                   <Table 
                     headers={recruiterHeaders}
                     data={pendingRecruiters}
                     renderRow={(rec) => (
                        <tr key={rec._id}>
                           <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                 <img src={rec.avatar} style={{ width: '32px', height: '32px', borderRadius: '8px' }} alt="" />
                                 <span style={{ fontWeight: 600 }}>{rec.fname} {rec.lname}</span>
                              </div>
                           </td>
                           <td>{rec.email}</td>
                           <td><Badge variant="info">Recruiter</Badge></td>
                           <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                           <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 <Button size="sm" variant="success" onClick={() => handleApproveRecruiter(rec._id)}>
                                    <CheckCircle2 size={14} /> Approve
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     )}
                   />
                </Card>
             </div>
          )}

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Candidate Directory</h2>
          <Card>
            {candidates.length > 0 ? (
              <Table 
                headers={candidateHeaders} 
                data={candidates} 
                renderRow={(candidate) => {
                  const isBlocked = candidate.status === 'suspended';
                  const isSelected = selectedIds.includes(candidate._id);
                  return (
                    <tr key={candidate._id} style={{ opacity: isBlocked ? 0.6 : 1, backgroundColor: isSelected ? 'var(--bg-elevated-hover)' : 'transparent' }}>
                      <td>
                        <button 
                            onClick={() => toggleSelect(candidate._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}
                        >
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={candidate.avatar} style={{ width: '40px', height: '40px', borderRadius: '12px' }} alt="" />
                          <div style={{ fontWeight: 700 }}>{candidate.fname} {candidate.lname}</div>
                        </div>
                      </td>
                      <td><div style={{ fontSize: '0.875rem' }}>{candidate.email}</div></td>
                      <td><div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Remote</div></td>
                      <td>{isBlocked ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                           {user.role === "admin" && (
                              <Button size="sm" variant={isBlocked ? "success" : "secondary"} onClick={() => handleStatusToggle(candidate._id)}>
                                 {isBlocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                              </Button>
                           )}
                           <Button size="sm" variant="ghost">Profile</Button>
                        </div>
                      </td>
                    </tr>
                  );
                }} 
              />
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-tertiary)" }}>
                <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                <p>No candidates found in the database.</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
