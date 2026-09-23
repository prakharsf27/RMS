'use client';
import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Copy, Download, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Zap, Target, Award, Check, RefreshCw
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
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

const BULLET_IMPROVEMENTS = [
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
  const [activeTab, setActiveTab] = useState("workspace"); // 'workspace' | 'ats' | 'bullets' | 'matcher'
  const [resumeData, setResumeData] = useState(DEMO_RESUME);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello Aarav! I've loaded your verified technical resume. You currently have an **88/100 Resume Score** and **92% ATS Compatibility** for Senior Frontend Engineer roles.\n\nWould you like me to optimize your experience bullets for metrics, or tailor keywords for a specific job description?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdMatchScore, setJdMatchScore] = useState(null);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: "user", text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "I have analyzed your request. I updated your technical summary and strengthened the action verbs in your experience section to emphasize measurable impact.";
      if (inputText.toLowerCase().includes("bullet") || inputText.toLowerCase().includes("quantify")) {
        botReply = "I rewrote your Nova Systems experience bullet to emphasize latency reduction and test coverage. Check out the updated document preview on the right!";
      } else if (inputText.toLowerCase().includes("keyword") || inputText.toLowerCase().includes("ats")) {
        botReply = "Added high-frequency ATS terms: 'Distributed Architecture', 'Core Web Vitals', and 'CI/CD Pipeline'. Your estimated ATS score increased to 94%.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: botReply }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleAnalyzeJD = () => {
    if (!jdText.trim()) return;
    setJdMatchScore(94);
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
            Interactive workspace to elevate technical bullet impact, match keywords, and verify ATS compliance.
          </p>
        </div>

        <div className={styles.scoreBanner}>
          <div className={styles.scoreChip}>
            <Award size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <div className={styles.scoreVal}>88<span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>/100</span></div>
              <div className={styles.scoreLabel}>Resume Score</div>
            </div>
          </div>

          <div className={styles.scoreChip}>
            <Sparkles size={18} style={{ color: 'var(--success)' }} />
            <div>
              <div className={styles.scoreVal} style={{ color: 'var(--success)' }}>92%</div>
              <div className={styles.scoreLabel}>ATS Readiness</div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopyResume}>
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </div>
      </div>

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
          <Zap size={15} /> Before & After Bullet Enhancer
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
          <Target size={15} /> Job Description Matcher
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
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>Analyzing resume structure...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
              <input
                type="text"
                placeholder="Ask AI: 'Quantify my Apex Cloud bullets' or 'Add GraphQL to skills'..."
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
                <span>✉ {resumeData.email}</span>
                <span>📱 {resumeData.phone}</span>
                <span>📍 {resumeData.location}</span>
                <span>💼 {resumeData.linkedin}</span>
              </div>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Professional Summary</div>
              <p className={styles.docText}>{resumeData.summary}</p>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Experience</div>
              {resumeData.experience.map((exp, i) => (
                <div key={i} className={styles.docExpItem}>
                  <div className={styles.docExpHdr}>
                    <span>{exp.role}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{exp.date}</span>
                  </div>
                  <div className={styles.docExpCompany}>{exp.company}</div>
                  <ul className={styles.docBullets}>
                    {exp.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <div className={styles.docSectionTitle}>Technical Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {resumeData.skills.highlighted.map((s, idx) => (
                  <Badge key={idx} variant="primary">{s}</Badge>
                ))}
                {resumeData.skills.regular.map((s, idx) => (
                  <Badge key={idx} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.docSectionTitle}>Education</div>
              {resumeData.education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem' }}>
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

      {/* Tab 2: Before & After Bullet Enhancer */}
      {activeTab === 'bullets' && (
        <div className={styles.bulletGrid}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', margin: '0 0 0.5rem 0' }}>
            ResumeAI converts passive responsibilities into quantified accomplishments using strong action verbs and verified outcomes.
          </p>
          {BULLET_IMPROVEMENTS.map((item, idx) => (
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
      )}

      {/* Tab 3: ATS & Keyword Diagnostics */}
      {activeTab === 'ats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                ATS Compliance Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                92/100
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Single column layout, clean headings, standard fonts, and zero parsing errors.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Keyword Match Density
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                87%
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Matched 18 of 21 industry standard technical tags for Frontend Roles.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Impact Verbs
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
                95%
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                All experience bullets begin with active high-impact leadership verbs.
              </p>
            </Card>
          </div>

          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Extracted Keywords & Coverage
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {["React", "TypeScript", "Next.js", "State Management", "Redux", "Tailwind CSS", "Core Web Vitals", "LCP", "Micro-Frontends", "CI/CD", "Jest", "Vite", "Accessibility (WCAG)"].map(k => (
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
              Recommended Missing Keywords
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {["GraphQL Client (Apollo)", "Docker / Containerization", "E2E Testing (Playwright)", "Server Components (RSC)"].map(m => (
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
        </div>
      )}

      {/* Tab 4: Job Description Matcher */}
      {activeTab === 'matcher' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Target Job Description Matcher</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Paste the job requirements for any open position to evaluate your resume match percentage and pinpoint missing competencies.
              </p>
            </div>

            <textarea
              rows={6}
              placeholder="Paste job description requirements here (e.g. We are looking for a Senior Frontend Engineer with 4+ years of React, TypeScript, Next.js, and experience in building enterprise design systems...)"
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
                onClick={handleAnalyzeJD}
                disabled={!jdText.trim()}
              >
                <Sparkles size={14} /> Calculate Match Alignment
              </Button>
            </div>

            {jdMatchScore && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1.25rem', 
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Alignment Score: {jdMatchScore}%
                    </span>
                  </div>
                  <Badge variant="success">Strong Match</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Your profile strongly satisfies the core frontend requirements. Consider adding experience with containerized deployments or GraphQL integration to reach 98%.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
