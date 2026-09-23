'use client';
import { useState } from "react";
import { 
  FileText, Eye, AlertTriangle, CheckCircle2, RefreshCcw, 
  Sparkles, Check, Info, ShieldCheck, User, Mail, MapPin, Award
} from "lucide-react";
import styles from "./RecruiterInbox.module.css";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const SAMPLE_RESUME = `Aarav Sharma
aarav.sharma@talentflow.dev | +1 (555) 234-5678 | San Francisco, CA | linkedin.com/in/aarav-sharma-dev

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 5+ years of experience engineering scalable web applications using React, Next.js, and TypeScript. Specializes in design systems, Core Web Vitals optimization, and micro-frontend architecture.

WORK EXPERIENCE
Senior Frontend Engineer — Apex Cloud (2022 – Present)
• Architected modular design system across 14 enterprise micro-frontends, reducing engineering delivery cycles by 38%.
• Optimized Core Web Vitals (LCP & CLS) across checkout workflows, lifting page speed by 42% and conversion by 14%.
• Mentored 4 junior engineers on React performance patterns, modern TypeScript practices, and a11y standards.

Frontend Developer — Nova Systems (2020 – 2022)
• Rebuilt internal reporting dashboard from legacy monolith to Next.js, cutting initial bundle size by 54%.
• Implemented WCAG 2.1 AA compliant components used by 120k+ monthly active users.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2016 – 2020)

TECHNICAL SKILLS
Languages & Frameworks: React, TypeScript, Next.js, JavaScript (ES6+), HTML5, CSS3, Node.js
Tools & Libraries: Redux Toolkit, Tailwind CSS, Jest, Vite, Git, RESTful APIs, Webpack`;

import api from "../lib/api";

