'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Send, Copy, Download, Star, X,
  FileText, Zap, Target, ArrowRight, CheckCircle, Lock, FileDown, Scissors
} from "lucide-react";

import styles from "./ResumeAI.module.css";

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are ResumeAI, a world-class executive resume writer. Your goal is to build, tailor, or improve the user's resume.
Help users through natural conversation. 

RULES:
1. When you have enough info, include structured JSON like this:
\`\`\`resume-json
{
  "name": "Full Name",
  "tagline": "Target Job Title",
  "email": "email@example.com",
  "phone": "+1 555-000-0000",
  "location": "City, State",
  "linkedin": "linkedin.com/in/username",
  "summary": "...",
  "experience": [{ "role": "...", "company": "...", "date": "...", "bullets": ["..."] }],
  "education": [{ "degree": "...", "school": "...", "date": "..." }],
  "skills": { "highlighted": ["..."], "regular": ["..."] },
  "atsScore": 85
}
\`\`\`
2. Be professional, concise, and results-oriented.`;

const WELCOME = `👋 **Welcome to ResumeAI!** I'll help you craft an ATS-optimized resume.

You can:
- **Build** a new resume from scratch
- **Tailor** your current one to a Job Description
- **Improve** your existing resume with better keywords

How would you like to start? (Or just paste your resume/JD here!)`;

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
      <div className="rai-empty-icon"><FileText size={26} color="#6366f1" /></div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No resume yet</div>
      <div style={{ fontSize: 13, color: "#334155", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
        Chat with ResumeAI to generate your professional profile.
      </div>
    </div>
  );

  const { name, tagline, email, phone, location, linkedin, summary, experience = [], education = [], skills = {} } = data;

  return (
    <div className="rai-doc" id="resume-content">
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
  const [msgs, setMsgs] = useState([{ id: 1, role: "bot", text: WELCOME, time: now() }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [history, setHistory] = useState([]);
  const [atsScore, setAtsScore] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Premium / Subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const msgsRef = useRef(null);
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  const addMsg = useCallback((role, text, extra = {}) => {
    setMsgs(prev => [...prev, { id: Date.now() + Math.random(), role, text, time: now(), ...extra }]);
  }, []);

  const callAI = useCallback(async (userMsg) => {
    setStreaming(true);
    const newHistory = [...historyRef.current, { role: "user", content: userMsg }];
    setHistory(newHistory);

    const typingId = Date.now();
    setMsgs(prev => [...prev, { id: typingId, role: "bot", typing: true, time: now() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: newHistory.map(m => ({ role: m.role, content: m.content || m.text })),
        }),
      });

      const data = await res.json();
      setMsgs(prev => prev.filter(m => m.id !== typingId));

      if (data.error) {
        addMsg("bot", `⚠️ API error: ${data.error.message}`);
        setStreaming(false);
        return;
      }

      const fullText = data.content?.[0]?.text || "";
      setHistory(h => [...h, { role: "assistant", content: fullText }]);

      const jsonMatch = fullText.match(/```resume-json\n([\s\S]*?)\n```/);
      let displayText = fullText.replace(/```resume-json\n[\s\S]*?\n```/, "").trim();
      if (!displayText) displayText = "✅ Resume updated! See the preview.";

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setResumeData(parsed);
          setLastUpdated(now());
          if (parsed.atsScore) setAtsScore(parsed.atsScore);
        } catch (e) {}
      }

      addMsg("bot", displayText);
      setStreaming(false);
    } catch (err) {
      setMsgs(prev => prev.filter(m => m.id !== typingId));
      addMsg("bot", `⚠️ Error: ${err.message}`);
      setStreaming(false);
    }
  }, [addMsg]);

  const send = () => {
    if (!input.trim() || streaming) return;
    const txt = input.trim();
    setInput("");
    addMsg("user", txt);
    callAI(txt);
  };

  const downloadResume = (format) => {
    if (!isSubscribed) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (format === 'pdf') {
      window.print();
    } else {
      // Simple Word Download via Blob
      const content = document.getElementById('resume-content').innerText;
      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData?.name || 'Resume'}.doc`;
      link.click();
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className={styles.raiRoot}>
      <div className={styles.raiChat}>
        <div className={styles.raiHdr}>
          <div className={styles.raiBotRow}>
            <div className={styles.raiAvatar}><Sparkles size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>ResumeAI Advisor</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Your personal executive writer</div>
            </div>
          </div>
        </div>

        <div className={styles.raiMsgs} ref={msgsRef}>
          {msgs.map(msg => (
            <div key={msg.id} className={`${styles.raiMsg}${msg.role === "user" ? " " + styles.user : ""}`}>
              <div className={`${styles.raiMsgAv} ${msg.role === 'bot' ? styles.bot : styles.user}`}>{msg.role === "bot" ? "✨" : "PS"}</div>
              <div>
                <div className={`${styles.raiBubble} ${msg.role === 'bot' ? styles.bot : styles.user}`} dangerouslySetInnerHTML={msg.role === "bot" ? { __html: fmt(msg.text) } : undefined}>
                  {msg.role === "user" ? esc(msg.text) : undefined}
                </div>
                {msg.typing && <div className={styles.raiTyping}><span /><span /><span /></div>}
                <div className={styles.raiTime}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.raiInputArea}>
          <div className={styles.raiInputWrap}>
            <textarea
              className={styles.raiTextarea}
              rows={1}
              placeholder="Type to build, paste to improve..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className={styles.raiSend} onClick={send} disabled={streaming || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.raiResumePanel}>
        <div className={styles.raiResumeHdr}>
          <div>
            <div className={styles.raiResumeTitle}>Live Preview</div>
            <div className={styles.raiResumeSub}>{lastUpdated ? `Updated ${lastUpdated}` : "Waiting for content..."}</div>
          </div>
          
          <div className={styles.raiResumeActions}>
            <div style={{ position: 'relative' }}>
              <button className={`${styles.raiRbtn} ${styles.primary}`} onClick={() => setShowDownloadMenu(!showDownloadMenu)} disabled={!resumeData}>
                <Download size={14} /> Download
              </button>
              
              {showDownloadMenu && (
                <div className={styles.downloadMenu}>
                  <div className={styles.menuItem} onClick={() => downloadResume('pdf')}>
                    <FileText size={14} /> PDF Format {!isSubscribed && <Lock size={12} />}
                  </div>
                  <div className={styles.menuItem} onClick={() => downloadResume('word')}>
                    <FileDown size={14} /> Word Format {!isSubscribed && <Lock size={12} />}
                  </div>
                </div>
              )}
            </div>
            
            {atsScore && (
              <div className={styles.raiAtsBadge}>
                ATS Match: {atsScore}%
              </div>
            )}
          </div>
        </div>

        <div className={styles.raiPreviewWrap}>
          <ResumeDocument data={resumeData} />
        </div>

        {showUpgradeModal && (
          <div className={styles.upgradeModal}>
            <Card className={styles.upgradeCard}>
              <div className={styles.modalClose} onClick={() => setShowUpgradeModal(false)}><X size={18} /></div>
              <Target size={40} color="var(--primary-color)" />
              <h2>TalentFlow Premium</h2>
              <p>Download professional PDF and Word resumes, get detailed ATS reports, and unlimited AI tailoring.</p>
              <Button variant="primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setIsSubscribed(true)}>
                Upgrade Now
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
