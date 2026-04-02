import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { JobForm } from "../components/forms/JobForm";
import { ApplyForm } from "../components/forms/ApplyForm";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import styles from "./Jobs.module.css";

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "all",
    type: "all"
  });
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/jobs", {
        params: {
          search: searchTerm,
          location: filters.location,
          type: filters.type,
          page,
          limit: 10,
          myJobs: user.role === 'recruiter' ? 'true' : 'false'
        }
      });

      setJobs(data.jobs);
      setTotalPages(data.pages);
      setTotalResults(data.total);

      // Fetch user's applied status if candidate
      if (user.role === 'candidate') {
        const appsRes = await api.get('/applications');
        const appliedIds = new Set(appsRes.data.map(app => app.jobId?._id).filter(Boolean));
        setAppliedJobIds(appliedIds);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, filters.location, filters.type, page]);

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

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
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

  const headers = ["Company", "Role", "Department", "Location", "Status", "Applicants", "Date Posted", ""];

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <div>
          <h1 className="text-gradient">Job Postings</h1>
          <p>
            {user.role === "candidate" 
              ? "Explore all open opportunities across our global engineering locations." 
              : "Create, publish, and manage job postings across your organization."}
          </p>

        </div>
        {user.role !== "candidate" && (
          <Button onClick={() => { setIsEditing(false); setSelectedJob(null); setIsPostModalOpen(true); }}>
            <Plus size={18} /> Post New Job
          </Button>
        )}
      </div>

      {user.role !== "recruiter" && (
        <div className={styles.toolbar}>
           <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                 type="text" 
                 placeholder="Search by role, department..." 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
           </div>
           <div className={styles.filters}>
              <div className={styles.filterGroup}>
                 <Filter size={14} />
                 <select 
                    value={filters.location} 
                    onChange={(e) => { setFilters({...filters, location: e.target.value}); setPage(1); }}
                 >
                    <option value="all">All Locations</option>
                    <option value="Remote">Remote</option>
                    <option value="New York">New York</option>
                    <option value="San Francisco">San Francisco</option>
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
           </div>
           <div className={styles.resultCount}>
              Found <strong>{totalResults}</strong> roles
           </div>
        </div>
      )}


      {loading ? (
        <LoadingSpinner label="Querying opportunities..." />
      ) : (
        <>
          <Table 
            headers={headers}
            data={jobs}
            renderRow={(job, i) => (
              <tr key={job._id || i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className={styles.companyIcon}>
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt={job.company.name} />
                      ) : (
                        <span>{job.company?.name?.[0] || 'C'}</span>
                      )}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                        {job.company?.name || "TalentFlow Partner"}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{job.company?.industry || 'Technology'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{job.title}</strong>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{job.type}</span>
                </td>
                <td>{job.department}</td>
                <td>{job.location}</td>
                <td>
                  <Badge variant={job.status === "active" ? "success" : "neutral"}>
                    {job.status}
                  </Badge>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{job.applicantsCount}</span> candidates
                </td>
                <td>{format(new Date(job.createdAt), "MMM d, yyyy")}</td>
                <td style={{ textAlign: 'right' }}>
                  {user.role === "candidate" ? (
                    (() => {
                      const hasApplied = appliedJobIds.has(job._id);
                      return (
                        <Button 
                          size="sm" 
                          onClick={() => !hasApplied && openApply(job)} 
                          disabled={job.status !== "active" || hasApplied}
                          variant={hasApplied ? "secondary" : "primary"}
                        >
                          {hasApplied ? "Applied" : job.status === "active" ? "Apply Now" : "Closed"}
                        </Button>
                      );
                    })()
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => openEdit(job)}>Edit</Button>
                      <Button variant="secondary" size="sm" onClick={() => openView(job)}>View</Button>
                      <Button 
                        variant={job.status === 'active' ? 'danger' : 'success'} 
                        size="sm" 
                        onClick={() => handleToggleStatus(job._id, job.status)}
                      >
                        {job.status === 'active' ? 'Close' : 'Open'}
                      </Button>
                    </div>
                  )}

                </td>
              </tr>
            )}
          />

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
        </>
      )}

      <Modal 
        isOpen={isPostModalOpen} 
        onClose={() => { setIsPostModalOpen(false); setIsEditing(false); setSelectedJob(null); }} 
        title={isEditing ? "Edit Job Requirement" : "Post New Requirement"}
      >
        <JobForm 
            onSubmit={handleCreateJob} 
            onCancel={() => setIsPostModalOpen(false)}
            isSubmitting={isSubmitting} 
            initialData={isEditing ? selectedJob : null} 
        />

      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Job Specification"
      >
        {selectedJob && (
          <div className={styles.jobViewContent}>
            {/* Header Section */}
            <header className={styles.jobViewHeader}>
                <div className={styles.jobCompanyIconLarge}>
                    {selectedJob.company?.logo ? (
                        <img src={selectedJob.company.logo} alt={selectedJob.company.name} />
                    ) : (
                        <span>{selectedJob.company?.name?.[0] || 'C'}</span>
                    )}
                </div>
                <div className={styles.jobHeaderText}>
                    <h2>{selectedJob.title}</h2>
                    <p className={styles.jobCompanySubtitle}>
                       {selectedJob.company?.name || 'TalentFlow Partner'} · {selectedJob.location}
                    </p>
                    <div className={styles.jobBadges}>
                       <Badge variant="info">{selectedJob.type}</Badge>
                       <Badge variant="neutral">{selectedJob.department}</Badge>
                    </div>
                </div>
            </header>
            
            {/* Details Grid */}
            <div className={styles.jobDetailsGrid}>
                <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Compensation</span>
                    <span className={styles.detailValue}>{selectedJob.salary || 'Competitive'}</span>
                </div>
                <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Experience</span>
                    <span className={styles.detailValue}>{selectedJob.experienceLevel || 'Mid-Level'}</span>
                </div>
                <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Application Deadline</span>
                    <span className={styles.detailValue}>{selectedJob.deadline ? format(new Date(selectedJob.deadline), "MMM d, yyyy") : 'Open'}</span>
                </div>
            </div>

            {/* Content Sections */}
            <div className={styles.jobBody}>
                <section className={styles.jobSection}>
                    <h4>Description</h4>
                    <p>{selectedJob.description}</p>
                </section>

                {selectedJob.requirements?.length > 0 && (
                   <section className={styles.jobSection}>
                       <h4>Requirements</h4>
                       <ul className={styles.reqList}>
                          {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                       </ul>
                   </section>
                )}
            </div>

            {/* Footer Actions */}
            <footer className={styles.jobViewFooter}>
                 <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close Specifications</Button>
                 {user.role === 'candidate' && (
                     <Button 
                       onClick={() => { setIsViewModalOpen(false); openApply(selectedJob); }}
                       disabled={appliedJobIds.has(selectedJob._id)}
                     >
                       {appliedJobIds.has(selectedJob._id) ? "Already Applied" : "Quick Apply Now"}
                     </Button>
                 )}
            </footer>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        title="Quick Job Application"
      >
        <ApplyForm 
            jobTitle={selectedJob?.title} 
            company={selectedJob?.company}
            onSubmit={handleApply} 
            isSubmitting={isSubmitting} 
        />
      </Modal>
    </div>
  );
}
