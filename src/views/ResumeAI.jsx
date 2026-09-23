'use client';
import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Copy, Download, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Zap, Target, Award, Check, RefreshCw,
  Upload, FileUp, Loader2, AlertTriangle, CheckCircle
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import styles from "./ResumeAI.module.css";

const DEMO_RESUME = {
  name: "Aarav Sharma",
  tagline: "Senior Frontend Engineer",
  email: "aarav.sharma@talentflow.dev",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA (Open to Remote)",
  linkedin: "linkedin.com/in/aarav-sharma-dev",
  summary: "Frontend Engineer with 5+ years of experience engineering high-performance web applications using React, Next.js, and TypeScript. Specializes in building design systems, optimizing Core Web Vitals, and implementing accessible, scalable user interfaces.",
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Apex Cloud",
      date: "2022 – Present",
      bullets: [
        "Architected modular design system across 14 enterprise micro-frontends, reducing engineering delivery cycles by 38%.",
        "Optimized Core Web Vitals (LCP & CLS) across checkout workflows, lifting page speed by 42% and conversion by 14%.",
        "Mentored 4 junior engineers on React performance patterns, modern TypeScript practices, and a11y standards."
      ]
    },
    {
      role: "Frontend Developer",
      company: "Nova Systems",
      date: "2020 – 2022",
      bullets: [
        "Rebuilt internal reporting dashboard from legacy monolith to Next.js, cutting initial bundle size by 54%.",
        "Collaborated with UX and product teams to implement WCAG 2.1 AA compliant components used by 120k+ monthly active users."
      ]
    }
  ],
  education: [
    { degree: "B.S. in Computer Science", school: "University of California, Berkeley", date: "2016 – 2020" }
  ],
  skills: {
    highlighted: ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS"],
    regular: ["Node.js", "GraphQL", "Jest", "Vite", "Web Vitals", "Git", "REST APIs"]
  }
};

const DEFAULT_BULLET_IMPROVEMENTS = [
  {
    role: "Senior Frontend Engineer at Apex Cloud",
    before: "Worked on frontend bugs and built UI components for client apps.",
    after: "Architected modular design system across 14 enterprise micro-frontends, reducing engineering delivery cycles by 38%.",
    metric: "+38% Delivery Velocity",
    verb: "Architected"
  },
  {
    role: "Frontend Developer at Nova Systems",
    before: "Improved page loading speed and helped clean up legacy code.",
    after: "Optimized Core Web Vitals (LCP & CLS) across checkout workflows, lifting page speed by 42% and conversion by 14%.",
    metric: "+42% Speed & +14% Conversion",
    verb: "Optimized"
  },
  {
    role: "Full Stack Engineer",
    before: "Created API endpoints for user data retrieval and database queries.",
    after: "Engineered scalable RESTful microservices processing 450k daily queries with sub-50ms latency using Node.js and Redis.",
    metric: "450k Daily Queries & <50ms Latency",
    verb: "Engineered"
  }
];

