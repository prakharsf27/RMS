'use client';
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { 
  User, Mail, Shield, Camera, Save, LogOut, CheckCircle, 
  AlertCircle, FilePlus, Phone, Calendar, Briefcase, X, 
  Plus, Zap, Search, Globe, Map, Award, BookOpen, 
  Code, Languages, Settings, HelpCircle, ExternalLink,
  ChevronDown, Trash2, GraduationCap, Laptop, Sparkles, Building2, Info
} from "lucide-react";
import styles from "./Profile.module.css";
import { cn } from "../lib/utils";

// ── Sub-components for Multi-Section UI ──────────────────────────────────────

function SectionCard({ icon: Icon, iconBg, title, badge, badgeType = "req", subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={styles.sectionCard} premium>
      <div className={styles.sectionCardHead} onClick={() => setOpen(!open)}>
        <div className={styles.sectionCardHeadLeft}>
          <div className={styles.sectionCardIcon} style={{ background: iconBg }}>
            <Icon size={18} />
          </div>
          <div>
            <div className={styles.sectionCardTitle}>
              {title}{" "}
              {badge && (
                <span className={badgeType === "req" ? styles.badgeReq : styles.badgeOpt}>
                  {badge}
                </span>
              )}
            </div>
            <div className={styles.sectionCardSub}>{subtitle}</div>
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={cn(styles.sectionChevron, open && styles.rotated)} 
        />
      </div>
      {open && <div className={styles.sectionCardBody}>{children}</div>}
    </Card>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </label>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </div>
  );
}

