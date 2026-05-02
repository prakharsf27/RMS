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

  const unverified = companies.filter(c => !c.isVerified);
  const verified = companies.filter(c => c.isVerified);

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className={styles.backBtn}>
          <ChevronLeft size={20} /> Back
        </Button>
        <div>
          <h1 className="text-gradient">Company Verification</h1>
          <p>Review and verify recruiter company credentials for system trust.</p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <ShieldAlert className="text-danger" size={20} />
            <h2>Pending Verification ({unverified.length})</h2>
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
                      <span>ID: {company.cinOrGst || 'N/A'}</span>
                    </div>
                    <p className={styles.recruiter}>Recruiter: {company.recruiterId?.fname} {company.recruiterId?.lname}</p>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handleVerify(company._id, true); }}>
                    <CheckCircle size={14} /> Verify Company
                  </Button>
                </div>
              </Card>
            )) : (
              <div className={styles.empty}>No companies pending verification.</div>
            )}
          </div>
        </section>

        <section className={styles.section} style={{ marginTop: 40 }}>
          <div className={styles.sectionHeader}>
            <ShieldCheck className="text-success" size={20} />
            <h2>Verified Companies ({verified.length})</h2>
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
                    <Badge variant="success">Verified</Badge>
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

      {/* ─── Company & Recruiter Details Modal ─── */}
      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title="Company Verification Details"
      >
        {selectedCompany && (
          <div className={styles.detailsContent}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsLogo}>
                {selectedCompany.logo ? <img src={selectedCompany.logo} alt="" /> : <Building2 size={32} />}
              </div>
              <div>
                <h2 className={styles.detailsTitle}>{selectedCompany.name}</h2>
                <Badge variant={selectedCompany.isVerified ? 'success' : 'warning'}>
                  {selectedCompany.isVerified ? 'System Verified' : 'Pending Review'}
                </Badge>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailsSection}>
                <h4 className={styles.sectionLabel}><Building2 size={14} /> Company Information</h4>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Industry</span>
                    <span className={styles.infoValue}>{selectedCompany.industry || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Location</span>
                    <span className={styles.infoValue}>{selectedCompany.location || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Country</span>
                    <span className={styles.infoValue}>{selectedCompany.country || 'Global'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tax ID / CIN</span>
                    <span className={styles.infoValue}>{selectedCompany.cinOrGst || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Website</span>
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                      {selectedCompany.website || 'N/A'} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <div className={styles.descriptionBox}>
                  <h4 className={styles.sectionLabel}><Info size={14} /> About</h4>
                  <p>{selectedCompany.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <h4 className={styles.sectionLabel}><User size={14} /> Recruiter Details</h4>
                <div className={styles.recruiterCard}>
                  <div className={styles.recruiterAvatar}>
                    <img src={selectedCompany.recruiterId?.avatar} alt="" />
                  </div>
                  <div className={styles.recruiterInfo}>
                    <div className={styles.recruiterName}>{selectedCompany.recruiterId?.fname} {selectedCompany.recruiterId?.lname}</div>
                    <div className={styles.recruiterEmail}><Mail size={12} /> {selectedCompany.recruiterId?.email}</div>
                    <div className={styles.recruiterBadge}><Badge variant="info">Primary Recruiter</Badge></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
               <Button variant="secondary" onClick={() => setSelectedCompany(null)}>Close</Button>
               {!selectedCompany.isVerified ? (
                 <Button variant="success" onClick={() => { handleVerify(selectedCompany._id, true); setSelectedCompany(null); }}>
                   Verify Now
                 </Button>
               ) : (
                 <Button variant="danger" onClick={() => { handleVerify(selectedCompany._id, false); setSelectedCompany(null); }}>
                   Revoke Verification
                 </Button>
               )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
