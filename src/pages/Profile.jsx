import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { User, Mail, Shield, Camera, Save, LogOut, CheckCircle, AlertCircle, FilePlus, Phone, Calendar, Briefcase, X, Plus, Zap, Search } from "lucide-react";
import styles from "./Profile.module.css";
import { cn } from "../lib/utils";

export default function Profile() {
  const { user, logout } = useAuth();
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    bio: user?.bio || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
    phone: user?.phone || "",
    experienceLevel: user?.experienceLevel || "fresher",
    yearsOfExperience: user?.yearsOfExperience || 0,
    password: ""
  });
  
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [resumeFile, setResumeFile] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New states for OTP, Skills, and ATS
  const [otpFlow, setOtpFlow] = useState({
    email: { sent: false, code: "", loading: false },
    phone: { sent: false, code: "", loading: false }
  });
  const [skills, setSkills] = useState(user?.skills || ["React", "JavaScript", "CSS3", "Git"]);
  const [atsScore, setAtsScore] = useState(user?.atsScore || 0);
  const [isScanning, setIsScanning] = useState(false);
  
  const skillSuggestions = ["TypeScript", "Node.js", "Python", "Docker", "AWS", "SQL", "MongoDB", "Redux", "GraphQL"];

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
    // Mimic deep scanning process
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75;
      setAtsScore(randomScore);
      setIsScanning(false);
      alert(`Resume analysis complete! ATS Score: ${randomScore}/100. Based on our analysis, we recommend highlighting your project achievements more clearly.`);
    }, 2500);
  };

  const handleSendOTP = async (type) => {
    setOtpFlow(prev => ({ ...prev, [type]: { ...prev[type], loading: true } }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpFlow(prev => ({ ...prev, [type]: { ...prev[type], sent: true, loading: false } }));
      alert(`A 6-digit verification code has been sent to your ${type === 'email' ? 'email address' : 'mobile number'}. (Simulated code: 123456)`);
    } catch (err) {
      alert("Failed to send OTP.");
      setOtpFlow(prev => ({ ...prev, [type]: { ...prev[type], loading: false } }));
    }
  };

  const handleVerifyOTP = async (type) => {
    if (otpFlow[type].code !== "123456") return alert("Invalid verification code. Please try again.");
    
    setIsLoading(true);
    try {
      // Simulate verification update
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      window.location.reload(); // Refresh to show verified state
    } catch (err) {
      alert("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
    });
    
    if (newAvatarFile) data.append('avatar', newAvatarFile);
    if (resumeFile) data.append('resume', resumeFile);
    data.append('skills', JSON.stringify(skills));
    data.append('atsScore', atsScore);

    try {
      await api.put("/auth/profile", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsEditing(false);
      alert("Professional identity updated successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
        case 'hired': return styles.statusHired;
        case 'rejected': return styles.statusRejected;
        case 'interviewing': return styles.statusInterviewing;
        default: return styles.statusPending;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="text-gradient">Professional Identity</h1>
        <p>Manage your professional persona and recruitment assets.</p>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <Card className={styles.avatarCard} premium glow>
            <div className={styles.avatarWrapper}>
              <img src={avatarPreview} alt="Profile" className={styles.avatar} />
              <button className={styles.cameraBtn} onClick={() => avatarInputRef.current.click()}><Camera size={16} /></button>
              <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
            </div>
            <h3 className={styles.userName}>{user?.fname} {user?.lname}</h3>
            <span className={styles.userRole}>{user?.role?.toUpperCase()}</span>
            <div className={styles.badgeRow}>
               <Shield size={14} /> {user?.isEmailVerified && user?.isPhoneVerified ? 'Verified Talent' : 'Identity Pending'}
            </div>
          </Card>
          
          <Card className={styles.statsCard} premium>
             <div className={styles.statLine}>
                <span>Since</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong>
             </div>
             <div className={styles.statLine}>
                <span>Recruitment Status</span>
                <strong className={getStatusClass(user?.hiringStatus)}>
                    {(user?.hiringStatus || 'pending').toUpperCase()}
                </strong>
             </div>
             <div className={styles.statLine}>
                <span>Identity Score</span>
                <strong style={{ color: 'var(--primary)' }}>92/100</strong>
             </div>
             {atsScore > 0 && (
                <div className={styles.statLine}>
                    <span>ATS Resume Score</span>
                    <strong style={{ color: 'var(--success)' }}>{atsScore}/100</strong>
                </div>
             )}
          </Card>

          {isScanning && (
            <div className={cn(styles.atsScore, "animate-fade-in")}>
               <LoadingSpinner label="Decoding Resume Structure..." />
               <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary)' }}>Calculating semantic match...</p>
            </div>
          )}

          <Button variant="secondary" icon={LogOut} onClick={logout} style={{ width: '100%', marginTop: '0.5rem', color: 'var(--danger)' }}>
            Sign Out
          </Button>
        </aside>

        <main className={styles.main}>
          <Card premium>
            <div className={styles.formHeader}>
               <h2>General Information</h2>
               {!isEditing && (
                 <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
               )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
               <div className={styles.grid}>
                  <Input 
                    label="First Name" 
                    value={formData.fname} 
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, fname: e.target.value})}
                  />
                  <Input 
                    label="Last Name" 
                    value={formData.lname} 
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  />
               </div>
               
               <div className={styles.grid}>
                <div className={styles.inputWithBadge}>
                    <Input 
                        label="Email Address" 
                        icon={Mail} 
                        value={formData.email} 
                        disabled={true}
                    />
                    <div 
                      className={cn(styles.verifyBadge, user?.isEmailVerified ? styles.verified : styles.unverified)}
                      onClick={() => !user?.isEmailVerified && !otpFlow.email.sent && handleSendOTP('email')}
                    >
                        {user?.isEmailVerified ? <><CheckCircle size={10} /> Verified</> : otpFlow.email.sent ? "Verifying..." : "Verify"}
                    </div>
                    {otpFlow.email.sent && (
                      <div className={styles.otpContainer}>
                        <Input 
                          placeholder="Code" 
                          className={styles.otpInput} 
                          value={otpFlow.email.code}
                          onChange={(e) => setOtpFlow({...otpFlow, email: {...otpFlow.email, code: e.target.value}})}
                        />
                        <Button size="sm" onClick={() => handleVerifyOTP('email')}>Submit</Button>
                      </div>
                    )}
                </div>
                <div className={styles.inputWithBadge}>
                    <Input 
                        label="Phone Number" 
                        icon={Phone} 
                        value={formData.phone} 
                        disabled={!isEditing}
                        placeholder="+91 00000 00000"
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <div 
                      className={cn(styles.verifyBadge, user?.isPhoneVerified ? styles.verified : styles.unverified)}
                      onClick={() => !user?.isPhoneVerified && !otpFlow.phone.sent && handleSendOTP('phone')}
                    >
                        {user?.isPhoneVerified ? <><CheckCircle size={10} /> Verified</> : otpFlow.phone.sent ? "Verifying..." : "Verify"}
                    </div>
                    {otpFlow.phone.sent && (
                      <div className={styles.otpContainer}>
                        <Input 
                          placeholder="Code" 
                          className={styles.otpInput} 
                          value={otpFlow.phone.code}
                          onChange={(e) => setOtpFlow({...otpFlow, phone: {...otpFlow.phone, code: e.target.value}})}
                        />
                        <Button size="sm" onClick={() => handleVerifyOTP('phone')}>Submit</Button>
                      </div>
                    )}
                </div>
               </div>

               <div className={styles.grid}>
                  <div className={styles.bioGroup}>
                      <label>Date of Birth</label>
                      <div className={styles.dobWrapper}>
                        <input 
                            type="date"
                            className={cn(styles.textarea, styles.dobInput)}
                            value={formData.dob} 
                            disabled={!isEditing}
                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        />
                        <Calendar size={18} className={styles.dobIcon} />
                      </div>
                  </div>
                  <Input 
                    label="Portfolio / Web URL" 
                    icon={Shield} 
                    placeholder="https://yourportfolio.com"
                    disabled={!isEditing}
                  />
               </div>

               <div className={styles.bioGroup}>
                  <label>Professional Summary</label>
                  <textarea 
                    value={formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Briefly describe your career goals and expertise..."
                    className={styles.textarea}
                  />
               </div>

               <div className={styles.skillsSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Skills & Expertise</h3>
                    <p>Highlight your technical toolkit and domain expertise.</p>
                  </div>
                  <div className={styles.skillTags}>
                    {skills.map(skill => (
                      <div key={skill} className={styles.skillTag}>
                        {skill}
                        {isEditing && <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />}
                      </div>
                    ))}
                    {isEditing && (
                      <div className={styles.skillTag} style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
                        <Plus size={14} /> Add Skill
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className={styles.suggestionHeader}>Recommended for you</div>
                      <div className={styles.suggestionTags}>
                        {skillSuggestions.map(s => (
                          <div key={s} className={styles.suggestionTag} onClick={() => addSkill(s)}>
                             + {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>

               <div className={styles.sectionHeader} style={{ marginTop: '1rem' }}>
                  <h3>Talent Assets & Experience</h3>
                  <p>Provide your resume and detail your professional background.</p>
               </div>

               <div className={styles.grid}>
                  <div 
                    className={cn(styles.uploadZone, isScanning && styles.uploadZoneActive)} 
                    onClick={() => isEditing && !isScanning && resumeInputRef.current.click()}
                  >
                     <div className={styles.uploadIcon}>
                        {isScanning ? <Zap size={24} className="text-primary animate-pulse" /> : (resumeFile || user?.resume ? <CheckCircle size={24} className="text-success" /> : <FilePlus size={24} />)}
                     </div>
                     <div>
                        <strong>{isScanning ? "Scanning Profile..." : resumeFile ? resumeFile.name : user?.resume ? "Resume_Updated.pdf" : "Upload PDF Resume"}</strong>
                        <p>{isScanning ? "Extracting ATS data points..." : "Format: PDF only (Max 5MB)"}</p>
                     </div>
                     <input type="file" ref={resumeInputRef} hidden accept=".pdf" onChange={handleResumeSelect} />
                  </div>

                  <div className={styles.expContent}>
                     <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Experience Level</label>
                     <div className={styles.expLevelContainer}>
                        <div 
                           className={cn(styles.expCard, formData.experienceLevel === 'fresher' && styles.expCardActive)}
                           onClick={() => isEditing && setFormData({...formData, experienceLevel: 'fresher', yearsOfExperience: 0})}
                        >
                           <div className={styles.radioCircle} />
                           <div className={styles.expContent}>
                               <strong>Fresher</strong>
                               <span>Student/Junior</span>
                           </div>
                        </div>
                        <div 
                           className={cn(styles.expCard, formData.experienceLevel === 'experienced' && styles.expCardActive)}
                           onClick={() => isEditing && setFormData({...formData, experienceLevel: 'experienced'})}
                        >
                           <div className={styles.radioCircle} />
                           <div className={styles.expContent}>
                               <strong>Experienced</strong>
                               <span>Professional</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {formData.experienceLevel === 'experienced' && (
                  <div className="animate-fade-in">
                    <Input 
                        label="Years of Experience" 
                        type="number"
                        icon={Briefcase}
                        value={formData.yearsOfExperience} 
                        disabled={!isEditing}
                        min="0"
                        onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                    />
                  </div>
               )}

               {isEditing && (
                  <div className={styles.footerActions}>
                     <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                     <Button type="submit" disabled={isLoading || isScanning}>
                        {isLoading ? "Synchronizing..." : <><Save size={18} /> Update Professional Identity</>}
                     </Button>
                  </div>
               )}
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
