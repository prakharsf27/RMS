'use client';
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { CandidateDrawer } from "../components/features/CandidateDrawer";
import { 
  ShieldOff, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  Square, 
  CheckSquare, 
  Users as UsersIcon, 
  MessageSquare, 
  Search,
  Filter,
  Eye,
  Calendar,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { useRouter } from 'next/navigation';
import styles from "./Candidates.module.css";

export default function Candidates() {
  const { user } = useAuth();
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all"); // For admin

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer & Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Destructive Confirmation
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === "admin") {
        const [usersRes, pendingRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/auth/pending-recruiters').catch(() => ({ data: [] }))
        ]);
        setCandidates(usersRes.data || []);
        setPendingRecruiters(pendingRes.data || []);
      } else {
        // Recruiter mode: fetch candidates, applications and jobs
        const [usersRes, appsRes, jobsRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/applications').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] }))
        ]);
        setCandidates(usersRes.data || []);
        setApplications(appsRes.data || []);
        setJobs(jobsRes.data || []);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Recruiter: Combine applications with candidate users to form rich rows
  const recruiterRows = useMemo(() => {
    if (user?.role === "admin") return [];

    // Filter only candidates from users
    const candidateUsers = candidates.filter(u => u.role === "candidate");

    return candidateUsers.map(cand => {
      // Find an application for this candidate if exists
      const app = applications.find(a => 
        (a.candidateId?._id === cand._id) || (a.candidateId === cand._id)
      );

      const jobTitle = app?.jobId?.title || (cand.skills?.includes('React') ? 'Senior Frontend Engineer' : 'Full Stack Developer');
      const companyName = app?.jobId?.company?.name || 'TalentFlow Technologies';
      const stage = app?.status || (cand.isEngaged ? 'interview' : 'applied');
      const matchScore = app?.matchScore || cand.matchScore || (cand.skills?.length > 4 ? 92 : 84);
      const experience = cand.experienceYears || (cand.experience?.length ? `${cand.experience.length * 2} yrs` : '4+ yrs');
      const lastActivity = app?.updatedAt 
        ? new Date(app.updatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();

      const candidateSkills = Array.isArray(cand.skills)
        ? cand.skills
        : (typeof cand.skills === 'string'
            ? cand.skills.split(',').map(s => s.trim()).filter(Boolean)
            : []);

      return {
        id: cand._id,
        user: cand,
        application: app,
        jobTitle,
        companyName,
        stage,
        matchScore,
        experience,
        skills: candidateSkills.length > 0 ? candidateSkills : ['React', 'TypeScript', 'Node.js', 'Next.js'],
        lastActivity
      };
    });
  }, [candidates, applications, user]);

  // Filtered rows for recruiter
  const filteredRecruiterRows = useMemo(() => {
    return recruiterRows.filter(row => {
      const name = `${row.user.fname} ${row.user.lname}`.toLowerCase();
      const email = (row.user.email || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === "all" || row.stage.toLowerCase() === stageFilter.toLowerCase();
      const matchesJob = jobFilter === "all" || row.jobTitle === jobFilter;
      
      let matchesScore = true;
      if (matchFilter === "high") matchesScore = row.matchScore >= 85;
      if (matchFilter === "medium") matchesScore = row.matchScore >= 70 && row.matchScore < 85;

      return matchesSearch && matchesStage && matchesJob && matchesScore;
    });
  }, [recruiterRows, searchQuery, stageFilter, jobFilter, matchFilter]);

  // Filtered rows for admin
  const filteredAdminRows = useMemo(() => {
    return candidates.filter(u => {
      const name = `${u.fname} ${u.lname}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, searchQuery, roleFilter]);

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (ids) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  // Open Drawer for a candidate
  const handleOpenDrawer = (candUser, app) => {
    setSelectedCandidate(candUser);
    setSelectedApplication(app || null);
    setIsDrawerOpen(true);
  };

  // Handle stage change from drawer
  const handleStageChange = async (appId, newStage) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStage });
      fetchData();
      if (selectedApplication) {
        setSelectedApplication(prev => ({ ...prev, status: newStage }));
      }
    } catch (err) {
      console.error("Stage update error:", err);
    }
  };

  // Handle reject from drawer
  const handleRejectCandidate = async (appId) => {
    try {
      await api.put(`/applications/${appId}`, { status: 'rejected' });
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Reject candidate error:", err);
    }
  };

  // Handle hire from drawer
  const handleHireCandidate = async (appId) => {
    try {
      await api.put(`/applications/${appId}`, { status: 'offered' });
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Hire candidate error:", err);
    }
  };

  // Admin Actions
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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Bulk Delete Users",
      message: `Are you sure you want to permanently delete ${selectedIds.length} users? This cannot be undone.`,
      variant: "danger",
      confirmLabel: `Delete ${selectedIds.length} Users`,
      onConfirm: async () => {
        try {
          await api.delete("/auth/users/bulk/delete", { data: { ids: selectedIds } });
          setSelectedIds([]);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const handleApproveRecruiter = async (rid) => {
    try {
      await api.put(`/auth/approve-recruiter/${rid}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${editingUser._id}`, editFormData);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>
            {user?.role === "admin" ? "User Management" : "Candidate Management"}
          </h1>
          <p className={styles.pageSubtitle}>
            {user?.role === "admin" 
              ? "Oversee platform directory, verify organizations, and manage access credentials."
              : "Review talent pipeline, evaluate AI match depth, and advance candidate stages."}
          </p>
        </div>
      </div>

      {/* Recruiter View */}
      {user?.role !== "admin" ? (
        <>
          {/* Filters Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search candidates by name, email, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select 
              value={stageFilter} 
              onChange={(e) => setStageFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Stages</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
            </select>

            <select 
              value={jobFilter} 
              onChange={(e) => setJobFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              {jobs.map(j => (
                <option key={j._id} value={j.title}>{j.title}</option>
              ))}
              <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>

            <select 
              value={matchFilter} 
              onChange={(e) => setMatchFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Any Match Score</option>
              <option value="high">High Match (≥ 85%)</option>
              <option value="medium">Moderate Match (70 - 84%)</option>
            </select>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className={styles.bulkBar}>
              <span className={styles.bulkCount}>{selectedIds.length} candidates selected</span>
              <div className={styles.bulkActions}>
                <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                  Clear Selection
                </Button>
                <Button 
                  size="sm" 
                  variant="primary" 
                  onClick={() => router.push(`/messages?recipientIds=${selectedIds.join(',')}`)}
                >
                  <MessageSquare size={14} /> Bulk Message
                </Button>
              </div>
            </div>
          )}

          {/* Candidates Table */}
          {loading ? (
            <LoadingSpinner label="Loading talent directory..." />
          ) : (
            <Card noPadding>
              <Table
                headers={[
                  "",
                  "Candidate",
                  "Role Applied",
                  "AI Match",
                  "Stage",
                  "Experience",
                  "Skills",
                  "Last Activity",
                  "Actions"
                ]}
                data={filteredRecruiterRows}
                renderRow={(row) => {
                  const isSelected = selectedIds.includes(row.id);
                  const isHighMatch = row.matchScore >= 85;

                  return (
                    <tr 
                      key={row.id} 
                      style={{ cursor: 'pointer', background: isSelected ? 'var(--bg-elevated-hover)' : undefined }}
                      onClick={() => handleOpenDrawer(row.user, row.application)}
                    >
                      <td style={{ width: '40px' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => toggleSelect(row.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}
                          aria-label="Select candidate"
                        >
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>

                      <td>
                        <div className={styles.candidateCell}>
                          <img 
                            src={row.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user.fname}`} 
                            alt={row.user.fname}
                            className={styles.candidateAvatar} 
                          />
                          <div>
                            <div className={styles.candidateName}>{row.user.fname} {row.user.lname}</div>
                            <div className={styles.candidateEmail}>{row.user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {row.jobTitle}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {row.companyName}
                        </div>
                      </td>

                      <td>
                        <span className={`${styles.matchPill} ${isHighMatch ? styles.matchHigh : styles.matchMed}`}>
                          <Sparkles size={11} style={{ marginRight: '3px' }} /> {row.matchScore}%
                        </span>
                      </td>

                      <td>
                        <Badge variant={
                          row.stage === 'hired' || row.stage === 'offered' ? 'success' :
                          row.stage === 'interview' ? 'primary' :
                          row.stage === 'screening' ? 'info' : 'secondary'
                        }>
                          {row.stage.charAt(0).toUpperCase() + row.stage.slice(1)}
                        </Badge>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                          {row.experience}
                        </span>
                      </td>

                      <td>
                        <div className={styles.skillsList}>
                          {(Array.isArray(row.skills) ? row.skills.slice(0, 3) : []).map((sk, i) => (
                            <span key={i} className={styles.skillChip}>{sk}</span>
                          ))}
                          {Array.isArray(row.skills) && row.skills.length > 3 && (
                            <span className={styles.skillChip}>+{row.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {row.lastActivity}
                        </span>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => router.push(`/messages?recipientId=${row.user._id}`)}
                            title="Message Candidate"
                          >
                            <MessageSquare size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleOpenDrawer(row.user, row.application)}
                          >
                            <Eye size={13} /> View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              />
            </Card>
          )}
        </>
      ) : (
        /* Admin View */
        <>
          {/* Pending Recruiters Section */}
          {pendingRecruiters.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="warning">Verification Queue</Badge> Pending Recruiter Approvals
              </h2>
              <Card noPadding padding="sm">
                <Table
                  headers={["Recruiter", "Email", "Role", "Registered Date", "Actions"]}
                  data={pendingRecruiters}
                  renderRow={(rec) => (
                    <tr key={rec._id}>
                      <td>
                        <div className={styles.candidateCell}>
                          <img 
                            src={rec.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rec.fname}`} 
                            alt="" 
                            className={styles.candidateAvatar} 
                          />
                          <span style={{ fontWeight: 600 }}>{rec.fname} {rec.lname}</span>
                        </div>
                      </td>
                      <td>{rec.email}</td>
                      <td><Badge variant="info">Recruiter</Badge></td>
                      <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button size="sm" variant="success" onClick={() => handleApproveRecruiter(rec._id)}>
                          <CheckCircle2 size={14} /> Authorize Account
                        </Button>
                      </td>
                    </tr>
                  )}
                />
              </Card>
            </div>
          )}

          {/* Admin Directory Controls */}
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search all users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Admin Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className={styles.bulkBar}>
              <span className={styles.bulkCount}>{selectedIds.length} users selected</span>
              <div className={styles.bulkActions}>
                <Button size="sm" variant="success" onClick={() => handleBulkStatus('active')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatus('suspended')}>
                  Suspend
                </Button>
                <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <LoadingSpinner label="Loading directory..." />
          ) : (
            <Card noPadding padding="sm">
              <Table
                headers={[
                  "",
                  "User",
                  "Email",
                  "Role",
                  "Status",
                  "Actions"
                ]}
                data={filteredAdminRows}
                renderRow={(u) => {
                  const isSelected = selectedIds.includes(u._id);
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u._id} style={{ background: isSelected ? 'var(--bg-elevated-hover)' : undefined }}>
                      <td style={{ width: '40px' }}>
                        <button 
                          onClick={() => toggleSelect(u._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}
                          aria-label="Select user"
                        >
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>

                      <td>
                        <div className={styles.candidateCell}>
                          <img 
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fname}`} 
                            alt="" 
                            className={styles.candidateAvatar} 
                          />
                          <div>
                            <div className={styles.candidateName}>{u.fname} {u.lname}</div>
                            <div className={styles.candidateEmail}>{u.location || 'India'}</div>
                          </div>
                        </div>
                      </td>

                      <td>{u.email}</td>

                      <td>
                        <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'recruiter' ? 'info' : 'secondary'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>

                      <td>
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <Button 
                            size="sm" 
                            variant={isSuspended ? "success" : "secondary"} 
                            onClick={() => handleStatusToggle(u._id)} 
                            title={isSuspended ? "Activate" : "Suspend"}
                          >
                            {isSuspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditingUser(u);
                              setEditFormData({
                                fname: u.fname,
                                lname: u.lname,
                                email: u.email,
                                role: u.role,
                                status: u.status
                              });
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              />
            </Card>
          )}
        </>
      )}

      {/* Candidate Profile Drawer */}
      <CandidateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidate={selectedCandidate}
        application={selectedApplication}
        onStageChange={handleStageChange}
        onReject={handleRejectCandidate}
        onHire={handleHireCandidate}
      />

      {/* Admin Edit User Modal */}
      <Modal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        title="Edit User Profile"
      >
        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>FIRST NAME</label>
              <input 
                className={styles.input} 
                value={editFormData.fname || ''} 
                onChange={e => setEditFormData({...editFormData, fname: e.target.value})}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>LAST NAME</label>
              <input 
                className={styles.input} 
                value={editFormData.lname || ''} 
                onChange={e => setEditFormData({...editFormData, lname: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input 
              type="email"
              className={styles.input} 
              value={editFormData.email || ''} 
              onChange={e => setEditFormData({...editFormData, email: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>ROLE</label>
              <select 
                className={styles.input} 
                value={editFormData.role || ''} 
                onChange={e => setEditFormData({...editFormData, role: e.target.value})}
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>ACCOUNT STATUS</label>
              <select 
                className={styles.input} 
                value={editFormData.status || ''} 
                onChange={e => setEditFormData({...editFormData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

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
