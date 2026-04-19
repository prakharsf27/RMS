'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Building, Globe, Mail, Users, MapPin, Save } from "lucide-react";
import styles from "./Company.module.css";

export default function Company() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    email: "",
    location: "",
    description: "",
    logo: ""
  });

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/companies/my");
      setFormData(data);
    } catch (err) {
      console.error("Fetch company error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "recruiter") {
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
    setLoading(true);
    try {
      await api.post("/companies", formData);
      alert("Company profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== "recruiter" && user.role !== "admin") {
      return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Building size={48} opacity={0.2} style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="text-gradient">Access Restricted</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Only recruiters can manage company profiles.</p>
        </div>
      );
  }

  return (
    <div className={styles.container + " animate-fade-in"}>
      <header className={styles.header}>
        <h1 className={styles.title}>Company Profile</h1>
        <p className={styles.subtitle}>Manage your organization's public presence on the TalentFlow platform.</p>
      </header>

      {loading ? (
        <LoadingSpinner label="Recuperating organization data..." />
      ) : (
        <div className={styles.layout}>
            <Card>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className={styles.formGrid}>
                <Input label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Industry" name="industry" value={formData.industry} placeholder="e.g. Software, Healthcare" onChange={handleChange} required />
                </div>
                
                <div className={styles.formGrid}>
                <Input label="Website" name="website" value={formData.website} icon={Globe} onChange={handleChange} />
                <Input label="Business Email" name="email" value={formData.email} icon={Mail} onChange={handleChange} />
                </div>

                <div className={styles.formGrid}>
                <Input label="Logo URL" name="logo" value={formData.logo} icon={Globe} onChange={handleChange} />
                <Input label="Headquarters" name="location" value={formData.location} icon={MapPin} onChange={handleChange} required />
                </div>

                <div className={styles.textareaGroup}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>About the Company</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Describe your company culture, mission, and what makes you unique..."
                />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </Button>
                </div>
            </form>
            </Card>

            <aside className={styles.sidebar}>
            <Card className={styles.previewCard}>
                <div className={styles.logoWrapper}>
                {formData.logo ? <img src={formData.logo} className={styles.logoImage} alt="" /> : <Building size={40} />}
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>{formData.name || "Company Name"}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formData.industry || "Industry"}</p>
            </Card>

            <Card className={styles.infoCard}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Public Preview</h4>
                <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                This is how candidates see your company when browsing job postings. A professional profile increases application rates by up to 40%.
                </p>
            </Card>
            </aside>
        </div>
      )}
    </div>
  );
}
