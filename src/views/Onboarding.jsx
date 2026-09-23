'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Phone, Briefcase, GraduationCap, Code2, 
  Building2, FolderGit2, Award, FileText, Settings, 
  Check, ArrowRight, ArrowLeft, Upload, Trash2, LogOut,
  ShieldCheck, Sparkles, AlertCircle, Globe, MapPin, Mail
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Button } from "../components/ui/Button";
import styles from "./Onboarding.module.css";
import { cn } from "../lib/utils";

const CANDIDATE_STEPS = [
  { id: 1, name: "Identity", icon: User, desc: "Personal identity and profile photo" },
  { id: 2, name: "Contact", icon: Phone, desc: "Phone, address and location" },
  { id: 3, name: "Professional Info", icon: Briefcase, desc: "Headline and career objectives" },
  { id: 4, name: "Education", icon: GraduationCap, desc: "Academic background and degrees" },
  { id: 5, name: "Skills", icon: Code2, desc: "Technical competencies and frameworks" },
  { id: 6, name: "Experience", icon: Building2, desc: "Employment history and track record" },
  { id: 7, name: "Projects", icon: FolderGit2, desc: "Technical builds and repositories" },
  { id: 8, name: "Certifications", icon: Award, desc: "Accreditations and licenses" },
  { id: 9, name: "Resume", icon: FileText, desc: "Resume document upload or text" },
  { id: 10, name: "Preferences", icon: Settings, desc: "Work mode, notice period and target roles" }
];

const RECRUITER_STEPS = [
  { id: 1, name: "General Information", icon: Building2, desc: "Basic public credentials displayed across active job listings." },
  { id: 2, name: "Online & Contact Presence", icon: Globe, desc: "Official domain and contact email for candidate inquiries." },
  { id: 3, name: "Branding & Headquarters", icon: MapPin, desc: "Primary office headquarters and official square logo URL." },
  { id: 4, name: "Compliance & Legal Registration", icon: ShieldCheck, desc: "Tax identification numbers for administrative trust authorization." },
  { id: 5, name: "Company Culture & Mission Overview", icon: Sparkles, desc: "Summarize your engineering culture, perks, and vision for prospective candidates." }
];

