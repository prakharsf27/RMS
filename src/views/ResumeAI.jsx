'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Send, Copy, Download, Star, X,
  FileText, Zap, Target, ArrowRight, CheckCircle
} from "lucide-react";

import styles from "./ResumeAI.module.css";

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const MODES = [
  { id: "build", label: "🛠 Build", desc: "Create from scratch" },
  { id: "tailor", label: "🎯 Tailor", desc: "Match to JD" },
  { id: "improve", label: "⚡ Improve", desc: "Enhance existing" },
];

const QUICK_ACTIONS = {
  build: ["Tell me about yourself", "Add work experience", "Add education", "Add skills section", "Generate summary"],
  tailor: ["Paste my current resume", "Add job description", "Match JD keywords", "Strengthen bullets", "ATS score check"],
  improve: ["Make more concise", "Quantify my achievements", "Add action verbs", "Fix weak phrases", "ATS optimization"],
};

const WELCOMES = {
  build: `👋 **Welcome to ResumeAI!** I'll help you craft a standout resume from scratch.\n\nLet's start simple — **tell me your name and the type of role you're targeting.** I'll build a professional, ATS-optimized resume as we talk.\n\nAlready have a resume? Click **📄 Paste My Resume** to let me improve it.`,
  tailor: `🎯 **Tailoring Mode activated!**\n\nI'll optimize your resume for a specific job description to maximize your ATS match score.\n\n**Step 1:** Paste your current resume below.\n**Step 2:** Share the job description.\n**Step 3:** Watch me rewrite every bullet and keyword to match.`,
  improve: `⚡ **Improvement Mode!**\n\nPaste your existing resume and I'll:\n- **Strengthen** weak bullets with impact metrics\n- **Add** ATS keywords you're missing\n- **Rewrite** generic phrases with power verbs\n- **Score** it against best-practice standards\n\nPaste your resume to get started!`,
};

const SYSTEM_PROMPTS = {
  build: `You are ResumeAI, an expert resume writer for TalentFlow. Help users build professional, ATS-optimized resumes through natural conversation.

IMPORTANT: When you have enough info to generate/update the resume, ALWAYS include structured JSON like this:
\`\`\`resume-json
{
  "name": "Full Name",
  "tagline": "Target Job Title",
  "email": "email@example.com",
  "phone": "+1 555-000-0000",
  "location": "City, State",
  "linkedin": "linkedin.com/in/username",
  "summary": "2-3 sentence ATS-optimized professional summary",
  "experience": [
    {
      "role": "Job Title",
      "company": "Company",
      "date": "Jan 2022 – Present",
      "bullets": ["Led X initiative resulting in Y% improvement in Z", "Built and scaled..."]
    }
  ],
  "education": [{ "degree": "B.S. Computer Science", "school": "State University", "date": "2019" }],
  "skills": {
    "highlighted": ["React", "TypeScript"],
    "regular": ["Node.js", "SQL", "AWS"]
  },
  "atsScore": 82
}
\`\`\`

Converse naturally. Ask focused questions. Generate JSON as soon as you have name + role + 1 experience. Update JSON with every new detail.`,
  tailor: `You are ResumeAI in Tailoring Mode. You analyze job descriptions and optimize resumes for ATS + recruiter appeal.

When given a resume and JD, output tailored version as:
\`\`\`resume-json
{ ...same format, atsScore reflecting JD match... }
\`\`\`

Key actions: mirror exact JD keywords in bullets, reorder skills to match JD priority, add inferred skills, quantify achievements, match job title in tagline.`,
  improve: `You are ResumeAI in Improvement Mode. Analyze pasted resumes and make them significantly better.

Output improved JSON with atsScore. Focus on: strong action verbs (Led, Architected, Drove, Delivered), quantified achievements (%, $, users, time saved), ATS keyword density, modern formatting.`,
};

