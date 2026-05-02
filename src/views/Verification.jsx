'use client';
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ShieldCheck, ShieldAlert, Building2, Globe, FileCheck, XCircle, CheckCircle } from "lucide-react";
import styles from "./Verification.module.css";

export default function Verification() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <Card key={company._id} className={styles.vCard}>
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
                  <Button variant="success" size="sm" onClick={() => handleVerify(company._id, true)}>
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
              <Card key={company._id} className={styles.vCard}>
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
                  <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleVerify(company._id, false)}>
                    <XCircle size={14} /> Revoke
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
