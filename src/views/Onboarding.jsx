'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Phone, Briefcase, GraduationCap, Code2, 
  Building2, FolderGit2, Award, FileText, Settings, 
  Check, ArrowRight, ArrowLeft, Upload, Trash2, LogOut,
  ShieldCheck, Sparkles, AlertCircle
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
  { id: 1, name: "Identity", icon: User, desc: "Recruiter identity and photo" },
  { id: 2, name: "Contact", icon: Phone, desc: "Direct phone and contact address" },
  { id: 3, name: "Professional Info", icon: Briefcase, desc: "Recruiter experience and department" },
  { id: 4, name: "Company", icon: Building2, desc: "Employer organization details" },
  { id: 5, name: "Preferences", icon: Settings, desc: "Hiring domains and headcount targets" },
  { id: 6, name: "Verification", icon: ShieldCheck, desc: "Business credentials and compliance" }
];

export default function Onboarding() {
  const { user, logout } = useAuth();
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
    companyWebsite: "",
    companySize: "51-200 employees",
    companyIndustry: "Software & Technology",
    companyLocation: "",
    taxId: ""
  });

  const [newSkillInput, setNewSkillInput] = useState("");
  const fileInputRef = useRef(null);

  // Initialize with user profile if already present
  useEffect(() => {
    if (user) {
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
        skills: user.skills?.length > 0 ? user.skills : prev.skills
      }));
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
    } else if (isRecruiter && stepNumber === 4) {
      if (!formData.companyName.trim()) {
        setError("Company name is required for recruitment verification.");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    try {
      // Autosave current progress to profile API
      await api.put('/auth/profile', formData);
      
      setCompletedSteps(prev => new Set(prev).add(currentStep));

      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Final Step: Complete Onboarding!
        const { data } = await api.post('/auth/complete-onboarding');
        if (data.user) {
          localStorage.setItem("rms_user", JSON.stringify(data.user));
        }
        router.push('/dashboard');
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
            <div className={styles.brandText}>TalentFlow <span style={{ color: '#818cf8' }}>AI</span></div>
          </div>

          <div className={styles.completionCard}>
            <div className={styles.completionHeader}>
              <span>Profile Setup</span>
              <span style={{ color: '#818cf8' }}>{Math.min(100, completionPct)}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${Math.min(100, completionPct)}%` }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem' }}>
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
            <span style={{ fontSize: '0.813rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isRecruiter ? 'Recruiter Onboarding' : 'Candidate Onboarding'}
            </span>
          </div>
          <span style={{ fontSize: '0.813rem', color: '#94a3b8' }}>
            {user?.email}
          </span>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>{steps[currentStep - 1]?.name}</h2>
            <p className={styles.stepDesc}>{steps[currentStep - 1]?.desc}</p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* ── STEP 1: IDENTITY ── */}
          {currentStep === 1 && (
            <div>
              {/* Profile Photo */}
              <div className={styles.avatarSection}>
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fname || 'U')}+${encodeURIComponent(formData.lname || 'P')}&background=random`} 
                  alt="Avatar Preview" 
                  className={styles.avatarPreview}
                />
                <div className={styles.avatarActions}>
                  <div style={{ fontWeight: 600, fontSize: '0.938rem' }}>Profile Photo</div>
                  <div style={{ fontSize: '0.813rem', color: '#94a3b8' }}>Supports PNG, JPG, or WEBP under 5MB.</div>
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

          {/* ── STEP 2: CONTACT ── */}
          {currentStep === 2 && (
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

          {/* ── STEP 3: PROFESSIONAL INFO ── */}
          {currentStep === 3 && (
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

          {/* ── CANDIDATE STEP 4: EDUCATION ── */}
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

          {/* ── RECRUITER STEP 4: COMPANY ── */}
          {isRecruiter && currentStep === 4 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company / Organization Name *</label>
                <input 
                  className={styles.input} 
                  value={formData.companyName} 
                  onChange={e => updateField('companyName', e.target.value)} 
                  placeholder="e.g. Nova Systems Inc."
                  required
                />
              </div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company Website</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    value={formData.companyWebsite} 
                    onChange={e => updateField('companyWebsite', e.target.value)} 
                    placeholder="https://novasystems.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company Size</label>
                  <select 
                    className={styles.select} 
                    value={formData.companySize} 
                    onChange={e => updateField('companySize', e.target.value)}
                  >
                    <option value="1-10 employees">1–10 employees (Startup)</option>
                    <option value="11-50 employees">11–50 employees (Growth)</option>
                    <option value="51-200 employees">51–200 employees (Scale-up)</option>
                    <option value="201-1000 employees">201–1000 employees (Mid-Enterprise)</option>
                    <option value="1000+ employees">1000+ employees (Global Enterprise)</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Headquarters Location</label>
                <input 
                  className={styles.input} 
                  value={formData.companyLocation} 
                  onChange={e => updateField('companyLocation', e.target.value)} 
                  placeholder="e.g. San Francisco, CA & Remote"
                />
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 5: SKILLS ── */}
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

                <div style={{ marginTop: '1.5rem', fontSize: '0.813rem', color: '#94a3b8' }}>
                  <span>Quick suggestions: </span>
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
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cbd5e1',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        margin: '0 4px 4px 0',
                        fontSize: '0.75rem',
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

          {/* ── RECRUITER STEP 5: PREFERENCES ── */}
          {isRecruiter && currentStep === 5 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Hiring Departments</label>
                <input 
                  className={styles.input} 
                  value="Frontend, Backend, Full Stack, DevOps" 
                  readOnly 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expected Quarterly Open Headcount</label>
                <select className={styles.select}>
                  <option>1–3 roles</option>
                  <option>4–10 roles</option>
                  <option>10+ roles</option>
                </select>
              </div>
            </div>
          )}

          {/* ── CANDIDATE STEP 6: WORK EXPERIENCE ── */}
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

          {/* ── RECRUITER STEP 6: VERIFICATION ── */}
          {isRecruiter && currentStep === 6 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Corporate Tax / CIN Registration ID</label>
                <input 
                  className={styles.input} 
                  value={formData.taxId} 
                  onChange={e => updateField('taxId', e.target.value)} 
                  placeholder="e.g. US-EIN-98-7654321"
                />
              </div>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600 }}>
                  <ShieldCheck size={18} /> Ready for Verified Employer Review
                </div>
                <p style={{ fontSize: '0.813rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Upon completion, your profile will be authorized to publish verified listings and invite candidates to interview rounds.
                </p>
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
