'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Award, FileText, Settings, ShieldCheck, Check, Sparkles, 
  ExternalLink, MessageSquare, Calendar, ChevronRight, Edit3, Save, X
} from "lucide-react";
import styles from "./Profile.module.css";

const SECTIONS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "professional", label: "Professional Info", icon: Briefcase },
  { id: "experience", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Technical Skills", icon: Sparkles },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "resume", label: "Resume & Documents", icon: FileText },
  { id: "preferences", label: "Job Preferences", icon: Settings },
];

export default function Profile() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewingUserId = searchParams.get('userId');
  const isViewingOthers = Boolean(viewingUserId && viewingUserId !== authUser?._id);

  const [activeSection, setActiveSection] = useState("identity");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fname: "Aarav",
    lname: "Sharma",
    email: "candidate@rms.com",
    phone: "+1 (555) ***-5678",
    location: "San Francisco, CA",
    dob: "1997-04-18",
    gender: "Male",
    nationality: "United States",
    nationalId: "ABCDE****F", // Masked fake ID
    headline: "Senior Frontend Engineer | React, Next.js & Design Systems",
    bio: "Passionate engineer with 5+ years building performant web applications and design systems. Dedicated to high Core Web Vitals scores and component modularity.",
    linkedin: "linkedin.com/in/aarav-sharma-dev",
    github: "github.com/aaravsharma",
    portfolio: "https://aaravsharma.dev",
    skills: ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS", "Jest", "Vite", "Node.js"],
    education: [
      { degree: "B.S. in Computer Science", institution: "University of California, Berkeley", year: "2020" }
    ],
    experience: [
      { role: "Senior Frontend Engineer", company: "Apex Cloud", duration: "2022 - Present", description: "Architected enterprise design system across 14 micro-frontends." },
      { role: "Frontend Developer", company: "Nova Systems", duration: "2020 - 2022", description: "Built accessible internal dashboard components in Next.js." }
    ],
    certifications: [
      { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", year: "2023" }
    ],
    preferences: {
      targetRoles: ["Senior Frontend Engineer", "Staff UI Engineer", "Lead Frontend Developer"],
      workMode: "Hybrid / Remote",
      expectedSalary: "$150,000 - $185,000",
      noticePeriod: "2 Weeks"
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const id = viewingUserId || authUser?._id;
        if (id) {
          const { data } = await api.get(`/auth/users/${id}`).catch(() => ({ data: null }));
          if (data) {
            setProfileData(data);
            setFormData(prev => ({
              ...prev,
              fname: data.fname || prev.fname,
              lname: data.lname || prev.lname,
              email: data.email || prev.email,
              location: data.location || prev.location,
              skills: data.skills?.length ? data.skills : prev.skills
            }));
          }
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [viewingUserId, authUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put("/auth/profile", {
        fname: formData.fname,
        lname: formData.lname,
        location: formData.location,
        skills: formData.skills,
        bio: formData.bio
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.fname) {
    return <LoadingSpinner label="Loading profile record..." />;
  }

  const completionPct = 88;

  return (
    <div className={`animate-fade-in ${styles.profileLayout}`}>
      {/* Sidebar */}
      <div className={styles.profileSidebar}>
        {/* User Summary Card */}
        <div className={styles.userSummaryCard}>
          <div className={styles.avatarWrapper}>
            <img 
              src={profileData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fname}`} 
              alt={formData.fname}
              className={styles.avatarImg}
            />
          </div>
          <div>
            <h2 className={styles.userName}>{formData.fname} {formData.lname}</h2>
            <p className={styles.userEmail}>{formData.email}</p>
          </div>
          <Badge variant="primary">
            {profileData?.role ? profileData.role.toUpperCase() : "CANDIDATE"}
          </Badge>

          {isViewingOthers && (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
              <Button 
                size="sm" 
                variant="primary" 
                fullWidth
                onClick={() => router.push(`/messages?recipientId=${viewingUserId}`)}
              >
                <MessageSquare size={13} /> Message
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                fullWidth
                onClick={() => router.push(`/interviews?candidateId=${viewingUserId}`)}
              >
                <Calendar size={13} /> Interview
              </Button>
            </div>
          )}
        </div>

        {/* Profile Completion Indicator */}
        <div className={styles.completionCard}>
          <div className={styles.completionTop}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Profile Strength
            </span>
            <span className={styles.completionPct}>{completionPct}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${completionPct}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            8 of 9 sections verified & complete.
          </div>
        </div>

        {/* Section Navigation List */}
        <div className={styles.sectionNavList}>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                className={`${styles.sectionNavBtn} ${isActive ? styles.active : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <Icon size={15} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Content Card */}
      <div className={styles.mainContent}>
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </div>

            {!isViewingOthers && (
              <Button 
                size="sm" 
                variant={isEditing ? "outline" : "secondary"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X size={14} /> : <Edit3 size={14} />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            )}
          </div>

          {saveSuccess && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.25)', 
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)',
              fontSize: '0.813rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Check size={14} /> Profile information updated successfully.
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* 1. Identity Section */}
            {activeSection === "identity" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input 
                    className={styles.input} 
                    value={formData.fname} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, fname: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input 
                    className={styles.input} 
                    value={formData.lname} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, lname: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Date of Birth</label>
                  <input 
                    type="date"
                    className={styles.input} 
                    value={formData.dob} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <select 
                    className={styles.select}
                    value={formData.gender}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nationality</label>
                  <input 
                    className={styles.input} 
                    value={formData.nationality} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Government ID / National ID (Masked Demo)</label>
                  <input 
                    className={styles.input} 
                    value={formData.nationalId} 
                    disabled 
                    title="Masked demo value for security."
                  />
                </div>
              </div>
            )}

            {/* 2. Contact Section */}
            {activeSection === "contact" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address (Verified)</label>
                  <input className={styles.input} value={formData.email} disabled />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number (Masked Demo)</label>
                  <input 
                    className={styles.input} 
                    value={formData.phone} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Current City & Location</label>
                  <input 
                    className={styles.input} 
                    value={formData.location} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                  />
                </div>
              </div>
            )}

            {/* 3. Professional Information */}
            {activeSection === "professional" && (
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Professional Headline</label>
                  <input 
                    className={styles.input} 
                    value={formData.headline} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, headline: e.target.value })} 
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Executive Bio & Summary</label>
                  <textarea 
                    rows={4}
                    className={styles.textarea} 
                    value={formData.bio} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>LinkedIn Profile URL</label>
                  <input 
                    className={styles.input} 
                    value={formData.linkedin} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>GitHub / Code Portfolio</label>
                  <input 
                    className={styles.input} 
                    value={formData.github} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, github: e.target.value })} 
                  />
                </div>
              </div>
            )}

            {/* 4. Experience */}
            {activeSection === "experience" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.experience.map((exp, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{exp.role}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.813rem' }}>{exp.duration}</span>
                    </div>
                    <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{exp.company}</div>
                    <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Education */}
            {activeSection === "education" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.education.map((edu, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{edu.degree}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.813rem' }}>{edu.year}</span>
                    </div>
                    <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{edu.institution}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. Skills */}
            {activeSection === "skills" && (
              <div>
                <label className={styles.label}>Verified Technical Competencies</label>
                <div className={styles.tagPillWrap} style={{ marginTop: '0.75rem' }}>
                  {formData.skills.map((skill, i) => (
                    <span key={i} className={styles.tagPill}>
                      <Sparkles size={11} style={{ color: 'var(--primary)' }} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Certifications */}
            {activeSection === "certifications" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{cert.name}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.813rem' }}>{cert.year}</span>
                    </div>
                    <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Issued by {cert.issuer}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. Resume */}
            {activeSection === "resume" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  padding: '1.5rem', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={24} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Aarav_Sharma_Resume_2026.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Verified PDF • ATS Score: 92/100</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={() => router.push('/resume-builder')}>
                    Open in Resume AI
                  </Button>
                </div>
              </div>
            )}

            {/* 9. Preferences */}
            {activeSection === "preferences" && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Work Mode Preference</label>
                  <select 
                    className={styles.select}
                    value={formData.preferences.workMode}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, workMode: e.target.value } })}
                  >
                    <option value="Hybrid / Remote">Hybrid / Remote</option>
                    <option value="Fully Remote">Fully Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Expected Compensation</label>
                  <input 
                    className={styles.input} 
                    value={formData.preferences.expectedSalary} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, expectedSalary: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Notice Period</label>
                  <input 
                    className={styles.input} 
                    value={formData.preferences.noticePeriod} 
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, noticePeriod: e.target.value } })}
                  />
                </div>
              </div>
            )}

            {/* Save Changes Footer */}
            {isEditing && (
              <div className={styles.cardFooter}>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Save size={14} /> Save Profile Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