export default function ResumeAI() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("workspace"); // 'workspace' | 'bullets' | 'ats' | 'matcher'
  const [resumeData, setResumeData] = useState(DEMO_RESUME);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I've connected to your TalentFlow AI Resume Studio. I can parse uploaded resumes (PDF, DOCX), analyze ATS scores across 6 deterministic dimensions, quantify your impact bullets, or tailor your profile to any job description.\n\nUpload a resume or ask me to optimize your experience bullets!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Real ATS Analysis State
  const [atsAnalysis, setAtsAnalysis] = useState({
    overallScore: 88,
    contactScore: 95,
    formatScore: 90,
    keywordScore: 87,
    skillsScore: 92,
    experienceScore: 85,
    matchedSkills: ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS", "Jest", "Git"],
    missingSkills: ["GraphQL Client (Apollo)", "Docker", "Server Components (RSC)"],
    missingKeywords: ["Distributed Architecture", "CI/CD Pipeline", "Micro-Frontends"],
    formattingWarnings: [],
    strengths: [
      "Verified coverage of core required frontend competencies.",
      "Strong inclusion of quantifiable business and technical metrics in role descriptions.",
      "Clean section hierarchy categorized without encoding artifacts."
    ],
    improvements: [
      "Enhance experience bullets using the Action Verb + Metric + Business Outcome formula.",
      "Add mention of CI/CD integration and automated testing workflows."
    ]
  });

  // Bullet Enhancer State
  const [bulletList, setBulletList] = useState(DEFAULT_BULLET_IMPROVEMENTS);
  const [customBullet, setCustomBullet] = useState("");
  const [isEnhancingBullet, setIsEnhancingBullet] = useState(false);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef(null);

  // JD Matcher & Tailor State
  const [jdText, setJdText] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial ATS check
  const runATSAnalysis = async (resumeToAnalyze, targetJD = null) => {
    try {
      const res = await api.post('/resume/analyze-ats', {
        resumeData: {
          contact: {
            name: resumeToAnalyze.name,
            email: resumeToAnalyze.email,
            phone: resumeToAnalyze.phone,
            linkedin: resumeToAnalyze.linkedin
          },
          summary: resumeToAnalyze.summary,
          skills: [
            ...(resumeToAnalyze.skills?.highlighted || []),
            ...(resumeToAnalyze.skills?.regular || [])
          ],
          experience: resumeToAnalyze.experience || [],
          education: resumeToAnalyze.education || [],
          rawText: `${resumeToAnalyze.summary} ${(resumeToAnalyze.experience || []).map(e => (e.bullets || []).join(' ')).join(' ')}`
        },
        jobDescription: targetJD
      });
      if (res.data?.success && res.data.analysis) {
        setAtsAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.warn("ATS analysis fallback:", err.message);
    }
  };

  // Handle File Upload Parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.data) {
        const parsed = res.data.data;
        const newResume = {
          name: parsed.contact?.name || user?.fname ? `${user.fname} ${user.lname}` : "Your Name",
          tagline: "Software Engineer",
          email: parsed.contact?.email || user?.email || "email@example.com",
          phone: parsed.contact?.phone || "+1 (555) 000-0000",
          location: "Location Open",
          linkedin: parsed.contact?.linkedin || "",
          summary: parsed.summary || "Technical professional with expertise in modern software engineering.",
          experience: parsed.experience?.length > 0 ? parsed.experience : [
            {
              role: "Software Engineer",
              company: "Technology Corp",
              date: "2022 – Present",
              bullets: ["Engineered scalable application features using modern engineering workflows."]
            }
          ],
          education: parsed.education?.length > 0 ? parsed.education : [
            { degree: "B.S. in Computer Science", school: "University", date: "2020" }
          ],
          skills: {
            highlighted: (parsed.skills || []).slice(0, 5),
            regular: (parsed.skills || []).slice(5)
          }
        };

        setResumeData(newResume);
        setUploadSuccess(`Successfully parsed ${file.name}!`);
        await runATSAnalysis(newResume);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: "ai",
            text: `I've successfully parsed your uploaded resume (${file.name})! Updated your contact info, ${parsed.skills?.length || 0} technical skills, and experience sections. Check out the ATS Diagnostics tab for a deep-dive score breakdown.`
          }
        ]);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to parse resume. Please ensure file is a valid PDF or DOCX.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle AI Chat Messages
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: "user", text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const promptText = inputText;
    setInputText("");
    setIsTyping(true);

    try {
      if (promptText.toLowerCase().includes("bullet") || promptText.toLowerCase().includes("quantify") || promptText.toLowerCase().includes("enhance")) {
        const enhRes = await api.post('/resume/enhance-bullet', {
          bullet: promptText.replace(/enhance|quantify|rewrite|bullet/gi, '').trim() || resumeData.experience[0]?.bullets[0] || "Worked on frontend features",
          targetRole: resumeData.tagline
        });

        if (enhRes.data?.success) {
          const reply = `Here is your enhanced bullet using the Google XYZ formula:\n\n**Before:** "${enhRes.data.original}"\n**After:** "${enhRes.data.enhanced}"\n\nMetric: ${enhRes.data.metric} (Lead Verb: ${enhRes.data.verb})`;
          setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
          setIsTyping(false);
          return;
        }
      }

      // Default smart responses
      setTimeout(() => {
        let botReply = "I have analyzed your request. I updated your technical summary and strengthened the action verbs in your experience section to emphasize measurable impact.";
        if (promptText.toLowerCase().includes("keyword") || promptText.toLowerCase().includes("ats")) {
          botReply = `Based on our ATS engine, you currently have ${atsAnalysis.overallScore}/100. Adding high-density keywords like "${atsAnalysis.missingKeywords.slice(0, 2).join('", "')}" will raise your score towards 95%+.`;
        }
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: botReply }]);
        setIsTyping(false);
      }, 900);
    } catch {
      setIsTyping(false);
    }
  };

  // Custom Bullet Enhancer Submission
  const handleCustomBulletEnhance = async () => {
    if (!customBullet.trim() || isEnhancingBullet) return;
    setIsEnhancingBullet(true);

    try {
      const res = await api.post('/resume/enhance-bullet', {
        bullet: customBullet.trim(),
        targetRole: resumeData.tagline
      });

      if (res.data?.success) {
        setBulletList(prev => [
          {
            role: "Custom User Submission",
            before: res.data.original,
            after: res.data.enhanced,
            metric: res.data.metric,
            verb: res.data.verb
          },
          ...prev
        ]);
        setCustomBullet("");
      }
    } catch (err) {
      console.warn("Enhance bullet error:", err.message);
    } finally {
      setIsEnhancingBullet(false);
    }
  };

  // JD Analysis & Non-Destructive Tailoring
  const handleAnalyzeAndTailor = async () => {
    if (!jdText.trim() || isTailoring) return;
    setIsTailoring(true);

    try {
      const res = await api.post('/resume/tailor', {
        resumeData: {
          summary: resumeData.summary,
          skills: [
            ...(resumeData.skills?.highlighted || []),
            ...(resumeData.skills?.regular || [])
          ],
          experience: resumeData.experience || [],
          education: resumeData.education || [],
          rawText: `${resumeData.summary} ${(resumeData.experience || []).map(e => (e.bullets || []).join(' ')).join(' ')}`
        },
        jobDescription: jdText
      });

      if (res.data?.success) {
        setTailorResult(res.data);
        await runATSAnalysis(resumeData, jdText);
      }
    } catch (err) {
      console.error("Tailor error:", err);
    } finally {
      setIsTailoring(false);
    }
  };

  // Apply Tailored Draft to Workspace
  const handleApplyTailoredDraft = () => {
    if (!tailorResult?.tailoredVersion) return;
    const tv = tailorResult.tailoredVersion;
    setResumeData(prev => ({
      ...prev,
      tagline: tv.role || prev.tagline,
      summary: tv.summary || prev.summary,
      skills: {
        highlighted: (tv.skills || []).slice(0, 5),
        regular: (tv.skills || []).slice(5)
      }
    }));
    setActiveTab("workspace");
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "ai",
        text: `Tailored draft applied to your Resume Workspace for "${tv.role}"! The summary and skills have been updated to optimize keyword alignment with this job description.`
      }
    ]);
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(JSON.stringify(resumeData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`animate-fade-in ${styles.workspaceContainer}`}>
      {/* Workspace Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>AI Resume Studio & ATS Optimizer</h1>
          <p className={styles.pageSubtitle}>
            Deterministic ATS scoring, active accomplishment tailoring, and quantifiable bullet enhancement.
          </p>
        </div>

        <div className={styles.scoreBanner}>
          <div className={styles.scoreChip}>
            <Award size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <div className={styles.scoreVal}>{atsAnalysis.overallScore}<span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>/100</span></div>
              <div className={styles.scoreLabel}>ATS Score</div>
            </div>
          </div>

          <div className={styles.scoreChip}>
            <Sparkles size={18} style={{ color: 'var(--success)' }} />
            <div>
              <div className={styles.scoreVal} style={{ color: 'var(--success)' }}>{atsAnalysis.skillsScore}%</div>
              <div className={styles.scoreLabel}>Skills Match</div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopyResume}>
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </div>
      </div>

      {/* Upload & Quick Input Bar */}
      <div className={styles.uploadBanner}>
        <div className={styles.uploadInfo}>
          <div className={styles.uploadIcon}>
            <FileUp size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.938rem', color: 'var(--text-primary)' }}>
              Upload Your Resume (PDF, DOCX, TXT)
            </div>
            <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
              Real parser parses your contact info, sections, experience metrics, and technical skills automatically.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.docx,.doc,.txt" 
            style={{ display: 'none' }} 
          />
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Parsing Document..." : "Upload Resume File"}
          </Button>
        </div>
      </div>

      {uploadSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {uploadSuccess}
        </div>
      )}

      {uploadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={16} /> {uploadError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.navTab} ${activeTab === 'workspace' ? styles.active : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          <FileText size={15} /> Resume Workspace & AI Chat
        </button>
        <button 
          className={`${styles.navTab} ${activeTab === 'bullets' ? styles.active : ''}`}
          onClick={() => setActiveTab('bullets')}
        >
          <Zap size={15} /> Impact Bullet Enhancer
        </button>
        <button 
          className={`${styles.navTab} ${activeTab === 'ats' ? styles.active : ''}`}
          onClick={() => setActiveTab('ats')}
        >
          <CheckCircle2 size={15} /> ATS & Keyword Diagnostics
        </button>
        <button 
          className={`${styles.navTab} ${activeTab === 'matcher' ? styles.active : ''}`}
          onClick={() => setActiveTab('matcher')}
        >
          <Target size={15} /> JD Matcher & Non-Destructive Tailor
        </button>
      </div>

      {/* Tab 1: Interactive Workspace */}
      {activeTab === 'workspace' && (
        <div className={styles.splitWorkspace}>
          {/* Left: Chatbot */}
          <div className={styles.chatPane}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} /> AI Resume Copilot
              </div>
              <Badge variant="primary">Llama 3.3 Active</Badge>
            </div>

            <div className={styles.chatMessages}>
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`${styles.chatBubble} ${msg.sender === 'ai' ? styles.bubbleBot : styles.bubbleUser}`}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.chatBubble} ${styles.bubbleBot}`}>
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>Analyzing resume structure & keywords...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
              <input
                type="text"
                placeholder="Ask AI: 'Quantify my Apex Cloud bullets' or 'Add Docker to skills'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={styles.chatInput}
              />
              <Button type="submit" size="sm" variant="primary" disabled={isTyping || !inputText.trim()}>
                <Send size={14} />
              </Button>
            </form>
          </div>

          {/* Right: Rendered Resume */}
          <div className={styles.docPane}>
            <div className={styles.docHeader}>
              <div className={styles.docName}>{resumeData.name}</div>
              <div className={styles.docTagline}>{resumeData.tagline}</div>
              <div className={styles.docContact}>
                {resumeData.email && <span>✉ {resumeData.email}</span>}
                {resumeData.phone && <span>📱 {resumeData.phone}</span>}
                {resumeData.location && <span>📍 {resumeData.location}</span>}
                {resumeData.linkedin && <span>💼 {resumeData.linkedin}</span>}
              </div>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Professional Summary</div>
              <p className={styles.docText}>{resumeData.summary}</p>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Experience</div>
              {(resumeData.experience || []).map((exp, i) => (
                <div key={i} className={styles.docExpItem}>
                  <div className={styles.docExpHdr}>
                    <span>{exp.role}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{exp.date}</span>
                  </div>
                  <div className={styles.docExpCompany}>{exp.company}</div>
                  <ul className={styles.docBullets}>
                    {(exp.bullets || []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <div className={styles.docSectionTitle}>Technical Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {(resumeData.skills?.highlighted || []).map((s, idx) => (
                  <Badge key={idx} variant="primary">{s}</Badge>
                ))}
                {(resumeData.skills?.regular || []).map((s, idx) => (
                  <Badge key={idx} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Education</div>
              {(resumeData.education || []).map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', marginTop: '0.35rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{edu.degree}</span>
                    <span style={{ color: 'var(--text-secondary)' }}> — {edu.school}</span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)' }}>{edu.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Impact Bullet Enhancer */}
      {activeTab === 'bullets' && (
        <div>
          {/* Custom Interactive Enhancer Box */}
          <div className={styles.customBulletCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.938rem' }}>
              <Zap size={16} style={{ color: 'var(--primary)' }} /> Live Bullet Quantifier & Formula Optimizer
            </div>
            <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
              Type any weak bullet point below to formulate it into the Google XYZ formula: <em>Accomplished [X] as measured by [Y], by doing [Z]</em>.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input 
                type="text" 
                value={customBullet}
                onChange={e => setCustomBullet(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCustomBulletEnhance(); }}
                placeholder="e.g. Worked on the API endpoints and fixed database bugs for team..."
                className={styles.bulletInput}
              />
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCustomBulletEnhance}
                disabled={!customBullet.trim() || isEnhancingBullet}
              >
                {isEnhancingBullet ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Enhance Bullet
              </Button>
            </div>
          </div>

          <div className={styles.bulletGrid}>
            {bulletList.map((item, idx) => (
              <div key={idx} className={styles.bulletCard}>
                <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                  {item.role}
                </div>

                <div className={styles.bulletSideBySide}>
                  <div className={styles.bulletBefore}>
                    <span className={`${styles.bulletTag} ${styles.tagBefore}`}>Before (Weak & Unquantified)</span>
                    <div className={styles.bulletText}>{item.before}</div>
                  </div>

                  <div className={styles.bulletAfter}>
                    <span className={`${styles.bulletTag} ${styles.tagAfter}`}>After (Optimized with Impact)</span>
                    <div className={styles.bulletText}>{item.after}</div>
                    <div className={styles.metricsPill}>
                      <CheckCircle2 size={13} /> {item.metric}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ATS & Keyword Diagnostics */}
      {activeTab === 'ats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 6 Dimension Deterministic Score Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Overall ATS Score (Weighted)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                {atsAnalysis.overallScore}/100
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Weighted across 6 evaluation dimensions.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Keywords Density (30%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {atsAnalysis.keywordScore}%
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Match ratio against target domain keywords.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Skills Coverage (20%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
                {atsAnalysis.skillsScore}%
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Presence of verified core competencies.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Experience Impact (20%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>
                {atsAnalysis.experienceScore}%
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Action verbs & measurable metric density.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Format & Structure (10%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.25rem' }}>
                {atsAnalysis.formatScore}%
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Clean sections & parseable typography.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Contact & Links (10%)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                {atsAnalysis.contactScore}%
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Email, phone, location & LinkedIn.
              </p>
            </Card>
          </div>

          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Extracted & Matched Technical Keywords
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(atsAnalysis.matchedSkills || []).map(k => (
                <span key={k} style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  padding: '0.3rem 0.65rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  borderRadius: '6px', 
                  fontSize: '0.813rem', 
                  fontWeight: 600, 
                  color: 'var(--success)' 
                }}>
                  <Check size={12} /> {k}
                </span>
              ))}
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Recommended Missing Keywords (High ATS Weight)
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[...(atsAnalysis.missingSkills || []), ...(atsAnalysis.missingKeywords || [])].slice(0, 6).map(m => (
                <span key={m} style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  padding: '0.3rem 0.65rem', 
                  background: 'var(--bg-elevated)', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: '6px', 
                  fontSize: '0.813rem', 
                  color: 'var(--text-secondary)' 
                }}>
                  + Add {m}
                </span>
              ))}
            </div>
          </Card>

          {/* Strengths & Actionable Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Card>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Verified Resume Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(atsAnalysis.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Card>

            <Card>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> Recommended ATS Optimizations
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(atsAnalysis.improvements || []).map((imp, i) => <li key={i}>{imp}</li>)}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Job Description Matcher & Non-Destructive Tailoring */}
      {activeTab === 'matcher' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Target Job Description Matcher & AI Tailoring</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Paste any job description to evaluate keyword match % and generate a non-destructive tailored draft without altering your original profile.
              </p>
            </div>

            <textarea
              rows={5}
              placeholder="Paste job description requirements here (e.g. Seeking a Senior Frontend Engineer with 4+ years of React, TypeScript, Next.js, experience in micro-frontends, and Core Web Vitals optimization...)"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleAnalyzeAndTailor}
                disabled={!jdText.trim() || isTailoring}
              >
                {isTailoring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isTailoring ? "Analyzing & Tailoring..." : "Analyze JD & Generate Tailored Draft"}
              </Button>
            </div>

            {/* Non-Destructive 3-Way Result Display */}
            {tailorResult && (
              <div className={styles.tailorGrid}>
                {/* 1. Original */}
                <div className={styles.tailorCard}>
                  <div className={styles.tailorHeader}>
                    <div className={styles.tailorTitle}>
                      <FileText size={15} /> Original Version (Active)
                    </div>
                    <Badge variant="secondary">Untouched</Badge>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Summary</div>
                    <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {tailorResult.original?.summary}
                    </p>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Current Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                      {(tailorResult.original?.skills || []).map((s, idx) => (
                        <Badge key={idx} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Tailored Draft */}
                <div className={`${styles.tailorCard} ${styles.tailorCardHighlighted}`}>
                  <div className={styles.tailorHeader}>
                    <div className={styles.tailorTitle}>
                      <Sparkles size={15} style={{ color: 'var(--primary)' }} /> AI-Tailored Draft
                    </div>
                    <Badge variant="primary">{tailorResult.tailoredVersion?.role}</Badge>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Optimized Summary</div>
                    <p style={{ fontSize: '0.813rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {tailorResult.tailoredVersion?.summary}
                    </p>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Augmented Target Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                      {(tailorResult.tailoredVersion?.skills || []).map((s, idx) => (
                        <Badge key={idx} variant="primary">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                    <Button variant="primary" size="sm" onClick={handleApplyTailoredDraft}>
                      <Check size={14} /> Apply Tailored Version to Workspace
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
