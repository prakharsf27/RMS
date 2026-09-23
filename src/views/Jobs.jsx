'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { JobForm } from "../components/forms/JobForm";
import { ApplyForm } from "../components/forms/ApplyForm";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  Plus, Search, Filter, ChevronLeft, ChevronRight, Rocket,
  Building2, MapPin, Clock, Users, Sparkles, LayoutGrid, List,
  Briefcase, CheckCircle2, AlertCircle, Check
} from "lucide-react";
import { format } from "date-fns";
import styles from "./Jobs.module.css";
import SalaryCoach from "../components/features/SalaryCoach";
import AutoPilotModal from "../components/features/AutoPilotModal";

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "all",
    type: "all"
  });
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [isCompanyVerified, setIsCompanyVerified] = useState(false);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAutoPilotOpen, setIsAutoPilotOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destructive Confirmation
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/jobs", {
        params: {
          search: searchTerm,
          location: filters.location,
          type: filters.type,
          page,
          limit: 12,
          myJobs: user?.role === 'recruiter' ? 'true' : 'false'
        }
      });

      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
      setTotalResults(data.total || (data.jobs ? data.jobs.length : 0));

      if (user?.role === 'candidate') {
        const appsRes = await api.get('/applications').catch(() => ({ data: [] }));
        const appliedIds = new Set(appsRes.data.map(app => app.jobId?._id).filter(Boolean));
        setAppliedJobIds(appliedIds);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompanyVerification = async () => {
    if (user?.role === 'recruiter') {
      try {
        const { data } = await api.get("/companies/my");
        setHasCompanyProfile(true);
        setIsCompanyVerified(data.isVerified);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasCompanyProfile(false);
        }
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      checkCompanyVerification();
    }
  }, [searchTerm, filters.location, filters.type, page, user]);

  const handleCreateJob = async (formData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/jobs/${selectedJob._id}`, formData);
      } else {
        await api.post("/jobs", formData);
      }
      setIsPostModalOpen(false);
      setIsEditing(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("jobId", selectedJob._id);
      if (formData.resumeFile) {
        payload.append("resume", formData.resumeFile);
      }
      if (formData.resumeUrl) {
        payload.append("resumeUrl", formData.resumeUrl);
      }
      
      await api.post("/applications", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setIsApplyModalOpen(false);
      fetchJobs();
      alert(`Applied successfully for ${selectedJob.title}!`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (jobId, currentStatus) => {
    const isClosing = currentStatus === 'active';
    setConfirmDialog({
      isOpen: true,
      title: isClosing ? "Close Job Requisition" : "Re-open Job Position",
      message: isClosing 
        ? "Closing this job will prevent new candidate submissions. You can re-open it at any time."
        : "Re-opening this job will make it visible in candidate searches again.",
      variant: isClosing ? "danger" : "primary",
      confirmLabel: isClosing ? "Close Job" : "Open Job",
      onConfirm: async () => {
        try {
          const newStatus = isClosing ? 'closed' : 'active';
          await api.put(`/jobs/${jobId}`, { status: newStatus });
          fetchJobs();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      }
    });
  };

  const openApply = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const openEdit = (job) => {
    setSelectedJob(job);
    setIsEditing(true);
    setIsPostModalOpen(true);
  };

  const openView = (job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Job Postings & Opportunities</h1>
          <p className={styles.pageSubtitle}>
            {user?.role === "candidate" 
              ? "Discover vetted enterprise positions matched to your technical profile and experience." 
              : "Publish, manage, and track requisition status across your organization."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user?.role === "candidate" && (
            <Button onClick={() => setIsAutoPilotOpen(true)} variant="ai" size="md">
              <Rocket size={15} /> Application Auto-Pilot
            </Button>
          )}

          {user?.role !== "candidate" && (
            <Button 
              disabled={!isCompanyVerified}
              onClick={() => { setIsEditing(false); setSelectedJob(null); setIsPostModalOpen(true); }}
              title={!isCompanyVerified ? "Complete company profile and verification to post jobs." : ""}
              size="md"
            >
              <Plus size={16} /> Post New Position
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by role, company, or tech stack..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={13} />
            <select 
              value={filters.location} 
              onChange={(e) => { setFilters({...filters, location: e.target.value}); setPage(1); }}
            >
              <option value="all">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Austin">Austin</option>
              <option value="Seattle">Seattle</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select 
              value={filters.type} 
              onChange={(e) => { setFilters({...filters, type: e.target.value}); setPage(1); }}
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>

        <div className={styles.resultCount}>
          Found <strong>{totalResults}</strong> open positions
        </div>
      </div>

      {/* Main Content: Cards Grid or Table */}
      {loading ? (
        <LoadingSpinner label="Fetching job opportunities..." />
      ) : jobs.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Briefcase size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No positions found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Try broadening your search query or reset the location and type filters.
            </p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className={styles.cardsGrid}>
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.has(job._id);
            const matchScore = job.matchScore || (job.title.includes('Frontend') ? 94 : 88);
            const skillsList = job.requirements?.slice(0, 3) || ['React', 'TypeScript', 'Node.js'];

            return (
              <div 
                key={job._id} 
                className={styles.jobCardItem}
                onClick={() => openView(job)}
              >
                <div>
                  <div className={styles.cardTop}>
                    <div className={styles.companyRow}>
                      <div className={styles.companyLogo}>
                        {job.company?.name?.[0] || 'T'}
                      </div>
                      <div>
                        <div className={styles.companyName}>
                          {job.company?.name || 'TalentFlow Partner'}
                        </div>
                        <h3 className={styles.jobCardTitle}>{job.title}</h3>
                      </div>
                    </div>

                    <span className={`${styles.matchPill} ${matchScore >= 90 ? styles.matchHigh : styles.matchMed}`}>
                      <Sparkles size={11} /> {matchScore}%
                    </span>
                  </div>

                  <div className={styles.metaChips} style={{ marginTop: '0.85rem' }}>
                    <span className={styles.metaChip}><MapPin size={12} /> {job.location || 'Remote'}</span>
                    <span className={styles.metaChip}><Briefcase size={12} /> {job.type || 'Full-time'}</span>
                    <span className={styles.metaChip}><Users size={12} /> {job.applicantsCount || 0} applicants</span>
                  </div>

                  <div className={styles.skillsRow} style={{ marginTop: '0.85rem' }}>
                    {skillsList.map((skill, i) => (
                      <span key={i} className={`${styles.skillPill} ${styles.matched}`}>
                        <Check size={11} style={{ display: 'inline', marginRight: '2px' }} /> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
                  <span>Posted {format(new Date(job.createdAt || Date.now()), "MMM d, yyyy")}</span>

                  {user?.role === "candidate" ? (
                    <Button
                      size="sm"
                      variant={hasApplied ? "secondary" : "primary"}
                      disabled={hasApplied || job.status !== 'active'}
                      onClick={() => !hasApplied && openApply(job)}
                    >
                      {hasApplied ? "Applied" : "Apply Now"}
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Button size="sm" variant="outline" onClick={() => openEdit(job)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant={job.status === 'active' ? "outline" : "success"}
                        onClick={() => handleToggleStatus(job._id, job.status)}
                      >
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card noPadding padding="sm">
          <Table
            headers={["Company", "Role", "Department", "Location", "Status", "Applicants", "Date Posted", "Actions"]}
            data={jobs}
            renderRow={(job) => {
              const hasApplied = appliedJobIds.has(job._id);

              return (
                <tr key={job._id} style={{ cursor: 'pointer' }} onClick={() => openView(job)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={styles.companyIcon}>
                        {job.company?.name?.[0] || 'T'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {job.company?.name || "TalentFlow Partner"}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{job.department || 'Engineering'}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{job.type}</div>
                  </td>

                  <td>{job.department}</td>
                  <td>{job.location}</td>

                  <td>
                    <Badge variant={job.status === "active" ? "success" : "neutral"}>
                      {job.status}
                    </Badge>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>{job.applicantsCount || 0}</span>
                  </td>

                  <td>{format(new Date(job.createdAt || Date.now()), "MMM d, yyyy")}</td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      {user?.role === "candidate" ? (
                        <Button 
                          size="sm" 
                          variant={hasApplied ? "secondary" : "primary"}
                          disabled={job.status !== "active" || hasApplied}
                          onClick={() => !hasApplied && openApply(job)}
                        >
                          {hasApplied ? "Applied" : "Apply"}
                        </Button>
                      ) : (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(job)}>Edit</Button>
                          <Button 
                            variant={job.status === 'active' ? 'outline' : 'success'} 
                            size="sm" 
                            onClick={() => handleToggleStatus(job._id, job.status)}
                          >
                            {job.status === 'active' ? 'Close' : 'Open'}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button 
            size="sm" 
            variant="ghost" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Job Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Job Specification & Requirements"
      >
        {selectedJob && (
          <div className={styles.jobViewContent}>
            <header className={styles.jobViewHeader}>
              <div className={styles.jobCompanyIconLarge}>
                {selectedJob.company?.name?.[0] || 'T'}
              </div>
              <div className={styles.jobHeaderText}>
                <h2>{selectedJob.title}</h2>
                <p className={styles.jobCompanySubtitle}>
                  {selectedJob.company?.name || 'TalentFlow Partner'} · {selectedJob.location}
                </p>
                <div className={styles.jobBadges}>
                  <Badge variant="primary">{selectedJob.type}</Badge>
                  <Badge variant="secondary">{selectedJob.department || 'Engineering'}</Badge>
                  <span className={`${styles.matchPill} ${styles.matchHigh}`}>
                    <Sparkles size={11} /> 94% Match
                  </span>
                </div>
              </div>
            </header>
            
            <div className={styles.jobDetailsGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Compensation</span>
                <span className={styles.detailValue}>{selectedJob.salary || '$140,000 - $185,000'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Experience Required</span>
                <span className={styles.detailValue}>{selectedJob.experienceLevel || 'Mid to Senior Level'}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Requisition Status</span>
                <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{selectedJob.status || 'Active'}</span>
              </div>
            </div>

            <div className={styles.jobBody}>
              <section className={styles.jobSection}>
                <h4>Role Overview</h4>
                <p>{selectedJob.description || "Join our high-performance engineering team building modern distributed web applications. You will collaborate closely with design and backend teams to ship performant features."}</p>
              </section>

              {selectedJob.requirements?.length > 0 && (
                <section className={styles.jobSection}>
                  <h4>Key Technical Qualifications</h4>
                  <ul className={styles.reqList}>
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {user?.role === "candidate" && (
                <SalaryCoach job={selectedJob} />
              )}
            </div>

            <footer className={styles.jobViewFooter}>
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {user?.role === 'candidate' && (
                <Button 
                  onClick={() => { setIsViewModalOpen(false); openApply(selectedJob); }}
                  disabled={appliedJobIds.has(selectedJob._id)}
                  variant={appliedJobIds.has(selectedJob._id) ? "secondary" : "primary"}
                >
                  {appliedJobIds.has(selectedJob._id) ? "Already Applied" : "Quick Apply Now"}
                </Button>
              )}
            </footer>
          </div>
        )}
      </Modal>

      {/* Job Post / Edit Modal */}
      <Modal 
        isOpen={isPostModalOpen} 
        onClose={() => { setIsPostModalOpen(false); setIsEditing(false); setSelectedJob(null); }} 
        title={isEditing ? "Edit Job Requirement" : "Create New Job Position"}
      >
        <JobForm 
          onSubmit={handleCreateJob} 
          onCancel={() => setIsPostModalOpen(false)}
          isSubmitting={isSubmitting} 
          initialData={isEditing ? selectedJob : null} 
        />
      </Modal>

      {/* Apply Form Modal */}
      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        title="Apply for Position"
      >
        <ApplyForm 
          jobTitle={selectedJob?.title} 
          company={selectedJob?.company}
          onSubmit={handleApply} 
          isSubmitting={isSubmitting} 
        />
      </Modal>

      {/* Auto Pilot Modal */}
      {user?.role === 'candidate' && (
        <AutoPilotModal 
          isOpen={isAutoPilotOpen} 
          onClose={() => setIsAutoPilotOpen(false)} 
          selectedJobs={jobs.filter(j => !appliedJobIds.has(j._id))} 
        />
      )}

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