/* ─── UTILS ─────────────────────────────────────────────────── */
const fmt = (t) =>
  t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
   .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,.2);padding:1px 5px;border-radius:4px;font-size:11px;color:#a5b4fc;font-family:monospace">$1</code>')
   .replace(/^[-•]\s(.+)/gm, "<li>$1</li>")
   .replace(/<li>/g, "</ul><ul><li>")
   .replace("</ul>", "")
   .replace(/\n\n/g, "<br><br>")
   .replace(/\n/g, "<br>");

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ─── RESUME RENDERER ───────────────────────────────────────── */
function ResumeDocument({ data }) {
  if (!data) return (
    <div className="rai-doc-empty">
      <div className="rai-empty-icon">
        <FileText size={26} color="#6366f1" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No resume yet</div>
      <div style={{ fontSize: 13, color: "#334155", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
        Chat with the AI to build a fresh resume or paste your existing one
      </div>
    </div>
  );

  const { name, tagline, email, phone, location, linkedin, summary, experience = [], education = [], skills = {} } = data;

  return (
    <div className="rai-doc">
      <div className="r-hdr">
        <div className="r-name">{name}</div>
        {tagline && <div className="r-tagline">{tagline}</div>}
        <div className="r-contact">
          {email && <span>✉ {email}</span>}
          {phone && <span>📱 {phone}</span>}
          {location && <span>📍 {location}</span>}
          {linkedin && <span>💼 {linkedin}</span>}
        </div>
      </div>
      <div className="r-body">
        {summary && (
          <div>
            <div className="r-sec-title">Professional Summary</div>
            <div className="r-summary">{summary}</div>
          </div>
        )}
        {experience.length > 0 && (
          <div>
            <div className="r-sec-title">Experience</div>
            {experience.map((exp, i) => (
              <div className="r-exp" key={i}>
                <div className="r-exp-hdr">
                  <div className="r-exp-role">{exp.role}</div>
                  <div className="r-exp-date">{exp.date}</div>
                </div>
                <div className="r-exp-company">{exp.company}</div>
                <ul className="r-bullets">
                  {(exp.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {(skills.highlighted?.length || skills.regular?.length) && (
          <div>
            <div className="r-sec-title">Skills</div>
            <div className="r-skills">
              {(skills.highlighted || []).map((s, i) => <span className="r-skill hl" key={i}>{s}</span>)}
              {(skills.regular || []).map((s, i) => <span className="r-skill" key={i}>{s}</span>)}
            </div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <div className="r-sec-title">Education</div>
            {education.map((edu, i) => (
              <div className="r-edu-row" key={i}>
                <div>
                  <div className="r-edu-deg">{edu.degree}</div>
                  <div className="r-edu-school">{edu.school}</div>
                </div>
                <div className="r-edu-date">{edu.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function ResumeAIChatbot() {
  const [mode, setMode] = useState("build");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [userResume, setUserResume] = useState("");
  const [history, setHistory] = useState([]);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [jdText, setJdText] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const msgsRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef(history);
  historyRef.current = history;

  // Welcome message on mount / mode change
  useEffect(() => {
    setMsgs([{ id: 1, role: "bot", text: WELCOMES[mode], time: now() }]);
    setHistory([]);
    setResumeData(null);
    setUserResume("");
    setShowPaste(mode !== "build");
    setAtsScore(null);
    setLastUpdated(null);
  }, [mode]);

  // Auto scroll
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  const addMsg = useCallback((role, text, extra = {}) => {
    setMsgs(prev => [...prev, { id: Date.now() + Math.random(), role, text, time: now(), ...extra }]);
  }, []);

  /* ── Call API ── */
  const callAI = useCallback(async (userMsg, extraContext = "") => {
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      setStreaming(true);
      const typingId = Date.now();
      setMsgs(prev => [...prev, { id: typingId, role: "bot", typing: true, time: now() }]);

      // Robust fallback for demo/testing without an API key
      setTimeout(() => {
        setMsgs(prev => prev.filter(m => m.id !== typingId));
        
        // Sample structured data for demo
        const demoResume = {
          name: "Alex Thompson",
          tagline: "Senior Software Engineer",
          email: "alex@example.com",
          phone: "+1 555-123-4567",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/alex",
          summary: "Results-driven Senior Software Engineer with over 8 years of experience in full-stack development, specializing in scalable architectures and AI integration.",
          experience: [
            {
              role: "Senior Full Stack Developer",
              company: "Tech-Flow Systems",
              date: "Jan 2020 – Present",
              bullets: ["Architected a real-time data processing pipeline serving 1M+ active users.", "Optimized React performance reducing TTI by 45%.", "Led a team of 12 engineers using Agile methodologies."]
            },
            {
              role: "Full Stack Engineer",
              company: "Innovate Labs",
              date: "June 2016 – Dec 2019",
              bullets: ["Developed a cloud-native SaaS platform using Node.js and AWS.", "Implemented CI/CD pipelines reducing deployment time by 60%.", "Built responsive UIs following strict accessibility standards."]
            }
          ],
          education: [{ degree: "M.S. in Computer Science", school: "Stanford University", date: "2016" }],
          skills: {
            highlighted: ["React", "TypeScript", "Node.js", "System Design"],
            regular: ["AWS", "PostgreSQL", "Docker", "GraphQL"]
          },
          atsScore: 94
        };

        setResumeData(demoResume);
        setLastUpdated(now());
        setAtsScore(94);

        const responseMsg = "✨ I've analyzed your profile and generated an optimized resume layout! You can see it in the preview panel. Since we're in demo mode, I've used a high-performance profile as a template.";
        addMsg("bot", responseMsg);
        setStreaming(false);
      }, 1500);
      return;
    }

    setStreaming(true);

    const fullMsg = extraContext ? userMsg + "\n\n" + extraContext : userMsg;
    const newHistory = [...historyRef.current, { role: "user", content: fullMsg }];
    setHistory(newHistory);

    // Typing indicator
    const typingId = Date.now();
    setMsgs(prev => [...prev, { id: typingId, role: "bot", typing: true, time: now() }]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4000,
          system: SYSTEM_PROMPTS[mode] + (userResume ? `\n\nUser's existing resume:\n${userResume}` : ""),
          messages: newHistory,
        }),
      });

      const data = await res.json();

      // Remove typing
      setMsgs(prev => prev.filter(m => m.id !== typingId));

      if (data.error) {
        addMsg("bot", `⚠️ API error: ${data.error.message}`);
        setStreaming(false);
        return;
      }

      const fullText = data.content?.[0]?.text || "";
      setHistory(h => [...h, { role: "assistant", content: fullText }]);

      // Extract JSON
      const jsonMatch = fullText.match(/```resume-json\n([\s\S]*?)\n```/);
      let displayText = fullText.replace(/```resume-json\n[\s\S]*?\n```/, "").trim();
      if (!displayText) displayText = "✅ Your resume has been updated! Check the preview →";

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setResumeData(parsed);
          setLastUpdated(now());
          if (parsed.atsScore) setAtsScore(parsed.atsScore);
        } catch (e) {}
      }

      // Simulate progressive reveal
      const words = displayText.split(" ");
      const msgId = Date.now();
      setMsgs(prev => [...prev, { id: msgId, role: "bot", text: "", streaming: true, time: now() }]);

      let i = 0;
      const tick = () => {
        if (i < words.length) {
          i = Math.min(i + 4, words.length);
          setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, text: words.slice(0, i).join(" ") } : m));
          setTimeout(tick, 25);
        } else {
          setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
          setStreaming(false);
        }
      };
      tick();

    } catch (err) {
      setMsgs(prev => prev.filter(m => m.id !== typingId));
      addMsg("bot", `⚠️ Connection error: ${err.message}\n\nMake sure your Anthropic API key is configured.`);
      setStreaming(false);
    }
  }, [mode, userResume, addMsg]);

  const send = () => {
    if (!input.trim() || streaming) return;
    const txt = input.trim();
    setInput("");
    addMsg("user", txt);
    callAI(txt);
  };

  const submitPaste = () => {
    if (!pasteText.trim()) return;
    setUserResume(pasteText.trim());
    setPasteText("");
    setShowPaste(false);
    addMsg("user", `[Pasted resume — ${pasteText.split("\n").length} lines]`);
    callAI("I pasted my existing resume. Please analyze it and show me an improved version. My resume:\n\n" + pasteText);
  };

  const tailorWithJD = () => {
    if (!jdText.trim()) return;
    setShowJD(false);
    const msg = resumeData
      ? "Please tailor my resume for this job description:\n\n" + jdText
      : "I want to target this role. Build/optimize my resume for:\n\n" + jdText;
    addMsg("user", "[Job Description pasted]");
    callAI(msg);
    setJdText("");
  };

  const copyResume = () => {
    if (!resumeData) return;
    const { name, tagline, email, phone, location, summary, experience = [], education = [], skills = {} } = resumeData;
    let t = `${name}\n${tagline}\n${email} | ${phone} | ${location}\n\nSUMMARY\n${summary}\n\nEXPERIENCE\n`;
    experience.forEach(e => { t += `${e.role} — ${e.company} (${e.date})\n`; (e.bullets||[]).forEach(b => t += `• ${b}\n`); t += "\n"; });
    education.forEach(e => t += `${e.degree}, ${e.school} (${e.date})\n`);
    const allSkills = [...(skills.highlighted||[]), ...(skills.regular||[])];
    if (allSkills.length) t += `\nSKILLS\n${allSkills.join(" • ")}`;
    navigator.clipboard.writeText(t).then(() => alert("Resume copied to clipboard!"));
  };

  return (
    <div className={styles.raiRoot}>
      {/* ── Chat Panel ── */}
      <div className={styles.raiChat}>
        {/* Header */}
        <div className={styles.raiHdr}>
          <div className={styles.raiBotRow}>
            <div className={styles.raiAvatar}><Sparkles size={18} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>ResumeAI by TalentFlow</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
                <span className={styles.raiDot} /> Online & ready
              </div>
            </div>
          </div>
          <div className={styles.raiTabs}>
            {MODES.map(m => (
              <div key={m.id} className={`${styles.raiTab}${mode === m.id ? " " + styles.active : ""}`} onClick={() => !streaming && setMode(m.id)}>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className={styles.raiMsgs} ref={msgsRef}>
          {msgs.map(msg => (
            <div key={msg.id} className={`${styles.raiMsg}${msg.role === "user" ? " " + styles.user : ""}`}>
              <div className={`${styles.raiMsgAv} ${msg.role === 'bot' ? styles.bot : styles.user}`}>{msg.role === "bot" ? "✨" : "PS"}</div>
              <div>
                {msg.typing ? (
                  <div className={`${styles.raiBubble} ${styles.bot}`}>
                    <div className={styles.raiTyping}><span /><span /><span /></div>
                  </div>
                ) : (
                  <div
                    className={`${styles.raiBubble} ${msg.role === 'bot' ? styles.bot : styles.user}${msg.streaming ? " " + styles.streaming : ""}`}
                    dangerouslySetInnerHTML={msg.role === "bot" ? { __html: fmt(msg.text) } : undefined}
                  >
                    {msg.role === "user" ? esc(msg.text) : undefined}
                  </div>
                )}
                <div className={styles.raiTime} style={msg.role === "user" ? { textAlign: "right" } : {}}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className={styles.raiQas}>
          {QUICK_ACTIONS[mode].map(a => (
            <div key={a} className={styles.raiQa} onClick={() => { if (!streaming) { addMsg("user", a); callAI(a); } }}>{a}</div>
          ))}
        </div>

        {/* Paste area */}
        {showPaste && (
          <div className={styles.raiPaste}>
            <div className={styles.raiPasteLbl}>PASTE YOUR EXISTING RESUME</div>
            <textarea
              className={styles.raiPasteTa}
              placeholder="Paste your resume text here (any format — plain text, copied from PDF/Word)..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className={styles.raiPasteBtn} onClick={submitPaste}>Submit Resume →</button>
              <button onClick={() => setShowPaste(false)} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "var(--text-tertiary)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className={styles.raiInputArea}>
          <div className={styles.raiInputWrap}>
            <textarea
              ref={inputRef}
              className={styles.raiTextarea}
              rows={1}
              placeholder="Ask me to build, tailor, or improve your resume..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className={styles.raiSend} onClick={send} disabled={streaming || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
          <div className={styles.raiHints}>
            <span className={styles.raiHint} onClick={() => setShowJD(true)}>📋 Paste Job Description</span>
            <span className={styles.raiHint} onClick={() => setShowPaste(true)}>📄 Paste My Resume</span>
            <span className={styles.raiHint} onClick={() => { addMsg("user", "Tailor for this role"); callAI("Tailor my resume for better ATS performance"); }}>🎯 Tailor for role</span>
            <span className={styles.raiHint} onClick={() => { addMsg("user", "Suggest improvements"); callAI("Review my resume and suggest the most impactful improvements"); }}>💡 Suggest improvements</span>
          </div>
        </div>
      </div>

      {/* ── Resume Preview Panel ── */}
      <div className={styles.raiResumePanel}>
        <div className={styles.raiResumeHdr}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div className={styles.raiResumeTitle}>Live Resume Preview</div>
              <div className={styles.raiResumeSub}>
                {lastUpdated ? `Last updated · ${lastUpdated}` : "Start chatting to generate your resume"}
              </div>
            </div>
            {atsScore && (
              <div className={styles.raiAts} style={{
                background: atsScore >= 80 ? "rgba(16,185,129,.15)" : atsScore >= 60 ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)",
                border: `1px solid ${atsScore >= 80 ? "rgba(16,185,129,.3)" : atsScore >= 60 ? "rgba(245,158,11,.3)" : "rgba(239,68,68,.3)"}`,
                color: atsScore >= 80 ? "#34d399" : atsScore >= 60 ? "#fbbf24" : "#f87171",
              }}>
                <CheckCircle size={11} /> ATS: {atsScore}%
              </div>
            )}
          </div>
          <div className={styles.raiResumeActions}>
            <button className={styles.raiRbtn} onClick={copyResume} disabled={!resumeData}>
              <Copy size={12} /> Copy
            </button>
            <button className={`${styles.raiRbtn} ${styles.primary}`} onClick={() => setShowJD(true)}>
              <Star size={12} /> Tailor to JD
            </button>
          </div>
        </div>

        <div className={styles.raiPreviewWrap}>
          <ResumeDocument data={resumeData} />
        </div>

        {/* JD Overlay */}
        {showJD && (
          <div className={styles.raiJdOverlay}>
            <div className={styles.raiJdCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>🎯 Tailor to Job Description</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Paste the JD — AI will optimize your resume to match it</div>
                </div>
                <button onClick={() => setShowJD(false)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18 }}>
                  <X size={15} />
                </button>
              </div>
              <textarea
                className={styles.raiJdTa}
                placeholder={`Senior Frontend Engineer at Stripe\n\nRequirements:\n• 5+ years React / TypeScript\n• Performance optimization experience\n• Strong CSS & testing skills\n\nResponsibilities:\n• Build scalable web applications\n• Collaborate with design...`}
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => setShowJD(false)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "var(--text-tertiary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={tailorWithJD} style={{ flex: 2, padding: 10, borderRadius: 10, background: "var(--premium-gradient)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  ✨ Tailor My Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
