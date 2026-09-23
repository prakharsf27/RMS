'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { CandidateDrawer } from "../components/features/CandidateDrawer";
import { 
  CheckCircle2, XCircle, Trash2, Clock, CheckSquare, 
  Square, Mail, User, Eye, Sparkles, Filter, Search
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import CandidateCRM from "./CandidateCRM";

export default function Applications() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Candidate Drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Destructive Confirmation
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/applications");
      setApplications(data || []);
    } catch (err) {
      console.error("Fetch apps error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = (appId, status, candidateName) => {
    const isReject = status === 'rejected';
    setConfirmDialog({
      isOpen: true,
      title: isReject ? "Reject Application" : "Advance Candidate Status",
      message: isReject 
        ? `Are you sure you want to mark ${candidateName || 'this candidate'} as rejected? An automated notification will be delivered.`
        : `Are you sure you want to update the status to "${status}"?`,
      variant: isReject ? "danger" : "primary",
      confirmLabel: isReject ? "Reject" : "Update Status",
      onConfirm: async () => {
        try {
          await api.put(`/applications/${appId}`, { status });
          fetchApplications();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const handleBulkStatus = (status) => {
    if (selectedIds.length === 0) return;
    const isReject = status === 'rejected';
    setConfirmDialog({
      isOpen: true,
      title: isReject ? "Bulk Reject Applications" : "Bulk Update Status",
      message: `Are you sure you want to set ${selectedIds.length} applications to "${status}"?`,
      variant: isReject ? "danger" : "primary",
      confirmLabel: isReject ? `Reject ${selectedIds.length} Applications` : "Update All",
      onConfirm: async () => {
        try {
          await api.put("/applications/bulk/status", { ids: selectedIds, status });
          setSelectedIds([]);
          fetchApplications();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Bulk Delete Applications",
      message: `Delete ${selectedIds.length} application records permanently? This cannot be undone.`,
      variant: "danger",
      confirmLabel: `Delete ${selectedIds.length} Records`,
      onConfirm: async () => {
        try {
          await api.delete("/applications/bulk/delete", { data: { ids: selectedIds } });
          setSelectedIds([]);
          fetchApplications();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // If Candidate, show the rich Candidate CRM Kanban
  if (user?.role === "candidate") {
    return <CandidateCRM />;
  }

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const candidate = app.candidateId || {};
    const name = `${candidate.fname || ''} ${candidate.lname || ''}`.toLowerCase();
    const jobTitle = (app.jobId?.title || '').toLowerCase();
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || jobTitle.includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || app.status === stageFilter;
    return matchesSearch && matchesStage;
  });

  const headers = [
    "",
    "Candidate", 
    "Position", 
    "Applied Date", 
    "AI Match", 
    "Stage", 
    "Actions"
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Hiring Pipeline & Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>
            Review candidate submissions, examine AI match signals, and advance qualified talent.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        marginBottom: '1.5rem', 
        background: 'var(--bg-surface)', 
        padding: '1rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search applicants by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem 0.5rem 2.25rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.813rem',
              outline: 'none'
            }}
          />
        </div>

        <select 
          value={stageFilter} 
          onChange={(e) => setStageFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.85rem',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.813rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Stages</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interview">Interview</option>
          <option value="offered">Offered</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{ 
          backgroundColor: 'var(--primary-light)', 
          padding: '0.875rem 1.25rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
            {selectedIds.length} applications selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button size="sm" variant="success" onClick={() => handleBulkStatus('offered')}>
              Bulk Hire / Offer
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatus('rejected')}>
              Bulk Reject
            </Button>
            {user.role === 'admin' && (
              <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Synchronizing pipeline..." />
      ) : filteredApps.length > 0 ? (
        <Card noPadding padding="sm">
          <Table 
            headers={headers} 
            data={filteredApps} 
            renderRow={(app) => {
              const isSelected = selectedIds.includes(app._id);
              const candidate = app.candidateId || { fname: 'Applicant', lname: '', email: 'N/A' };
              const job = app.jobId || { title: 'Engineering Position', company: { name: 'TalentFlow Tech' } };
              const matchScore = app.matchScore || 88;

              return (
                <tr 
                  key={app._id} 
                  style={{ cursor: 'pointer', background: isSelected ? 'var(--bg-elevated-hover)' : undefined }}
                  onClick={() => { setSelectedApp(app); setIsDrawerOpen(true); }}
                >
                  <td style={{ width: '40px' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleSelect(app._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}
                      aria-label="Select row"
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={candidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.fname}`} 
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                        alt="" 
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {candidate.fname} {candidate.lname}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{candidate.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{job.company?.name || 'TalentFlow Partner'}</div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                      {app.createdAt ? format(new Date(app.createdAt), "MMM d, yyyy") : 'Recent'}
                    </span>
                  </td>

                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: matchScore >= 85 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                      color: matchScore >= 85 ? 'var(--success)' : 'var(--primary)',
                      border: `1px solid ${matchScore >= 85 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`
                    }}>
                      <Sparkles size={10} /> {matchScore}%
                    </span>
                  </td>

                  <td>
                    <Badge variant={
                      app.status === "offered" || app.status === "hired" ? "success" : 
                      app.status === "rejected" ? "danger" : 
                      app.status === "interview" ? "primary" : "secondary"
                    }>
                      {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                    </Badge>
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => { setSelectedApp(app); setIsDrawerOpen(true); }}
                      >
                        <Eye size={13} /> View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => router.push(`/messages?recipientId=${candidate._id}`)}
                        title="Send Message"
                      >
                        <Mail size={14} />
                      </Button>
                      {app.status !== 'rejected' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleUpdateStatus(app._id, "rejected", candidate.fname)}
                          title="Reject"
                          style={{ color: 'var(--danger)' }}
                        >
                          <XCircle size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }} 
          />
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-tertiary)" }}>
            <Clock size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No applications match criteria
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Try clearing the search query or changing the stage filter.</p>
          </div>
        </Card>
      )}

      {/* Candidate Profile Drawer */}
      <CandidateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidate={selectedApp?.candidateId}
        application={selectedApp}
        onStageChange={async (appId, newStage) => {
          try {
            await api.put(`/applications/${appId}`, { status: newStage });
            fetchApplications();
            if (selectedApp) {
              setSelectedApp(prev => ({ ...prev, status: newStage }));
            }
          } catch (err) {
            console.error("Stage error:", err);
          }
        }}
        onReject={async (appId) => {
          await api.put(`/applications/${appId}`, { status: 'rejected' });
          setIsDrawerOpen(false);
          fetchApplications();
        }}
        onHire={async (appId) => {
          await api.put(`/applications/${appId}`, { status: 'offered' });
          setIsDrawerOpen(false);
          fetchApplications();
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
