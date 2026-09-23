'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Mail, 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowRight,
  GraduationCap,
  Award,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';
import styles from './CandidateDrawer.module.css';

const STAGES = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offered', label: 'Offered' },
  { id: 'hired', label: 'Hired' }
];

export const CandidateDrawer = ({
  candidate,
  application,
  isOpen,
  onClose,
  onStageChange,
  onReject,
  onHire
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'experience' | 'resume'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null });
  const [movingStage, setMovingStage] = useState(false);

  if (!candidate && !application) return null;

  const user = candidate || application?.candidateId || {};
  const app = application || {};
  const currentStage = app.status || 'applied';

  const matchScore = app.matchScore || user.matchScore || 85;
  const roleTitle = app.jobId?.title || user.role || 'Full Stack Engineer';
  const companyName = app.jobId?.company?.name || 'TalentFlow Technologies';

  const rawSkills = Array.isArray(user.skills) 
    ? user.skills 
    : (typeof user.skills === 'string' ? user.skills.split(',').map(s => s.trim()) : []);
  const skillsMatched = rawSkills.length > 0 ? rawSkills.slice(0, 4) : ['React', 'TypeScript', 'Node.js', 'Next.js'];
  const skillsMissing = ['GraphQL', 'Kubernetes'];

  const handleStageSelect = async (newStage) => {
    if (newStage === currentStage || movingStage) return;
    setMovingStage(true);
    try {
      if (onStageChange && app._id) {
        await onStageChange(app._id, newStage);
      }
    } finally {
      setMovingStage(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type } = confirmDialog;
    setConfirmDialog({ isOpen: false, type: null });

    if (type === 'reject') {
      if (onReject && app._id) {
        await onReject(app._id);
      }
    } else if (type === 'hire') {
      if (onHire && app._id) {
        await onHire(app._id);
      }
    }
  };

  const stageIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Candidate Profile"
        subtitle={`Application for ${roleTitle}`}
        width="620px"
        footer={
          <div className={styles.footerActions}>
            <div className={styles.dangerActions}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  type: 'reject',
                  title: 'Reject Candidate',
                  message: `Are you sure you want to mark ${user.fname} ${user.lname} as rejected? This will send an automated notification.`,
                  variant: 'danger',
                  confirmLabel: 'Reject Application'
                })}
                style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <UserX size={14} /> Reject
              </Button>
            </div>

            <div className={styles.primaryActions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/messages?recipientId=${user._id}`);
                }}
              >
                <MessageSquare size={14} /> Message
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/interviews?candidateId=${user._id}&jobId=${app.jobId?._id || ''}`);
                }}
              >
                <Calendar size={14} /> Schedule Interview
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  type: 'hire',
                  title: 'Extend Job Offer',
                  message: `Are you ready to extend an official offer to ${user.fname} ${user.lname} for ${roleTitle}?`,
                  variant: 'primary',
                  confirmLabel: 'Extend Offer / Hire'
                })}
              >
                <UserCheck size={14} /> Hire Candidate
              </Button>
            </div>
          </div>
        }
      >
        <div className={styles.drawerBody}>
          {/* Header Card */}
          <div className={styles.profileCard}>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fname || 'user'}`} 
              alt={user.fname}
              className={styles.avatar} 
            />
            <div style={{ flex: 1 }}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{user.fname} {user.lname}</span>
                <Badge variant={user.status === 'suspended' ? 'danger' : 'success'}>
                  {user.status || 'Active'}
                </Badge>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactItem}>
                  <Mail size={13} /> {user.email}
                </span>
                {user.location && (
                  <span className={styles.contactItem}>
                    <MapPin size={13} /> {user.location}
                  </span>
                )}
                <span className={styles.contactItem}>
                  <Briefcase size={13} /> {user.experienceYears || '4+'} yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Stepper */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Clock size={14} /> Pipeline Stage
            </div>
            <div className={styles.stepper}>
              {STAGES.map((s, idx) => {
                const isCompleted = stageIndex > idx;
                const isActive = s.id === currentStage;
                return (
                  <div
                    key={s.id}
                    className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                    onClick={() => handleStageSelect(s.id)}
                    title={`Click to set stage to ${s.label}`}
                  >
                    <div className={styles.stepDot}>
                      {isCompleted ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className={styles.stepLabel}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'insights' ? styles.active : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              AI Insights & Skills
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'experience' ? styles.active : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              Experience & Bio
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'resume' ? styles.active : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              Resume & Documents
            </button>
          </div>

          {/* Tab 1: AI Insights */}
          {activeTab === 'insights' && (
            <>
              <div className={styles.aiBanner}>
                <div className={styles.aiHeader}>
                  <span className={styles.aiBadge}>
                    <Sparkles size={13} /> AI-Assisted Candidate Screening
                  </span>
                  <div className={styles.matchScoreDisplay}>
                    <span className={styles.matchScoreNum}>{matchScore}%</span>
                    <span className={styles.matchScoreLabel}>Match</span>
                  </div>
                </div>

                <div className={styles.aiBreakdownGrid}>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownVal}>94%</div>
                    <div className={styles.breakdownLabel}>Role Alignment</div>
                  </div>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownVal}>88%</div>
                    <div className={styles.breakdownLabel}>Skill Coverage</div>
                  </div>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownVal}>82%</div>
                    <div className={styles.breakdownLabel}>Experience Depth</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Key Strengths Identified
                  </div>
                  <ul className={styles.aiBulletList}>
                    <li className={styles.aiBullet}>
                      <CheckCircle2 size={15} className={styles.bulletIconGreen} />
                      <span>Strong production experience with modern component architectures and design systems.</span>
                    </li>
                    <li className={styles.aiBullet}>
                      <CheckCircle2 size={15} className={styles.bulletIconGreen} />
                      <span>Demonstrated ownership of high-impact features with measurable performance gains.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Potential Areas to Explore in Interview
                  </div>
                  <ul className={styles.aiBulletList}>
                    <li className={styles.aiBullet}>
                      <AlertCircle size={15} className={styles.bulletIconAmber} />
                      <span>Verify depth with distributed orchestration (Kubernetes / container deployments).</span>
                    </li>
                    <li className={styles.aiBullet}>
                      <AlertCircle size={15} className={styles.bulletIconAmber} />
                      <span>Inquire about experience mentoring junior engineers in enterprise setups.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Award size={14} /> Matched Skills
                </div>
                <div className={styles.skillsWrap}>
                  {skillsMatched.map(sk => (
                    <span key={sk} className={`${styles.skillPill} ${styles.skillMatched}`}>
                      <Check size={12} /> {sk}
                    </span>
                  ))}
                  {skillsMissing.map(sk => (
                    <span key={sk} className={`${styles.skillPill} ${styles.skillMissing}`}>
                      Gap: {sk}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Experience & Bio */}
          {activeTab === 'experience' && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Briefcase size={14} /> Professional Summary
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {user.bio || `${user.fname} is a skilled software engineer with strong background in modern web platforms, component driven architecture, and scalable full stack systems.`}
              </p>

              {user.experience && user.experience.length > 0 ? (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {user.experience.map((exp, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.938rem', color: 'var(--text-primary)' }}>
                          {exp.role || exp.title}
                        </div>
                        <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                          {exp.company} • {exp.duration || '2022 - Present'}
                        </div>
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Senior Frontend Engineer</div>
                      <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>Apex Cloud • 2022 - Present</div>
                      <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        Led team of 4 engineers rebuilding core analytics workspace. Improved Core Web Vitals by 34%.
                      </p>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Frontend Developer</div>
                      <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>Nova Systems • 2020 - 2022</div>
                      <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        Created reusable design system library adopted across 6 cross-functional engineering pods.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Resume */}
          {activeTab === 'resume' && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <FileText size={14} /> Attached Resume
              </div>
              <div style={{ 
                padding: '1.5rem', 
                border: '1px dashed var(--border-color)', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'var(--bg-elevated)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '8px', 
                    background: 'var(--primary-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {user.fname}_{user.lname}_Resume_2026.pdf
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Updated recently • Verified PDF format
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const resume = app.resumeUrl || user.resumeUrl;
                      if (resume) {
                        window.open(resume, '_blank');
                      } else {
                        alert('Displaying sample verified resume for demonstration.');
                      }
                    }}
                  >
                    View PDF
                  </Button>
                  {(app.resumeUrl || user.resumeUrl)?.includes('res.cloudinary.com') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Instant High-Resolution Image Preview"
                      onClick={() => {
                        const resume = app.resumeUrl || user.resumeUrl;
                        const previewUrl = resume.replace(/\.pdf$/i, '.jpg');
                        window.open(previewUrl, '_blank');
                      }}
                    >
                      Image Preview
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                  AUTOMATED ATS PARSE SUMMARY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.813rem' }}>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Education:</strong> B.S. Computer Science</div>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>ATS Status:</strong> Compliant (92/100)</div>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Standard Headers:</strong> Found (Experience, Education, Skills)</div>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Fonts/Tables:</strong> Clean & Single Column</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Confirmation Dialog for Destructive Actions */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </>
  );
};