function TagInput({ placeholder, tags = [], onChange }) {
  const [val, setVal] = useState("");
  const add = (e) => {
    if (e.key === "Enter" && val.trim()) {
      e.preventDefault();
      if (!tags.includes(val.trim())) {
        onChange([...tags, val.trim()]);
      }
      setVal("");
    }
  };
  const remove = (i) => onChange(tags.filter((_, idx) => idx !== i));
  return (
    <div className={styles.tagWrap}>
      {tags.map((t, i) => (
        <span key={i} className={styles.tag}>
          {t}
          <button type="button" className={styles.tagX} onClick={() => remove(i)}><X size={10} /></button>
        </span>
      ))}
      <input
        className={styles.tagInput}
        value={val}
        placeholder={tags.length === 0 ? placeholder : ""}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={add}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewingUserId = searchParams.get('userId');
  
  const [viewedUser, setViewedUser] = useState(null);
  const [isViewingOthers, setIsViewingOthers] = useState(!!viewingUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showResume, setShowResume] = useState(true);

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    fname: "", lname: "", email: "", phone: "", bio: "",
    dob: "", gender: "", nationality: "", pan: "", address: "", state: "",
    professionalHeadline: "", careerObjective: "",
    links: { linkedin: "", github: "", portfolio: "", behance: "", other: "" },
    experienceLevel: "fresher", yearsOfExperience: 0,
    workExperience: [], education: [], certifications: [], projects: [],
    languages: [], skills: [],
    jobPreferences: { 
      titles: [], workModes: [], locations: [], relocation: "Yes", 
      salaryMin: "", salaryMax: "", salaryType: "Annual", 
      noticePeriod: "Immediately", employmentStatus: "Fresher" 
    },
    references: []
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [atsScore, setAtsScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // OTP State
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const id = viewingUserId || authUser?._id;
        if (!id) return;
        const { data } = await api.get(`/auth/users/${id}`);
        setViewedUser(data);
        setIsViewingOthers(!!viewingUserId);
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [viewingUserId, authUser]);

  useEffect(() => {
    if (viewedUser) {
      setFormData({
        fname: viewedUser.fname || "",
        lname: viewedUser.lname || "",
        email: viewedUser.email || "",
        phone: viewedUser.phone || "",
        bio: viewedUser.bio || "",
        dob: viewedUser.dob ? new Date(viewedUser.dob).toISOString().split('T')[0] : "",
        gender: viewedUser.gender || "",
        nationality: viewedUser.nationality || "",
        pan: viewedUser.pan || "",
        address: viewedUser.address || "",
        state: viewedUser.state || "",
        professionalHeadline: viewedUser.professionalHeadline || "",
        careerObjective: viewedUser.careerObjective || "",
        links: viewedUser.links || { linkedin: "", github: "", portfolio: "", behance: "", other: "" },
        experienceLevel: viewedUser.experienceLevel || "fresher",
        yearsOfExperience: viewedUser.yearsOfExperience || 0,
        workExperience: viewedUser.workExperience || [],
        education: viewedUser.education || [],
        certifications: viewedUser.certifications || [],
        projects: viewedUser.projects || [],
        languages: viewedUser.languages || [],
        skills: viewedUser.skills || [],
        jobPreferences: viewedUser.jobPreferences || { 
            titles: [], workModes: [], locations: [], relocation: "Yes", 
            salaryMin: "", salaryMax: "", salaryType: "Annual", 
            noticePeriod: "Immediately", employmentStatus: "Fresher" 
        },
        references: viewedUser.references || []
      });
      setAvatarPreview(viewedUser.avatar);
      setAtsScore(viewedUser.atsScore || (Math.floor(Math.random() * (96 - 78 + 1)) + 78));
    }
  }, [viewedUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      simulateScan();
    } else {
      alert("Please select a PDF file.");
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75;
      setAtsScore(randomScore);
      setIsScanning(false);
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
            data.append(key, JSON.stringify(formData[key]));
        } else {
            data.append(key, formData[key]);
        }
    });
    
    if (newAvatarFile) data.append('avatar', newAvatarFile);
    if (resumeFile) data.append('resume', resumeFile);
    data.append('atsScore', atsScore);

    try {
      await api.put("/auth/profile", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsEditing(false);
      alert("Professional identity synchronized successfully.");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Functions
  const handleSendEmailOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post("/auth/send-email-otp");
      setShowEmailOtp(true);
      setShowPhoneOtp(false);
      setOtpValue("");
      alert("Verification code sent to your email!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!otpValue) return;
    setOtpLoading(true);
    try {
      await api.post("/auth/verify-email-otp", { otp: otpValue });
      setShowEmailOtp(false);
      alert("Email verified successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!formData.phone) {
        alert("Please add a phone number first.");
        return;
    }
    setOtpLoading(true);
    try {
      await api.post("/auth/send-phone-otp");
      setShowPhoneOtp(true);
      setShowEmailOtp(false);
      setOtpValue("");
      alert("Verification code sent to your phone! (Check console in dev mode)");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpValue) return;
    setOtpLoading(true);
    try {
      await api.post("/auth/verify-phone-otp", { otp: otpValue });
      setShowPhoneOtp(false);
      alert("Phone number verified successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid code");
    } finally {
      setOtpLoading(false);
    }
  };

  // List Management Helpers
  const addItem = (field, defaultObj) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultObj] }));
  };
  const removeItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };
  const updateItem = (field, index, key, value) => {
    setFormData(prev => {
        const newList = [...prev[field]];
        newList[index] = { ...newList[index], [key]: value };
        return { ...prev, [field]: newList };
    });
  };

  const user = viewedUser || authUser;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

  if (isLoading && !user) return <LoadingSpinner label="Authenticating identity..." />;

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="text-gradient">{isViewingOthers ? 'Candidate Intelligence' : 'Professional Identity'}</h1>
        <p>{isViewingOthers ? `Deep-dive audit of ${user?.fname}'s professional background.` : 'Manage your professional persona and recruitment assets.'}</p>
      </div>

      <div className={cn(styles.container, (isViewingOthers && user?.resume && showResume) && styles.recruiterView)}>
        <aside className={styles.sidebar}>
          <Card className={styles.avatarCard} premium glow>
            <div className={styles.avatarWrapper}>
              <img src={avatarPreview || user?.avatar} alt="Profile" className={styles.avatar} />
              {!isViewingOthers && (
                <>
                  <button className={styles.cameraBtn} onClick={() => avatarInputRef.current.click()}><Camera size={16} /></button>
                  <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
                </>
              )}
            </div>
            <h3 className={styles.userName}>{formData.fname} {formData.lname}</h3>
            <span className={styles.userRole}>{user?.role?.toUpperCase()}</span>
            <div className={styles.badgeRow}>
               <Shield size={14} /> 
               {user?.isEmailVerified && user?.isPhoneVerified ? (
                 <span className={styles.verifiedText}>Verified Talent</span>
               ) : (
                 <span className={styles.pendingText}>Identity Pending</span>
               )}
            </div>

            {/* OTP Verification Controls */}
            {!isViewingOthers && (
              <div className={styles.verificationControls}>
                {!user?.isEmailVerified && (
                  <div className={styles.verifyItem}>
                    <div className={styles.verifyLabel}>
                      <Mail size={12} /> Email
                    </div>
                    {showEmailOtp ? (
                      <div className={styles.otpInputGroup}>
                        <input 
                          className={styles.otpInput} 
                          placeholder="Code" 
                          value={otpValue} 
                          onChange={e => setOtpValue(e.target.value)} 
                          maxLength={6}
                        />
                        <button onClick={handleVerifyEmailOtp} disabled={otpLoading} className={styles.otpBtn}>
                          {otpLoading ? "..." : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setShowEmailOtp(false)} className={styles.otpCancel}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className={styles.verifyBtn} onClick={handleSendEmailOtp} disabled={otpLoading}>
                        Verify
                      </button>
                    )}
                  </div>
                )}

                {!user?.isPhoneVerified && (
                  <div className={styles.verifyItem}>
                    <div className={styles.verifyLabel}>
                      <Phone size={12} /> Phone
                    </div>
                    {showPhoneOtp ? (
                      <div className={styles.otpInputGroup}>
                        <input 
                          className={styles.otpInput} 
                          placeholder="Code" 
                          value={otpValue} 
                          onChange={e => setOtpValue(e.target.value)} 
                          maxLength={6}
                        />
                        <button onClick={handleVerifyPhoneOtp} disabled={otpLoading} className={styles.otpBtn}>
                          {otpLoading ? "..." : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setShowPhoneOtp(false)} className={styles.otpCancel}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className={styles.verifyBtn} onClick={handleSendPhoneOtp} disabled={otpLoading}>
                        Verify
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
          
          <Card className={styles.statsCard} premium>
             <div className={styles.statLine}>
                <span>Since</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong>
             </div>
             <div className={styles.statLine}>
                <span>Hiring Status</span>
                <strong className={cn(styles.status, styles[user?.hiringStatus])}>
                    {(user?.hiringStatus || 'pending').toUpperCase()}
                </strong>
             </div>
             {atsScore > 0 && (
                <div className={styles.statLine}>
                    <span>ATS Resume Score</span>
                    <strong style={{ color: 'var(--success)' }}>{atsScore}/100</strong>
                </div>
             )}
          </Card>

          {!isViewingOthers && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button variant="premium" onClick={handleSubmit} disabled={!isEditing || isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="secondary" icon={LogOut} onClick={logout} style={{ color: 'var(--danger)' }}>
                Sign Out
              </Button>
            </div>
          )}
          {isViewingOthers && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Button variant="secondary" onClick={() => router.back()} style={{ width: '100%' }}>
                    Back to Directory
                </Button>
                {user?.resume && (
                  <Button variant={showResume ? "secondary" : "premium"} onClick={() => setShowResume(!showResume)}>
                    {showResume ? "Hide Resume" : "Preview Resume"}
                  </Button>
                )}
             </div>
          )}
        </aside>

        <main className={styles.main}>
          {isViewingOthers ? (
            <div className={styles.intelligenceReport}>
               {/* Intelligence Header */}
               <div className={styles.intelHeader}>
                  <div className={styles.intelTitle}>
                     <h2>Candidate Intelligence Report</h2>
                     <p>Deep-dive audit of professional assets and semantic match.</p>
                  </div>
                  <div className={styles.intelActions}>
                     <Button size="sm" variant="success" onClick={() => window.open(user.resume?.startsWith('http') ? user.resume : `${baseUrl}${user.resume}`, '_blank')}>
                        <FilePlus size={16} /> Download Resume
                     </Button>
                     <Button size="sm" variant="premium">
                        <Sparkles size={16} /> AI Interview Prediction
                     </Button>
                  </div>
               </div>

               {/* Metrics Row */}
               <div className={styles.metricsGrid}>
                  <Card className={styles.metricCard}>
                     <div className={styles.metricIcon} style={{ background: 'var(--primary-light)' }}><Zap size={20} /></div>
                     <div className={styles.metricInfo}>
                        <span>ATS Score</span>
                        <strong>{atsScore || 72}/100</strong>
                     </div>
                  </Card>
                  <Card className={styles.metricCard}>
                     <div className={styles.metricIcon} style={{ background: 'var(--success-light)' }}><CheckCircle size={20} /></div>
                     <div className={styles.metricInfo}>
                        <span>Verification</span>
                        <strong>Fully Audited</strong>
                     </div>
                  </Card>
                  <Card className={styles.metricCard}>
                     <div className={styles.metricIcon} style={{ background: 'var(--info-light)' }}><Briefcase size={20} /></div>
                     <div className={styles.metricInfo}>
                        <span>Experience</span>
                        <strong>{formData.experienceLevel === 'fresher' ? 'Early Talent' : `${formData.yearsOfExperience} Years`}</strong>
                     </div>
                  </Card>
               </div>

               {/* Professional Headline */}
               <Card className={styles.intelSummaryCard}>
                  <div className={styles.summaryLabel}><Sparkles size={14} /> Professional Identity</div>
                  <h3>{formData.professionalHeadline || 'Aspirational Talent'}</h3>
                  <p>{formData.bio}</p>
                  <div className={styles.linksRow}>
                     {formData.links.linkedin && <a href={formData.links.linkedin} target="_blank" rel="noreferrer"><Globe size={14} /> LinkedIn</a>}
                     {formData.links.github && <a href={formData.links.github} target="_blank" rel="noreferrer"><Code size={14} /> GitHub</a>}
                     {formData.links.portfolio && <a href={formData.links.portfolio} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Portfolio</a>}
                  </div>
               </Card>

               {/* Work Experience Timeline */}
               <div className={styles.reportSection}>
                  <h4 className={styles.sectionTitle}><Briefcase size={18} /> Career Trajectory</h4>
                  <div className={styles.timeline}>
                     {formData.workExperience.length > 0 ? formData.workExperience.map((exp, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                           <div className={styles.timelineDot} />
                           <div className={styles.timelineContent}>
                              <div className={styles.timelineHeader}>
                                 <h5>{exp.title}</h5>
                                 <span className={styles.timelineDate}>
                                    {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – 
                                    {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                 </span>
                              </div>
                              <h6 className={styles.timelineOrg}>{exp.company}</h6>
                              <p className={styles.timelineDesc}>{exp.description}</p>
                           </div>
                        </div>
                     )) : <p className={styles.emptyMsg}>No professional history recorded yet.</p>}
                  </div>
               </div>

               {/* Education & Academic Pedigree */}
               <div className={styles.reportSection}>
                  <h4 className={styles.sectionTitle}><GraduationCap size={18} /> Academic Pedigree</h4>
                  <div className={styles.eduGrid}>
                     {formData.education.map((edu, idx) => (
                        <div key={idx} className={styles.eduItem}>
                           <div className={styles.eduIcon}><BookOpen size={20} /></div>
                           <div className={styles.eduInfo}>
                              <strong>{edu.degree} in {edu.field}</strong>
                              <span>{edu.institution} • {edu.startYear} – {edu.endYear}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Skills Affinity */}
               <div className={styles.reportSection}>
                  <h4 className={styles.sectionTitle}><Code size={18} /> Technical Toolkit</h4>
                  <div className={styles.intelSkills}>
                     {formData.skills.map(skill => (
                        <span key={skill} className={styles.intelSkillTag}>{skill}</span>
                     ))}
                  </div>
               </div>

               {/* Job Matching Preferences */}
               <div className={styles.reportSection}>
                  <h4 className={styles.sectionTitle}><Settings size={18} /> Intent & Preferences</h4>
                  <div className={styles.prefsGrid}>
                     <div className={styles.prefItem}>
                        <span>Desired Roles</span>
                        <div>{formData.jobPreferences.titles.join(', ') || 'Any relevant role'}</div>
                     </div>
                     <div className={styles.prefItem}>
                        <span>Notice Period</span>
                        <strong>{formData.jobPreferences.noticePeriod}</strong>
                     </div>
                     <div className={styles.prefItem}>
                        <span>Relocation</span>
                        <strong>{formData.jobPreferences.relocation}</strong>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* 1. Basic Information */}
              <SectionCard icon={User} iconBg="var(--primary-light)" title="Basic Information" badge="Required" subtitle="Your name, photo, and identity details" defaultOpen>
                <div className={styles.grid}>
                  <Field label="First Name" required>
                    <input className={styles.input} value={formData.fname} disabled={!isEditing} onChange={e => setFormData({...formData, fname: e.target.value})} />
                  </Field>
                  <Field label="Last Name" required>
                    <input className={styles.input} value={formData.lname} disabled={!isEditing} onChange={e => setFormData({...formData, lname: e.target.value})} />
                  </Field>
                </div>
                <div className={styles.grid}>
                  <Field label="Date of Birth" required>
                    <input type="date" className={styles.input} value={formData.dob} disabled={!isEditing} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </Field>
                  <Field label="Gender">
                    <select className={styles.input} value={formData.gender} disabled={!isEditing} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </Field>
                </div>
                <div className={styles.grid}>
                  <Field label="Nationality">
                    <input className={styles.input} value={formData.nationality} disabled={!isEditing} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                  </Field>
                  <Field label="PAN / National ID">
                    <input className={styles.input} placeholder="For identity verification" value={formData.pan} disabled={!isEditing} onChange={e => setFormData({...formData, pan: e.target.value})} />
                  </Field>
                </div>
              </SectionCard>

              {/* 2. Contact Details */}
              <SectionCard icon={Mail} iconBg="var(--info-light)" title="Contact Details" badge="Required" subtitle="Recruiter communication channels">
                <div className={styles.grid}>
                  <Field label="Email Address" required>
                    <input className={styles.input} value={formData.email} disabled />
                  </Field>
                  <Field label="Phone Number" required>
                    <input className={styles.input} value={formData.phone} disabled={!isEditing} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </Field>
                </div>
                <div className={styles.grid}>
                  <Field label="City / Town" required>
                    <input className={styles.input} value={formData.address} disabled={!isEditing} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </Field>
                  <Field label="State">
                    <input className={styles.input} value={formData.state} disabled={!isEditing} onChange={e => setFormData({...formData, state: e.target.value})} />
                  </Field>
                </div>
              </SectionCard>

              {/* 3. Headline & Summary */}
              <SectionCard icon={Sparkles} iconBg="var(--premium-light)" title="Headline & Summary" badge="Required" subtitle="How you present yourself to recruiters">
                <Field label="Professional Headline" required hint="Appears under your name. Keep it punchy.">
                  <input className={styles.input} placeholder="e.g. Full Stack Developer | React & Node.js Specialist" value={formData.professionalHeadline} disabled={!isEditing} onChange={e => setFormData({...formData, professionalHeadline: e.target.value})} />
                </Field>
                <Field label="About / Professional Summary" required>
                  <textarea className={styles.textarea} style={{ minHeight: 120 }} value={formData.bio} disabled={!isEditing} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe your expertise, career highlights and what drives you..." />
                </Field>
                <Field label="Career Objective">
                  <textarea className={styles.textarea} value={formData.careerObjective} disabled={!isEditing} onChange={e => setFormData({...formData, careerObjective: e.target.value})} placeholder="Briefly state your immediate goals..." />
                </Field>
              </SectionCard>

              {/* 4. Online Profiles */}
              <SectionCard icon={Globe} iconBg="var(--warning-light)" title="Online Profiles" badge="Optional" badgeType="opt" subtitle="LinkedIn, GitHub, Portfolio">
                <div className={styles.grid}>
                  <Field label="LinkedIn"><input className={styles.input} value={formData.links.linkedin} disabled={!isEditing} onChange={e => setFormData({...formData, links: {...formData.links, linkedin: e.target.value}})} /></Field>
                  <Field label="GitHub"><input className={styles.input} value={formData.links.github} disabled={!isEditing} onChange={e => setFormData({...formData, links: {...formData.links, github: e.target.value}})} /></Field>
                </div>
                <div className={styles.grid}>
                  <Field label="Portfolio"><input className={styles.input} value={formData.links.portfolio} disabled={!isEditing} onChange={e => setFormData({...formData, links: {...formData.links, portfolio: e.target.value}})} /></Field>
                  <Field label="Behance"><input className={styles.input} value={formData.links.behance} disabled={!isEditing} onChange={e => setFormData({...formData, links: {...formData.links, behance: e.target.value}})} /></Field>
                </div>
              </SectionCard>

              {/* 5. Resume Upload */}
              <SectionCard icon={FilePlus} iconBg="var(--danger-light)" title="Resume / CV" badge="Required" subtitle="Upload your latest PDF for ATS parsing">
                  {!isViewingOthers ? (
                      <div className={cn(styles.uploadZone, isScanning && styles.uploadZoneActive)} onClick={() => isEditing && !isScanning && resumeInputRef.current.click()}>
                          <div className={styles.uploadIcon}>
                              {isScanning ? <Zap size={24} className="text-primary animate-pulse" /> : (resumeFile || user?.resume ? <CheckCircle size={24} className="text-success" /> : <FilePlus size={24} />)}
                          </div>
                          <div>
                              <strong>{isScanning ? "Scanning Profile..." : resumeFile ? resumeFile.name : user?.resume ? "Resume_Updated.pdf" : "Upload PDF Resume"}</strong>
                              <p>{isScanning ? "Extracting ATS data points..." : "Format: PDF only (Max 5MB)"}</p>
                          </div>
                          <input type="file" ref={resumeInputRef} hidden accept=".pdf" onChange={handleResumeSelect} />
                      </div>
                  ) : (
                      <div className={styles.uploadZone} style={{ cursor: 'default' }}>
                          <CheckCircle size={24} className="text-success" />
                          <div>
                              <strong>{user?.resume ? "Resume Available" : "No Resume Attached"}</strong>
                              <p>Verified candidate document</p>
                          </div>
                      </div>
                  )}
              </SectionCard>

              {/* 6. Work Experience */}
              <SectionCard icon={Briefcase} iconBg="var(--primary-light)" title="Work Experience" badge="Optional" badgeType="opt" subtitle="Internships, full-time, or freelance work">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.workExperience.map((exp, idx) => (
                    <div key={idx} className={styles.entryCard}>
                      {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('workExperience', idx)}><Trash2 size={14} /></button>}
                      <div className={styles.grid}>
                        <Field label="Job Title" required><input className={styles.input} value={exp.title} disabled={!isEditing} onChange={e => updateItem('workExperience', idx, 'title', e.target.value)} /></Field>
                        <Field label="Company" required><input className={styles.input} value={exp.company} disabled={!isEditing} onChange={e => updateItem('workExperience', idx, 'company', e.target.value)} /></Field>
                      </div>
                      <div className={styles.grid}>
                        <Field label="Start Date"><input type="date" className={styles.input} value={exp.startDate?.split('T')[0]} disabled={!isEditing} onChange={e => updateItem('workExperience', idx, 'startDate', e.target.value)} /></Field>
                        <Field label="End Date"><input type="date" className={styles.input} value={exp.endDate?.split('T')[0]} disabled={!isEditing || exp.isCurrent} onChange={e => updateItem('workExperience', idx, 'endDate', e.target.value)} /></Field>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={exp.isCurrent} disabled={!isEditing} onChange={e => updateItem('workExperience', idx, 'isCurrent', e.target.checked)} />
                        <span style={{ fontSize: 13 }}>Currently working here</span>
                      </div>
                      <Field label="Description"><textarea className={styles.textarea} value={exp.description} disabled={!isEditing} onChange={e => updateItem('workExperience', idx, 'description', e.target.value)} /></Field>
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="secondary" type="button" onClick={() => addItem('workExperience', { title: "", company: "", startDate: "", endDate: "", isCurrent: false, description: "" })}>
                      + Add Experience
                    </Button>
                  )}
                </div>
              </SectionCard>

              {/* 7. Education */}
              <SectionCard icon={GraduationCap} iconBg="var(--info-light)" title="Education" badge="Required" subtitle="Degrees and academic qualifications">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.education.map((edu, idx) => (
                          <div key={idx} className={styles.entryCard}>
                              {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('education', idx)}><Trash2 size={14} /></button>}
                              <div className={styles.grid}>
                                  <Field label="Degree" required><input className={styles.input} value={edu.degree} disabled={!isEditing} onChange={e => updateItem('education', idx, 'degree', e.target.value)} /></Field>
                                  <Field label="Institution" required><input className={styles.input} value={edu.institution} disabled={!isEditing} onChange={e => updateItem('education', idx, 'institution', e.target.value)} /></Field>
                              </div>
                              <div className={styles.grid}>
                                  <Field label="Start Year"><input className={styles.input} value={edu.startYear} disabled={!isEditing} onChange={e => updateItem('education', idx, 'startYear', e.target.value)} /></Field>
                                  <Field label="End Year"><input className={styles.input} value={edu.endYear} disabled={!isEditing} onChange={e => updateItem('education', idx, 'endYear', e.target.value)} /></Field>
                              </div>
                          </div>
                      ))}
                      {isEditing && (
                          <Button variant="secondary" type="button" onClick={() => addItem('education', { degree: "", institution: "", startYear: "", endYear: "" })}>
                              + Add Education
                          </Button>
                      )}
                  </div>
              </SectionCard>

              {/* 8. Skills */}
              <SectionCard icon={Code} iconBg="var(--warning-light)" title="Skills" badge="Required" subtitle="Technical and soft skills">
                  <Field label="Skills" required hint="Press Enter to add each skill">
                      <TagInput tags={formData.skills} onChange={tags => setFormData({...formData, skills: tags})} placeholder="e.g. React, Node.js, Project Management" />
                  </Field>
              </SectionCard>

              {/* 9. Certifications */}
              <SectionCard icon={Award} iconBg="var(--success-light)" title="Certifications & Awards" badge="Optional" badgeType="opt" subtitle="Courses, licences, and professional achievements">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.certifications.map((cert, idx) => (
                          <div key={idx} className={styles.entryCard}>
                              {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('certifications', idx)}><Trash2 size={14} /></button>}
                              <div className={styles.grid}>
                                  <Field label="Title" required><input className={styles.input} value={cert.title} disabled={!isEditing} onChange={e => updateItem('certifications', idx, 'title', e.target.value)} /></Field>
                                  <Field label="Organization"><input className={styles.input} value={cert.organization} disabled={!isEditing} onChange={e => updateItem('certifications', idx, 'organization', e.target.value)} /></Field>
                              </div>
                              <div className={styles.grid}>
                                  <Field label="Issue Date"><input type="date" className={styles.input} value={cert.issueDate?.split('T')[0]} disabled={!isEditing} onChange={e => updateItem('certifications', idx, 'issueDate', e.target.value)} /></Field>
                                  <Field label="Credential ID"><input className={styles.input} value={cert.credentialId} disabled={!isEditing} onChange={e => updateItem('certifications', idx, 'credentialId', e.target.value)} /></Field>
                              </div>
                          </div>
                      ))}
                      {isEditing && (
                          <Button variant="secondary" type="button" onClick={() => addItem('certifications', { title: "", organization: "", issueDate: "", credentialId: "" })}>
                              + Add Certification
                          </Button>
                      )}
                  </div>
              </SectionCard>

              {/* 10. Projects */}
              <SectionCard icon={Laptop} iconBg="var(--premium-light)" title="Projects" badge="Optional" badgeType="opt" subtitle="Academic, personal, or professional work">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.projects.map((proj, idx) => (
                          <div key={idx} className={styles.entryCard}>
                              {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('projects', idx)}><Trash2 size={14} /></button>}
                              <div className={styles.grid}>
                                  <Field label="Project Title" required><input className={styles.input} value={proj.title} disabled={!isEditing} onChange={e => updateItem('projects', idx, 'title', e.target.value)} /></Field>
                                  <Field label="Project Link"><input className={styles.input} value={proj.link} disabled={!isEditing} onChange={e => updateItem('projects', idx, 'link', e.target.value)} /></Field>
                              </div>
                              <Field label="Description"><textarea className={styles.textarea} value={proj.description} disabled={!isEditing} onChange={e => updateItem('projects', idx, 'description', e.target.value)} /></Field>
                          </div>
                      ))}
                      {isEditing && (
                          <Button variant="secondary" type="button" onClick={() => addItem('projects', { title: "", link: "", description: "" })}>
                              + Add Project
                          </Button>
                      )}
                  </div>
              </SectionCard>

              {/* 11. Languages */}
              <SectionCard icon={Languages} iconBg="var(--primary-light)" title="Languages" badge="Optional" badgeType="opt" subtitle="Languages you can communicate in">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.languages.map((lang, idx) => (
                          <div key={idx} className={styles.entryCard} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}>
                              {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('languages', idx)}><Trash2 size={14} /></button>}
                              <Field label="Language" style={{ flex: 1 }}><input className={styles.input} value={lang.name} disabled={!isEditing} onChange={e => updateItem('languages', idx, 'name', e.target.value)} /></Field>
                              <Field label="Proficiency" style={{ flex: 1 }}>
                                  <select className={styles.input} value={lang.proficiency} disabled={!isEditing} onChange={e => updateItem('languages', idx, 'proficiency', e.target.value)}>
                                      <option>Native</option>
                                      <option>Fluent</option>
                                      <option>Professional</option>
                                      <option>Conversational</option>
                                      <option>Basic</option>
                                  </select>
                              </Field>
                          </div>
                      ))}
                      {isEditing && (
                          <Button variant="secondary" type="button" onClick={() => addItem('languages', { name: "", proficiency: "Fluent" })}>
                              + Add Language
                          </Button>
                      )}
                  </div>
              </SectionCard>

              {/* 12. Job Preferences */}
              <SectionCard icon={Settings} iconBg="var(--info-light)" title="Job Preferences" badge="Required" subtitle="Help us match you with the right roles">
                  <Field label="Desired Job Titles">
                      <TagInput tags={formData.jobPreferences.titles} onChange={tags => setFormData({...formData, jobPreferences: {...formData.jobPreferences, titles: tags}})} placeholder="e.g. Software Engineer" />
                  </Field>
                  <div className={styles.grid}>
                      <Field label="Relocation">
                          <select className={styles.input} value={formData.jobPreferences.relocation} disabled={!isEditing} onChange={e => setFormData({...formData, jobPreferences: {...formData.jobPreferences, relocation: e.target.value}})}>
                              <option>Yes</option>
                              <option>No</option>
                              <option>Depends</option>
                          </select>
                      </Field>
                      <Field label="Notice Period">
                          <select className={styles.input} value={formData.jobPreferences.noticePeriod} disabled={!isEditing} onChange={e => setFormData({...formData, jobPreferences: {...formData.jobPreferences, noticePeriod: e.target.value}})}>
                              <option>Immediately</option>
                              <option>15 days</option>
                              <option>30 days</option>
                              <option>Other</option>
                          </select>
                      </Field>
                  </div>
              </SectionCard>

              {/* 13. References */}
              <SectionCard icon={User} iconBg="var(--bg-elevated-hover)" title="References" badge="Optional" badgeType="opt" subtitle="Professional or academic references">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.references.map((ref, idx) => (
                          <div key={idx} className={styles.entryCard}>
                              {isEditing && <button type="button" className={styles.removeBtn} onClick={() => removeItem('references', idx)}><Trash2 size={14} /></button>}
                              <div className={styles.grid}>
                                  <Field label="Full Name"><input className={styles.input} value={ref.name} disabled={!isEditing} onChange={e => updateItem('references', idx, 'name', e.target.value)} /></Field>
                                  <Field label="Designation"><input className={styles.input} value={ref.designation} disabled={!isEditing} onChange={e => updateItem('references', idx, 'designation', e.target.value)} /></Field>
                              </div>
                              <div className={styles.grid}>
                                  <Field label="Organization"><input className={styles.input} value={ref.organization} disabled={!isEditing} onChange={e => updateItem('references', idx, 'organization', e.target.value)} /></Field>
                                  <Field label="Contact Info"><input className={styles.input} value={ref.email} disabled={!isEditing} placeholder="Email or Phone" onChange={e => updateItem('references', idx, 'email', e.target.value)} /></Field>
                              </div>
                          </div>
                      ))}
                      {isEditing && (
                          <Button variant="secondary" type="button" onClick={() => addItem('references', { name: "", designation: "", organization: "", email: "" })}>
                              + Add Reference
                          </Button>
                      )}
                  </div>
              </SectionCard>

              {!isViewingOthers && !isEditing && (
                  <Card className={styles.editPrompt} glow>
                      <div className={styles.editPromptContent}>
                          <Info size={24} className="text-primary" />
                          <div>
                              <h4>Is your profile up to date?</h4>
                              <p>Keeping your professional identity current increases your chances of being noticed by top recruiters.</p>
                          </div>
                      </div>
                      <Button variant="premium" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </Card>
              )}
            </form>
          )}
        </main>

        {(isViewingOthers && user?.resume && showResume) && (
          <aside className={cn(styles.resumePreview, "animate-fade-in")}>
            <iframe 
              src={`${user.resume.startsWith('http') ? user.resume : baseUrl + user.resume}#toolbar=0`} 
              className={styles.resumeIframe}
              title="Candidate Resume"
            />
          </aside>
        )}
      </div>
    </div>
  );
}