export default function Onboarding() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const isRecruiter = user?.role === 'recruiter';
  const steps = isRecruiter ? RECRUITER_STEPS : CANDIDATE_STEPS;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    gender: "prefer-not-to-say",
    nationality: "United States",
    avatar: "",
    phone: "",
    address: "",
    state: "",
    professionalHeadline: "",
    careerObjective: "",
    experienceLevel: "fresher",
    yearsOfExperience: 0,
    education: [{ degree: "B.S. in Computer Science", field: "Computer Science", institution: "", endYear: "2024", grade: "3.8 GPA" }],
    skills: ["React", "JavaScript", "TypeScript"],
    workExperience: [{ title: "", company: "", location: "", startDate: "", endDate: "", isCurrent: true, description: "" }],
    projects: [{ title: "", description: "", link: "", skills: ["React", "Node.js"] }],
    certifications: [{ title: "", organization: "", issueDate: "", credentialId: "" }],
    resumeText: "",
    jobPreferences: {
      titles: ["Frontend Engineer", "Full Stack Engineer"],
      workModes: ["Remote", "Hybrid"],
      salaryMin: 85000,
      noticePeriod: "Immediate"
    },
    // Recruiter Specific
    companyName: "",
    companyIndustry: "Enterprise Cloud Infrastructure",
    companyWebsite: "",
    companyEmail: "",
    companyLogo: "",
    companyLocation: "",
    cinOrGst: "",
    country: "United States",
    companyDescription: ""
  });

  const [newSkillInput, setNewSkillInput] = useState("");
  const fileInputRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Initialize with user profile once on mount
  useEffect(() => {
    if (user && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (user.isDemoAccount || user.onboardingCompleted) {
        router.replace('/dashboard');
        return;
      }
      setFormData(prev => ({
        ...prev,
        fname: user.fname || prev.fname,
        lname: user.lname || prev.lname,
        avatar: user.avatar || prev.avatar,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        state: user.state || prev.state,
        professionalHeadline: user.professionalHeadline || prev.professionalHeadline,
        skills: user.skills?.length > 0 ? user.skills : prev.skills,
        companyName: user.companyName || prev.companyName,
        companyEmail: user.email || prev.companyEmail
      }));

      if (user.role === 'recruiter') {
        api.get('/companies/my').then(({ data }) => {
          if (data && data._id) {
            setFormData(prev => ({
              ...prev,
              companyName: data.name || prev.companyName || user.companyName || "",
              companyIndustry: data.industry || prev.companyIndustry,
              companyWebsite: data.website || prev.companyWebsite,
              companyEmail: data.email || prev.companyEmail || user.email || "",
              companyLogo: data.logo || prev.companyLogo,
              companyLocation: data.location || prev.companyLocation,
              cinOrGst: data.cinOrGst || prev.cinOrGst,
              country: data.country || prev.country,
              companyDescription: data.description || prev.companyDescription
            }));
          }
        }).catch(() => {});
      }
    }
  }, [user, router]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  // Avatar Upload Handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5MB.");
      return;
    }

    const uploadPayload = new FormData();
    uploadPayload.append('avatar', file);

    try {
      const { data } = await api.post('/auth/upload-avatar', uploadPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar: data.avatar }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { data } = await api.delete('/auth/upload-avatar');
      setFormData(prev => ({ ...prev, avatar: data.avatar }));
    } catch (err) {
      console.warn("Avatar remove error:", err);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const s = newSkillInput.trim();
      if (s && !formData.skills.includes(s)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
        setNewSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Validation per step
  const validateStep = (stepNumber) => {
    if (isRecruiter) {
      if (stepNumber === 1) {
        if (!formData.companyName.trim()) {
          setError("Company Legal Name is required.");
          return false;
        }
      } else if (stepNumber === 2) {
        if (!formData.companyEmail.trim()) {
          setError("Recruitment Contact Email is required.");
          return false;
        }
      } else if (stepNumber === 3) {
        if (!formData.companyLocation.trim()) {
          setError("Headquarters Location is required (e.g. San Francisco, CA / Bengaluru, India).");
          return false;
        }
      } else if (stepNumber === 4) {
        if (!formData.cinOrGst.trim()) {
          setError("CIN / GST / Corporate Tax ID is required.");
          return false;
        }
        if (!formData.country.trim()) {
          setError("Country of Incorporation is required.");
          return false;
        }
      } else if (stepNumber === 5) {
        if (!formData.companyDescription.trim()) {
          setError("Company Culture & Mission Overview description is required.");
          return false;
        }
      }
      return true;
    }

    // Candidate Validation
    if (stepNumber === 1) {
      if (!formData.fname.trim() || !formData.lname.trim()) {
        setError("First name and last name are required.");
        return false;
      }
    } else if (stepNumber === 2) {
      if (!formData.phone.trim()) {
        setError("Phone number is required for contact verification.");
        return false;
      }
    } else if (stepNumber === 3) {
      if (!formData.professionalHeadline.trim()) {
        setError("Please enter a professional headline or current role.");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        name: formData.companyName,
        companyName: formData.companyName,
        industry: formData.companyIndustry,
        companyIndustry: formData.companyIndustry,
        website: formData.companyWebsite,
        companyWebsite: formData.companyWebsite,
        email: formData.companyEmail,
        companyEmail: formData.companyEmail,
        logo: formData.companyLogo,
        companyLogo: formData.companyLogo,
        location: formData.companyLocation,
        companyLocation: formData.companyLocation,
        cinOrGst: formData.cinOrGst,
        taxId: formData.cinOrGst,
        country: formData.country,
        description: formData.companyDescription,
        companyDescription: formData.companyDescription
      };

      // Autosave current progress to profile API
      await api.put('/auth/profile', payload);

      if (isRecruiter) {
        await api.post('/companies', {
          name: formData.companyName || user?.companyName || "My Company",
          industry: formData.companyIndustry || "Enterprise Cloud Infrastructure",
          website: formData.companyWebsite || "",
          email: formData.companyEmail || user?.email,
          logo: formData.companyLogo || "",
          location: formData.companyLocation || "San Francisco, CA",
          cinOrGst: formData.cinOrGst || "PENDING",
          country: formData.country || "United States",
          description: formData.companyDescription || ""
        }).catch(err => console.warn('Company upsert background save:', err?.message));
      }
      
      setCompletedSteps(prev => new Set(prev).add(currentStep));

      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Final Step: Complete Onboarding!
        const { data } = await api.post('/auth/complete-onboarding', payload);
        if (data.user) {
          updateUser(data.user);
          localStorage.setItem("rms_user", JSON.stringify(data.user));
        } else {
          updateUser({ onboardingCompleted: true });
        }
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const completionPct = Math.round(((completedSteps.size + 1) / steps.length) * 100);

  return (
    <div className={styles.page}>
      {/* ─── Left Stepper Sidebar ─── */}
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>TF</div>
            <div className={styles.brandText}>
              <span>TalentFlow</span>
              <span className={styles.brandBadge}>AI</span>
            </div>
          </div>

          <div className={styles.completionCard}>
            <div className={styles.completionHeader}>
              <span>Profile Setup</span>
              <span className={styles.completionPct}>{Math.min(100, completionPct)}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${Math.min(100, completionPct)}%` }} />
            </div>
            <p className={styles.stepSubtext}>
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
            </p>
          </div>

          <div className={styles.stepsList}>
            {steps.map(step => {
              const isDone = completedSteps.has(step.id);
              const isActive = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    styles.stepItem,
                    isActive && styles.stepItemActive,
                    isDone && styles.stepItemDone
                  )}
                  onClick={() => {
                    if (isDone || step.id <= currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <div className={cn(
                    styles.stepBadge,
                    isActive && styles.stepBadgeActive,
                    isDone && styles.stepBadgeDone
                  )}>
                    {isDone ? <Check size={13} /> : step.id}
                  </div>
                  <div>
                    <div style={{ lineHeight: 1.2 }}>{step.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            type="button" 
            className={styles.stepItem} 
            style={{ color: '#94a3b8', width: '100%' }}
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Right Interactive Form Area ─── */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={styles.topBarRole}>
              {isRecruiter ? 'Recruiter Onboarding' : 'Candidate Onboarding'}
            </span>
          </div>
          <span className={styles.topBarEmail}>
            {user?.email}
          </span>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>{steps[currentStep - 1]?.name}</h2>
            <p className={styles.stepDesc}>{steps[currentStep - 1]?.desc}</p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* ════════════════════════════════════════════════════════
              RECRUITER STEP 1: GENERAL INFORMATION
          ════════════════════════════════════════════════════════ */}
          {isRecruiter && currentStep === 1 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Legal Name *</label>
                <input 
                  className={styles.input} 
                  value={formData.companyName} 
                  onChange={e => updateField('companyName', e.target.value)} 
                  placeholder="e.g. Acme Technologies Inc."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Industry Sector</label>
                <input 
                  className={styles.input} 
                  value={formData.companyIndustry} 
                  onChange={e => updateField('companyIndustry', e.target.value)} 
                  placeholder="e.g. Enterprise Cloud Infrastructure"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              RECRUITER STEP 2: ONLINE & CONTACT PRESENCE
          ════════════════════════════════════════════════════════ */}
          {isRecruiter && currentStep === 2 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Official Website</label>
                <input 
                  type="url"
                  className={styles.input} 
                  value={formData.companyWebsite} 
                  onChange={e => updateField('companyWebsite', e.target.value)} 
                  placeholder="https://company.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recruitment Contact Email *</label>
                <input 
                  type="email"
                  className={styles.input} 
                  value={formData.companyEmail} 
                  onChange={e => updateField('companyEmail', e.target.value)} 
                  placeholder="talent@company.com"
                  required
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              RECRUITER STEP 3: BRANDING & HEADQUARTERS
          ════════════════════════════════════════════════════════ */}
          {isRecruiter && currentStep === 3 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Square Logo URL</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {formData.companyLogo && (
                    <img 
                      src={formData.companyLogo} 
                      alt="Company Logo Preview" 
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0', padding: 4 }}
                    />
                  )}
                  <input 
                    type="url"
                    className={styles.input} 
                    value={formData.companyLogo} 
                    onChange={e => updateField('companyLogo', e.target.value)} 
                    placeholder="https://domain.com/logo.png"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Headquarters Location *</label>
                <input 
                  className={styles.input} 
                  value={formData.companyLocation} 
                  onChange={e => updateField('companyLocation', e.target.value)} 
                  placeholder="San Francisco, CA / Bengaluru, India"
                  required
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              RECRUITER STEP 4: COMPLIANCE & LEGAL REGISTRATION
          ════════════════════════════════════════════════════════ */}
          {isRecruiter && currentStep === 4 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>CIN / GST / Corporate Tax ID *</label>
                <input 
                  className={styles.input} 
                  value={formData.cinOrGst} 
                  onChange={e => updateField('cinOrGst', e.target.value)} 
                  placeholder="e.g. U74140DL2015PTC288000"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Country of Incorporation *</label>
                <input 
                  className={styles.input} 
                  value={formData.country} 
                  onChange={e => updateField('country', e.target.value)} 
                  placeholder="e.g. United States, India"
                  required
                />
              </div>

              <div style={{ padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
                  <ShieldCheck size={18} /> Verified Employer Trust Authorization
                </div>
                <p style={{ fontSize: '0.813rem', color: '#047857', marginTop: '0.35rem', margin: 0 }}>
                  Your business credentials authorize your company to publish verified job openings, invite candidates to interview rounds, and manage recruitment pipelines.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              RECRUITER STEP 5: COMPANY CULTURE & MISSION OVERVIEW
          ════════════════════════════════════════════════════════ */}
          {isRecruiter && currentStep === 5 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Culture & Mission Overview *</label>
                <p style={{ fontSize: '0.813rem', color: '#64748b', marginTop: 0, marginBottom: '0.5rem' }}>
                  Summarize your engineering culture, perks, and vision for prospective candidates.
                </p>
                <textarea 
                  className={styles.textarea} 
                  style={{ minHeight: '160px' }} 
                  value={formData.companyDescription} 
                  onChange={e => updateField('companyDescription', e.target.value)} 
                  placeholder="Describe what makes your team unique..."
                  required
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 1: IDENTITY
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 1 && (
            <div>
              {/* Profile Photo */}
              <div className={styles.avatarSection}>
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fname || 'U')}+${encodeURIComponent(formData.lname || 'P')}&background=random`} 
                  alt="Avatar Preview" 
                  className={styles.avatarPreview}
                />
                <div className={styles.avatarActions}>
                  <div className={styles.avatarTitle}>Profile Photo</div>
                  <div className={styles.avatarDesc}>Supports PNG, JPG, or WEBP under 5MB.</div>
                  <div className={styles.btnRow}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      accept="image/png, image/jpeg, image/webp" 
                      style={{ display: 'none' }} 
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Image
                    </Button>
                    {formData.avatar && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleRemoveAvatar}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name *</label>
                  <input 
                    className={styles.input} 
                    value={formData.fname} 
                    onChange={e => updateField('fname', e.target.value)} 
                    placeholder="e.g. Aarav"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name *</label>
                  <input 
                    className={styles.input} 
                    value={formData.lname} 
                    onChange={e => updateField('lname', e.target.value)} 
                    placeholder="e.g. Sharma"
                    required
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Date of Birth</label>
                  <input 
                    type="date" 
                    className={styles.input} 
                    value={formData.dob} 
                    onChange={e => updateField('dob', e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <select 
                    className={styles.select} 
                    value={formData.gender} 
                    onChange={e => updateField('gender', e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nationality</label>
                <input 
                  className={styles.input} 
                  value={formData.nationality} 
                  onChange={e => updateField('nationality', e.target.value)} 
                  placeholder="e.g. United States"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 2: CONTACT
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 2 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Primary Phone Number *</label>
                <input 
                  type="tel" 
                  className={styles.input} 
                  value={formData.phone} 
                  onChange={e => updateField('phone', e.target.value)} 
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address / City</label>
                <input 
                  className={styles.input} 
                  value={formData.address} 
                  onChange={e => updateField('address', e.target.value)} 
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>State / Province / Region</label>
                <input 
                  className={styles.input} 
                  value={formData.state} 
                  onChange={e => updateField('state', e.target.value)} 
                  placeholder="e.g. California"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 3: PROFESSIONAL INFO
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 3 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Professional Headline *</label>
                <input 
                  className={styles.input} 
                  value={formData.professionalHeadline} 
                  onChange={e => updateField('professionalHeadline', e.target.value)} 
                  placeholder="e.g. Senior Frontend Engineer | React, TypeScript, Next.js"
                  required
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Experience Level</label>
                  <select 
                    className={styles.select} 
                    value={formData.experienceLevel} 
                    onChange={e => updateField('experienceLevel', e.target.value)}
                  >
                    <option value="fresher">Fresher / Graduate (0–1 yrs)</option>
                    <option value="experienced">Experienced Professional (1+ yrs)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Years of Experience</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={40} 
                    className={styles.input} 
                    value={formData.yearsOfExperience} 
                    onChange={e => updateField('yearsOfExperience', Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Career Objective / Bio</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.careerObjective} 
                  onChange={e => updateField('careerObjective', e.target.value)} 
                  placeholder="Share a brief overview of your technical focus, architectural passions, or hiring goals..."
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 4: EDUCATION
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 4 && (
            <div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Degree / Program</label>
                  <input 
                    className={styles.input} 
                    value={formData.education[0]?.degree || ""} 
                    onChange={e => {
                      const updated = [...formData.education];
                      updated[0] = { ...updated[0], degree: e.target.value };
                      setFormData(prev => ({ ...prev, education: updated }));
                    }} 
                    placeholder="e.g. B.S. in Computer Science"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Field of Study</label>
                  <input 
                    className={styles.input} 
                    value={formData.education[0]?.field || ""} 
                    onChange={e => {
                      const updated = [...formData.education];
                      updated[0] = { ...updated[0], field: e.target.value };
                      setFormData(prev => ({ ...prev, education: updated }));
                    }} 
                    placeholder="e.g. Software Engineering"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Institution / University</label>
                <input 
                  className={styles.input} 
                  value={formData.education[0]?.institution || ""} 
                  onChange={e => {
                    const updated = [...formData.education];
                    updated[0] = { ...updated[0], institution: e.target.value };
                    setFormData(prev => ({ ...prev, education: updated }));
                  }} 
                  placeholder="e.g. University of California, Berkeley"
                />
              </div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Graduation Year</label>
                  <input 
                    className={styles.input} 
                    value={formData.education[0]?.endYear || ""} 
                    onChange={e => {
                      const updated = [...formData.education];
                      updated[0] = { ...updated[0], endYear: e.target.value };
                      setFormData(prev => ({ ...prev, education: updated }));
                    }} 
                    placeholder="2024"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>GPA / Grade</label>
                  <input 
                    className={styles.input} 
                    value={formData.education[0]?.grade || ""} 
                    onChange={e => {
                      const updated = [...formData.education];
                      updated[0] = { ...updated[0], grade: e.target.value };
                      setFormData(prev => ({ ...prev, education: updated }));
                    }} 
                    placeholder="3.8 / 4.0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 5: SKILLS
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 5 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Technical Skills & Competencies</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    className={styles.input} 
                    value={newSkillInput} 
                    onChange={e => setNewSkillInput(e.target.value)} 
                    onKeyDown={handleAddSkill} 
                    placeholder="Type a skill and press Enter (e.g. React, Next.js, Docker, Python)"
                  />
                  <Button type="button" variant="outline" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>

                <div className={styles.chipGroup}>
                  {formData.skills.map((skill, i) => (
                    <span key={i} className={styles.chip}>
                      {skill}
                      <button 
                        type="button" 
                        className={styles.chipRemove} 
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '1.5rem', fontSize: '0.813rem', color: '#475569' }}>
                  <span style={{ fontWeight: 600 }}>Quick suggestions: </span>
                  {['React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'SQL', 'GraphQL', 'AWS', 'Tailwind CSS'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (!formData.skills.includes(s)) {
                          setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
                        }
                      }}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        borderRadius: '6px',
                        padding: '3px 9px',
                        margin: '0 4px 4px 0',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CANDIDATE STEP 6: WORK EXPERIENCE
          ════════════════════════════════════════════════════════ */}
          {!isRecruiter && currentStep === 6 && (
            <div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recent Role Title</label>
                  <input 
                    className={styles.input} 
                    value={formData.workExperience[0]?.title || ""} 
                    onChange={e => {
                      const updated = [...formData.workExperience];
                      updated[0] = { ...updated[0], title: e.target.value };
                      setFormData(prev => ({ ...prev, workExperience: updated }));
                    }} 
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company / Employer</label>
                  <input 
                    className={styles.input} 
                    value={formData.workExperience[0]?.company || ""} 
                    onChange={e => {
                      const updated = [...formData.workExperience];
                      updated[0] = { ...updated[0], company: e.target.value };
                      setFormData(prev => ({ ...prev, workExperience: updated }));
                    }} 
                    placeholder="e.g. Tech Solutions"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Key Technical Contributions</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.workExperience[0]?.description || ""} 
                  onChange={e => {
                    const updated = [...formData.workExperience];
                    updated[0] = { ...updated[0], description: e.target.value };
                    setFormData(prev => ({ ...prev, workExperience: updated }));
                  }} 
                  placeholder="Engineered scalable features, optimized performance, or collaborated with agile squads..."
                />
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 7: PROJECTS ── */}
          {!isRecruiter && currentStep === 7 && (
            <div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Key Project Title</label>
                  <input 
                    className={styles.input} 
                    value={formData.projects[0]?.title || ""} 
                    onChange={e => {
                      const updated = [...formData.projects];
                      updated[0] = { ...updated[0], title: e.target.value };
                      setFormData(prev => ({ ...prev, projects: updated }));
                    }} 
                    placeholder="e.g. Distributed Task Manager"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Live Demo or GitHub Link</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    value={formData.projects[0]?.link || ""} 
                    onChange={e => {
                      const updated = [...formData.projects];
                      updated[0] = { ...updated[0], link: e.target.value };
                      setFormData(prev => ({ ...prev, projects: updated }));
                    }} 
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Project Description & Architecture</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.projects[0]?.description || ""} 
                  onChange={e => {
                    const updated = [...formData.projects];
                    updated[0] = { ...updated[0], description: e.target.value };
                    setFormData(prev => ({ ...prev, projects: updated }));
                  }} 
                  placeholder="Architected a real-time collaborative workspace using WebSockets, React, and Redis..."
                />
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 8: CERTIFICATIONS ── */}
          {!isRecruiter && currentStep === 8 && (
            <div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Certification / Credential Title</label>
                  <input 
                    className={styles.input} 
                    value={formData.certifications[0]?.title || ""} 
                    onChange={e => {
                      const updated = [...formData.certifications];
                      updated[0] = { ...updated[0], title: e.target.value };
                      setFormData(prev => ({ ...prev, certifications: updated }));
                    }} 
                    placeholder="e.g. AWS Certified Solutions Architect"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Issuing Organization</label>
                  <input 
                    className={styles.input} 
                    value={formData.certifications[0]?.organization || ""} 
                    onChange={e => {
                      const updated = [...formData.certifications];
                      updated[0] = { ...updated[0], organization: e.target.value };
                      setFormData(prev => ({ ...prev, certifications: updated }));
                    }} 
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 9: RESUME ── */}
          {!isRecruiter && currentStep === 9 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Resume Content (Pasted or Uploaded)</label>
                <textarea 
                  className={styles.textarea} 
                  style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                  value={formData.resumeText} 
                  onChange={e => updateField('resumeText', e.target.value)} 
                  placeholder="Paste your plain-text resume here or enter your experience highlights. You can also upload a PDF/DOCX file in Resume AI Studio after onboarding."
                />
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 10: PREFERENCES ── */}
          {!isRecruiter && currentStep === 10 && (
            <div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Expected Minimum Salary ($)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={formData.jobPreferences.salaryMin} 
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        jobPreferences: { ...prev.jobPreferences, salaryMin: Number(e.target.value) }
                      }));
                    }} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Notice Period</label>
                  <select 
                    className={styles.select} 
                    value={formData.jobPreferences.noticePeriod} 
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        jobPreferences: { ...prev.jobPreferences, noticePeriod: e.target.value }
                      }));
                    }}
                  >
                    <option value="Immediate">Immediate Availability</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60+ Days">60+ Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer Navigation ── */}
          <div className={styles.actionFooter}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 1 || isSaving}
            >
              <ArrowLeft size={16} /> Back
            </Button>

            <Button 
              type="button" 
              variant="primary" 
              onClick={handleNext} 
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : currentStep === steps.length ? "Finish & Go to Dashboard" : "Save & Continue"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
