'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from "../components/ui/Modal";
import { ShieldCheck, ShieldAlert, Building2, Globe, FileCheck, XCircle, CheckCircle, ExternalLink, Mail, User, Briefcase, Info, ChevronLeft } from "lucide-react";
import styles from "./Verification.module.css";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import api from "../lib/api";

export default function Verification() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/companies");
      setCompanies(data);
    } catch (err) {
      console.error("Fetch companies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerify = async (id, isVerified) => {
    try {
      await api.put(`/companies/${id}/verify`, { isVerified });
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner label="Loading verification queue..." />;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (selectedCompany) {
      setEditData({ ...selectedCompany });
      setIsEditing(false);
    }
  }, [selectedCompany]);

  const handleUpdateCompany = async () => {
    try {
      await api.put(`/companies/${selectedCompany._id}`, editData);
      setSelectedCompany(null);
      fetchCompanies();
      alert("Company details synchronized successfully.");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleBypass = async () => {
    if (window.confirm(`Are you sure you want to manually bypass verification for ${selectedCompany.name}? This will grant them full recruiter privileges.`)) {
      handleVerify(selectedCompany._id, true);
      setSelectedCompany(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading verification queue..." />;

  const unverified = companies.filter(c => !c.isVerified);
  const verified = companies.filter(c => c.isVerified);

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className={styles.backBtn}>
          <ChevronLeft size={20} /> Back
        </Button>
        <div>
          <h1 className="text-gradient">Trust & Safety: Company Verification</h1>
          <p>Audit and authorize recruiter credentials to maintain ecosystem integrity.</p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <ShieldAlert className="text-danger" size={20} />
            <h2>High Priority Audits ({unverified.length})</h2>
          </div>
          <div className={styles.grid}>
            {unverified.length > 0 ? unverified.map(company => (
              <Card 
                key={company._id} 
                className={styles.vCard}
                onClick={() => setSelectedCompany(company)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardMain}>
                  <div className={styles.logoBox}>
                    {company.logo ? <img src={company.logo} alt="Logo" /> : <Building2 size={24} />}
                  </div>
                  <div className={styles.info}>
                    <h3>{company.name}</h3>
                    <div className={styles.meta}>
                      <span><Globe size={14} /> {company.country || 'Global'}</span>
                      <span>Tax ID: {company.cinOrGst || 'N/A'}</span>
                    </div>
                    <p className={styles.recruiter}>
                      Recruiter: {typeof company.recruiterId === 'object' ? 
                        `${company.recruiterId?.fname || ''} ${company.recruiterId?.lname || ''}` : 
                        'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handleVerify(company._id, true); }}>
                    <CheckCircle size={14} /> Authorize
                  </Button>
                </div>
              </Card>
            )) : (
              <div className={styles.empty}>Verification queue cleared. No pending audits.</div>
            )}
          </div>
        </section>

        <section className={styles.section} style={{ marginTop: 40 }}>
          <div className={styles.sectionHeader}>
            <ShieldCheck className="text-success" size={20} />
            <h2>Verified Ecosystem ({verified.length})</h2>
          </div>
          <div className={styles.grid}>
            {verified.map(company => (
              <Card 
                key={company._id} 
                className={styles.vCard}
                onClick={() => setSelectedCompany(company)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardMain}>
                  <div className={styles.logoBox}>
                    {company.logo ? <img src={company.logo} alt="Logo" /> : <Building2 size={24} />}
                  </div>
                  <div className={styles.info}>
                    <h3>{company.name}</h3>
                    <Badge variant="success">Authorized</Badge>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button variant="ghost" size="sm" className="text-danger" onClick={(e) => { e.stopPropagation(); handleVerify(company._id, false); }}>
                    <XCircle size={14} /> Revoke
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title={isEditing ? "Modify Company Credentials" : "Company Audit: Verification Details"}
        width="800px"
      >
        {selectedCompany && (
          <div className={styles.detailsContent}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsLogo}>
                {editData.logo ? <img src={editData.logo} alt="" /> : <Building2 size={32} />}
              </div>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <input 
                    className={styles.editTitle} 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  <h2 className={styles.detailsTitle}>{selectedCompany.name}</h2>
                )}
                <Badge variant={selectedCompany.isVerified ? 'success' : 'warning'}>
                  {selectedCompany.isVerified ? 'System Authorized' : 'Pending Administrative Review'}
                </Badge>
              </div>
              {!isEditing && (
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
              )}
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailsSection}>
                <h4 className={styles.sectionLabel}><Building2 size={14} /> Company Profile</h4>
                <div className={styles.infoList}>
                  {[
                    { label: 'Industry', key: 'industry' },
                    { label: 'Location', key: 'location' },
                    { label: 'Country', key: 'country' },
                    { label: 'Tax ID / CIN', key: 'cinOrGst' },
                    { label: 'Website', key: 'website' }
                  ].map(field => (
                    <div key={field.key} className={styles.infoItem}>
                      <span className={styles.infoLabel}>{field.label}</span>
                      {isEditing ? (
                        <input 
                          className={styles.editInput} 
                          value={editData[field.key] || ''} 
                          onChange={e => setEditData({...editData, [field.key]: e.target.value})}
                        />
                      ) : (
                        <span className={styles.infoValue}>
                          {field.key === 'website' ? (
                            <a href={selectedCompany[field.key]} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                               {selectedCompany[field.key] || 'N/A'} <ExternalLink size={12} />
                            </a>
                          ) : (selectedCompany[field.key] || 'N/A')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.descriptionBox}>
                  <h4 className={styles.sectionLabel}><Info size={14} /> Official Description</h4>
                  {isEditing ? (
                    <textarea 
                      className={styles.editTextarea}
                      value={editData.description}
                      onChange={e => setEditData({...editData, description: e.target.value})}
                    />
                  ) : (
                    <p>{selectedCompany.description || 'No descriptive metadata provided.'}</p>
                  )}
                </div>
              </div>

              <div className={styles.detailsSection}>
                <h4 className={styles.sectionLabel}><User size={14} /> Recruiter Relationship</h4>
                <div className={styles.recruiterCard}>
                  <div className={styles.recruiterAvatar}>
                    <img 
                      src={(typeof selectedCompany.recruiterId === 'object' && selectedCompany.recruiterId?.avatar) || '/default-avatar.png'} 
                      alt="" 
                    />
                  </div>
                  <div className={styles.recruiterInfo}>
                    <div className={styles.recruiterName}>
                      {typeof selectedCompany.recruiterId === 'object' ? 
                        `${selectedCompany.recruiterId?.fname || ''} ${selectedCompany.recruiterId?.lname || ''}` : 
                        'Unknown Recruiter'}
                    </div>
                    <div className={styles.recruiterEmail}>
                      <Mail size={12} /> 
                      {typeof selectedCompany.recruiterId === 'object' ? 
                        (selectedCompany.recruiterId?.email || 'N/A') : 
                        'N/A'}
                    </div>
                    <div className={styles.recruiterBadge}><Badge variant="info">Primary Recruiter Account</Badge></div>
                  </div>
                </div>
                
                <div className={styles.auditLog}>
                    <h4 className={styles.sectionLabel}><FileCheck size={14} /> Audit Controls</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                        Manually override system verification if external documents have been verified via offline channels.
                    </p>
                    {!selectedCompany.isVerified && (
                        <Button variant="premium" size="sm" style={{ width: '100%' }} onClick={handleBypass}>
                            Manual Verification Bypass
                        </Button>
                    )}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
               {isEditing ? (
                 <>
                   <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel Changes</Button>
                   <Button variant="success" onClick={handleUpdateCompany}>Synchronize Records</Button>
                 </>
               ) : (
                 <>
                   <Button variant="secondary" onClick={() => setSelectedCompany(null)}>Close Audit</Button>
                   {!selectedCompany.isVerified ? (
                     <Button variant="success" onClick={() => { handleVerify(selectedCompany._id, true); setSelectedCompany(null); }}>
                       Authorize Now
                     </Button>
                   ) : (
                     <Button variant="danger" onClick={() => { handleVerify(selectedCompany._id, false); setSelectedCompany(null); }}>
                       Revoke Authorization
                     </Button>
                   )}
                 </>
               )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