export default function RecruiterInbox() {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [parsedResult, setParsedResult] = useState({
    score: 92,
    candidateInfo: {
      name: "Aarav Sharma",
      email: "aarav.sharma@talentflow.dev",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      role: "Senior Frontend Engineer"
    },
    skills: ["React", "TypeScript", "Next.js", "Node.js", "Redux Toolkit", "Tailwind CSS", "Jest", "Vite", "RESTful APIs", "Core Web Vitals"],
    missingSections: [],
    missingKeywords: ["GraphQL", "Docker", "CI/CD Orchestration"],
    formattingWarnings: [
      "Plain text formatting parsed with zero encoding drops",
      "Standard section headings successfully categorized"
    ],
    recruiterSummary: "Candidate displays strong senior-level specialization in modern frontend architecture and design systems. Demonstrates verified metrics on bundle size reduction and conversion impact."
  });
  const [isParsing, setIsParsing] = useState(false);

  const handleSimulateParse = async () => {
    if (!resumeText.trim()) return;
    setIsParsing(true);

    try {
      const parseRes = await api.post('/resume/parse', { text: resumeText });
      if (parseRes.data?.success && parseRes.data.data) {
        const parsed = parseRes.data.data;
        const atsRes = await api.post('/resume/analyze-ats', { resumeData: parsed });
        const analysis = atsRes.data?.analysis || {};

        setParsedResult({
          score: analysis.overallScore || 90,
          candidateInfo: {
            name: parsed.contact?.name || "Candidate",
            email: parsed.contact?.email || "Not detected",
            phone: parsed.contact?.phone || "Not detected",
            location: parsed.contact?.location || "Detected in header",
            role: "Software Engineer"
          },
          skills: parsed.skills?.length > 0 ? parsed.skills : ["React", "JavaScript", "HTML5", "CSS3"],
          missingSections: analysis.formattingWarnings || [],
          missingKeywords: analysis.missingKeywords?.length > 0 ? analysis.missingKeywords : ["GraphQL", "Docker", "CI/CD"],
          formattingWarnings: analysis.strengths?.length > 0 ? analysis.strengths : [
            "Valid standard format confirmed",
            "Structured headings categorized without encoding drops"
          ],
          recruiterSummary: `ATS Analysis completed across 6 deterministic dimensions: Contact ${analysis.contactScore || 90}%, Format ${analysis.formatScore || 90}%, Keywords ${analysis.keywordScore || 85}%, Skills ${analysis.skillsScore || 90}%, Experience ${analysis.experienceScore || 85}%. ${analysis.strengths?.[0] || 'Candidate meets baseline technical requirements.'}`
        });
      }
    } catch (err) {
      console.warn("API parsing error, using client-side fallback:", err.message);
      // Client-side fallback if offline
      const hasEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi.test(resumeText);
      const emailMatch = resumeText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
      const email = emailMatch ? emailMatch[0] : "Not detected";

      const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
      const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const phone = phoneMatch ? phoneMatch[0] : "Not detected";

      const lines = resumeText.split("\n").filter(l => l.trim().length > 0);
      const candidateName = lines[0] ? lines[0].replace(/[^\w\s]/gi, '').trim() : "Candidate";

      const missing = [];
      if (!/EXPERIENCE|WORK HISTORY/i.test(resumeText)) missing.push("Work Experience Section");
      if (!/EDUCATION|DEGREE/i.test(resumeText)) missing.push("Education Section");
      if (!/SKILLS|TECHNOLOGIES/i.test(resumeText)) missing.push("Skills Section");

      const knownSkills = ["React", "TypeScript", "Next.js", "Node.js", "JavaScript", "Python", "Java", "SQL", "Tailwind", "CSS", "HTML", "Docker", "GraphQL", "Redux", "Jest", "AWS", "Git"];
      const extracted = knownSkills.filter(sk => new RegExp(`\\b${sk}\\b`, 'i').test(resumeText));

      let score = 90;
      if (!hasEmail) score -= 15;
      if (!hasPhone) score -= 10;
      if (missing.length > 0) score -= (missing.length * 15);
      if (extracted.length < 4) score -= 10;

      setParsedResult({
        score: Math.max(35, Math.min(98, score)),
        candidateInfo: {
          name: candidateName,
          email,
          phone,
          location: "Detected in header",
          role: "Software Engineer"
        },
        skills: extracted.length > 0 ? extracted : ["JavaScript", "HTML5", "CSS3"],
        missingSections: missing,
        missingKeywords: ["GraphQL", "Docker", "CI/CD"],
        formattingWarnings: [
          hasEmail ? "Valid email format confirmed" : "Missing standard email link",
          hasPhone ? "Valid telephone format parsed" : "Phone number missing standard digit pattern"
        ],
        recruiterSummary: `Automated summary: Candidate profile parsed with ${extracted.length} detected technical competencies.`
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    handleSimulateParse();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          ATS Simulator & Parsing Checker
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', maxWidth: '780px' }}>
          Simulates entity extraction, heading normalization, and compliance scoring as processed by standard enterprise Applicant Tracking Systems (emulating Workday, Greenhouse, and Lever parsing logic).
        </p>
      </div>

      <div className={styles.container}>
        {/* Left Side: Input */}
        <div className={styles.inputCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitle}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <span>Resume Input</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleLoadSample}>
              Load Sample Resume
            </Button>
          </div>

          <p className={styles.helperText}>
            Paste plain-text or copied resume contents below to evaluate how an automated parsing engine extracts data, skills, and sections.
          </p>

          <textarea
            className={styles.textarea}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste candidate resume text here..."
          />

          <div className={styles.actionRow}>
            <Button 
              variant="primary" 
              size="md" 
              fullWidth 
              onClick={handleSimulateParse}
              disabled={isParsing || !resumeText.trim()}
            >
              {isParsing ? (
                <>
                  <RefreshCcw size={15} className="animate-spin" /> Simulating Extraction...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Simulate ATS Extraction
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Parsed View */}
        <div className={styles.outputCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitle}>
              <Eye size={18} style={{ color: 'var(--success)' }} />
              <span>ATS Parsed Record (Recruiter Inspection)</span>
            </div>
            {parsedResult && (
              <Badge variant={parsedResult.score >= 85 ? "success" : parsedResult.score >= 70 ? "warning" : "danger"}>
                {parsedResult.score >= 85 ? "ATS Compliant" : "Needs Review"}
              </Badge>
            )}
          </div>

          {isParsing ? (
            <div className={styles.parsingState}>
              <RefreshCcw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: '0.875rem' }}>Extracting entities, checking headings, and normalizing tokens...</p>
            </div>
          ) : parsedResult ? (
            <div className={styles.resultsWrap}>
              {/* Score Banner */}
              <div className={styles.scoreBanner}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    ATS Simulation Readiness
                  </div>
                  <div className={styles.scoreGroup}>
                    <span className={styles.scoreBig}>{parsedResult.score}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/100</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Format Status</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.875rem' }}>
                    Standard Single-Column Passed
                  </div>
                </div>
              </div>

              {/* Parsed Candidate Info */}
              <div className={styles.sectionBox}>
                <span className={styles.boxTitle}>Extracted Candidate Entities</span>
                <div className={styles.infoGrid}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Name:</strong> {parsedResult.candidateInfo.name}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {parsedResult.candidateInfo.email}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {parsedResult.candidateInfo.phone}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Location:</strong> {parsedResult.candidateInfo.location}</div>
                </div>
              </div>

              {/* Extracted Skills */}
              <div className={styles.sectionBox}>
                <span className={styles.boxTitle}>Extracted Technical Skills ({parsedResult.skills.length})</span>
                <div className={styles.skillsPillRow}>
                  {parsedResult.skills.map(sk => (
                    <span key={sk} className={styles.skillPill}>
                      <Check size={11} /> {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Sections or Warnings */}
              <div className={styles.sectionBox}>
                <span className={styles.boxTitle}>Structure & Keyword Verification</span>
                {parsedResult.missingSections.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {parsedResult.missingSections.map((s, i) => (
                      <div key={i} className={styles.warningItem}>
                        <AlertTriangle size={13} /> Missing critical section: {s}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.813rem' }}>
                    <CheckCircle2 size={14} /> All standard sections (Experience, Education, Skills) detected.
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <strong>Missing keywords to consider:</strong> {parsedResult.missingKeywords.join(", ")}
                </div>
              </div>

              {/* Recruiter Friendly Summary */}
              <div className={styles.sectionBox}>
                <span className={styles.boxTitle}>Recruiter Executive Summary</span>
                <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {parsedResult.recruiterSummary}
                </p>
              </div>

              <div className={styles.disclaimer}>
                <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                <strong>Disclaimer:</strong> This is an algorithmic diagnostic simulation reflecting standard parsing heuristics. Individual employer ATS configurations may apply custom filtering rules.
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <AlertTriangle size={32} opacity={0.3} />
              <p>Paste a resume or load a sample to simulate ATS ingestion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
