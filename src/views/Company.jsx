'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Building, Globe, Mail, Users, MapPin, Save, ShieldCheck, Clock, ExternalLink, CheckCircle } from "lucide-react";
import styles from "./Company.module.css";

export default function Company() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    email: "",
    location: "",
    description: "",
    logo: "",
    cinOrGst: "",
    country: "",
    isVerified: false
  });

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/companies/my");
      if (data) setFormData(data);
    } catch (err) {
      console.error("Fetch company error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "recruiter") {
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/companies", formData);
      showToast("Organization profile and verification credentials updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "recruiter" && user?.role !== "admin") {
      return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Building size={48} opacity={0.2} style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="text-gradient">Access Restricted</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Only authorized recruiters and administrators can manage company profiles.</p>
        </div>
      );
  }

  return (
    <div className={styles.container + " animate-fade-in"}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Company Workspace</h1>
            <p className={styles.subtitle}>Manage your organization's verified branding, legal credentials, and candidate-facing profile.</p>
          </div>
          {formData.name && (
            <div>
              {formData.isVerified ? (
                <Badge variant="success" size="lg">
                  <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Verified Employer
                </Badge>
              ) : (
                <Badge variant="warning" size="lg">
                  <Clock size={14} style={{ marginRight: '4px' }} /> Verification Pending
                </Badge>
              )}
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <LoadingSpinner label="Loading organization profile..." />
      ) : (
        <div className={styles.layout}>
            <Card>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>General Information</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 1rem 0' }}>Basic public credentials displayed across active job listings.</p>
                  <div className={styles.formGrid}>
                    <Input label="Company Legal Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Input label="Industry Sector" name="industry" value={formData.industry || ''} placeholder="e.g. Enterprise Cloud Infrastructure" onChange={handleChange} required />
                  </div>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Online & Contact Presence</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 1rem 0' }}>Official domain and contact email for candidate inquiries.</p>
                  <div className={styles.formGrid}>
                    <Input label="Official Website" name="website" value={formData.website || ''} icon={Globe} placeholder="https://company.com" onChange={handleChange} />
                    <Input label="Recruitment Contact Email" name="email" value={formData.email || ''} icon={Mail} placeholder="talent@company.com" onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Branding & Headquarters</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 1rem 0' }}>Primary office headquarters and official square logo URL.</p>
                  <div className={styles.formGrid}>
                    <Input label="Square Logo URL" name="logo" value={formData.logo || ''} icon={Globe} placeholder="https://domain.com/logo.png" onChange={handleChange} />
                    <Input label="Headquarters Location" name="location" value={formData.location || ''} icon={MapPin} placeholder="San Francisco, CA / Bengaluru, India" onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Compliance & Legal Registration</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 1rem 0' }}>Tax identification numbers for administrative trust authorization.</p>
                  <div className={styles.formGrid}>
                    <Input 
                      label="CIN / GST / Corporate Tax ID" 
                      name="cinOrGst" 
                      value={formData.cinOrGst || ''} 
                      placeholder="e.g. U74140DL2015PTC288000" 
                      onChange={handleChange} 
                      required 
                    />
                    <Input 
                      label="Country of Incorporation" 
                      name="country" 
                      value={formData.country || ''} 
                      placeholder="e.g. United States, India" 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className={styles.textareaGroup}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Company Culture & Mission Overview</label>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 0.5rem 0' }}>Summarize your engineering culture, perks, and vision for prospective candidates.</p>
                  <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      className={styles.textarea}
                      placeholder="Describe what makes your team unique..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button type="submit" disabled={saving} variant="primary">
                      {saving ? "Saving Changes..." : <><Save size={16} /> Save Organization Profile</>}
                  </Button>
                </div>
            </form>
            </Card>

            <aside className={styles.sidebar}>
            <Card className={styles.previewCard}>
                <div className={styles.logoWrapper}>
                  {formData.logo ? <img src={formData.logo} className={styles.logoImage} alt="" /> : <Building size={36} />}
                </div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700 }}>
                  {formData.name || "TalentFlow Technologies"}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                  {formData.industry || "Software & Cloud Systems"}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {formData.location && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {formData.location}
                    </span>
                  )}
                  {formData.website && (
                    <a href={formData.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={12} /> Visit site
                    </a>
                  )}
                </div>
            </Card>

            <Card className={styles.infoCard}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>Candidate Presentation</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  A complete, verified employer profile increases candidate response rates by 42% and unlocks privileged applicant matching in TalentFlow AI search.
                </p>
            </Card>
            </aside>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          background: toastMessage.type === 'danger' ? 'var(--danger)' : 'var(--primary)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1100,
          animation: 'fadeIn 0.2s ease-in'
        }}>
          {toastMessage.text}
        </div>
      )}
    </div>
  );
}
