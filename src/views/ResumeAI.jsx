'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Send, Copy, Download, Star, X,
  FileText, Zap, Target, ArrowRight, CheckCircle
} from "lucide-react";

/* ─── STYLES ────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

.rai-root { display:flex; height:calc(100vh - 100px); border-radius: 16px; overflow:hidden; background:#080d1a; font-family:'Outfit',sans-serif; color:#e2e8f0; }
@media (max-width: 1024px) { 
  .rai-root { flex-direction: column; height: auto; min-height: calc(100vh - 80px); }
  .rai-chat { width: 100% !important; min-width: 0 !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.07); height: 500px; }
  .rai-resume-panel { width: 100%; height: 600px; }
}
.rai-root *,:before,:after { box-sizing:border-box; margin:0; padding:0; }
.rai-root ::-webkit-scrollbar { width:4px; }
.rai-root ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.4); border-radius:2px; }

/* Chat panel */
.rai-chat { width:420px; min-width:420px; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.015); }
.rai-hdr { padding:16px 18px; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.rai-bot-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.rai-avatar { width:36px; height:36px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; animation:pulseGlow 3s ease-in-out infinite; flex-shrink:0; }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.2)} }
.rai-dot { width:6px; height:6px; border-radius:50%; background:#34d399; animation:blink 2s ease-in-out infinite; display:inline-block; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
.rai-tabs { display:flex; gap:6px; }
.rai-tab { padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:#64748b; transition:all .2s; }
.rai-tab:hover { background:rgba(255,255,255,.06); color:#94a3b8; }
.rai-tab.active { background:rgba(99,102,241,.2); border-color:rgba(99,102,241,.4); color:#818cf8; }

/* Messages */
.rai-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
.rai-msg { display:flex; gap:9px; animation:msgIn .25s ease both; }
@keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.rai-msg.user { flex-direction:row-reverse; }
.rai-msg-av { width:28px; height:28px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; margin-top:2px; }
.rai-msg-av.bot { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; }
.rai-msg-av.user { background:linear-gradient(135deg,#334155,#475569); color:#94a3b8; }
.rai-bubble { max-width:82%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.6; }
.rai-bubble.bot { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:#cbd5e1; border-top-left-radius:4px; }
.rai-bubble.user { background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(139,92,246,.3)); border:1px solid rgba(99,102,241,.25); color:#e2e8f0; border-top-right-radius:4px; }
.rai-bubble.streaming::after { content:'▋'; color:#818cf8; animation:cursorBlink .7s ease-in-out infinite; }
@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
.rai-bubble strong { color:#c7d2fe; font-weight:600; }
.rai-bubble ul { padding-left:16px; margin-top:4px; }
.rai-bubble li { margin-bottom:3px; }
.rai-time { font-size:10px; color:#334155; margin-top:4px; padding:0 4px; }
.rai-typing { display:flex; gap:4px; align-items:center; padding:4px 0; }
.rai-typing span { width:6px; height:6px; border-radius:50%; background:#6366f1; animation:dotBounce 1.2s ease-in-out infinite; }
.rai-typing span:nth-child(2) { animation-delay:.2s; }
.rai-typing span:nth-child(3) { animation-delay:.4s; }
@keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }

/* Quick actions */
.rai-qas { padding:0 16px 10px; display:flex; flex-wrap:wrap; gap:6px; flex-shrink:0; }
.rai-qa { padding:6px 11px; border-radius:8px; font-size:11px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:#64748b; transition:all .2s; }
.rai-qa:hover { background:rgba(99,102,241,.12); border-color:rgba(99,102,241,.3); color:#818cf8; }

/* Paste area */
.rai-paste { padding:10px 14px; margin:0 16px 10px; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); }
.rai-paste-lbl { font-size:10px; font-weight:600; color:#475569; letter-spacing:.8px; margin-bottom:6px; }
.rai-paste-ta { width:100%; height:90px; padding:8px; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#94a3b8; font-size:11px; font-family:'Outfit',sans-serif; resize:none; outline:none; line-height:1.5; }
.rai-paste-ta:focus { border-color:rgba(99,102,241,.4); }
.rai-paste-ta::placeholder { color:#2d3748; }
.rai-paste-btn { margin-top:8px; padding:7px 14px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; color:white; font-size:12px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; }

/* Input area */
.rai-input-area { padding:12px 16px 14px; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.rai-input-wrap { position:relative; }
.rai-textarea { width:100%; padding:11px 44px 11px 14px; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); color:#e2e8f0; font-size:13px; font-family:'Outfit',sans-serif; resize:none; outline:none; min-height:46px; max-height:120px; transition:all .2s; line-height:1.5; }
.rai-textarea:focus { border-color:rgba(99,102,241,.5); background:rgba(255,255,255,.07); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
.rai-textarea::placeholder { color:#334155; }
.rai-send { position:absolute; right:8px; bottom:8px; width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.rai-send:hover { transform:scale(1.05); box-shadow:0 4px 16px rgba(99,102,241,.5); }
.rai-send:disabled { opacity:.4; cursor:not-allowed; transform:none; }
.rai-hints { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.rai-hint { padding:4px 10px; border-radius:6px; font-size:10px; font-weight:500; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); color:#334155; cursor:pointer; transition:all .2s; }
.rai-hint:hover { background:rgba(99,102,241,.1); border-color:rgba(99,102,241,.25); color:#6366f1; }

/* Resume panel */
.rai-resume-panel { flex:1; min-width:0; display:flex; flex-direction:column; background:#0f1629; position:relative; }
.rai-resume-hdr { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.rai-resume-title { font-size:14px; font-weight:700; color:#e2e8f0; }
.rai-resume-sub { font-size:11px; color:#475569; }
.rai-resume-actions { display:flex; gap:8px; align-items:center; }
.rai-rbtn { padding:7px 14px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; display:flex; align-items:center; gap:5px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:#64748b; }
.rai-rbtn:hover { background:rgba(255,255,255,.08); color:#e2e8f0; }
.rai-rbtn.primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border:none; }
.rai-rbtn.primary:hover { box-shadow:0 6px 20px rgba(99,102,241,.4); transform:translateY(-1px); }
.rai-ats { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:4px; }
.rai-preview-wrap { flex:1; overflow-y:auto; padding:20px; display:flex; justify-content:center; align-items:flex-start; }
.rai-doc-empty { width:100%; max-width:680px; min-height:500px; background:rgba(255,255,255,.03); border:2px dashed rgba(255,255,255,.08); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; font-family:'Outfit',sans-serif; }
.rai-empty-icon { width:56px; height:56px; border-radius:16px; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); display:flex; align-items:center; justify-content:center; }
.rai-doc { width:100%; max-width:680px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.5); }
/* Resume doc inner styles */
.r-hdr { padding:32px 36px 22px; background:linear-gradient(135deg,#1e1b4b,#312e81); color:white; }
.r-name { font-family:'DM Serif Display',serif; font-size:30px; font-weight:400; letter-spacing:-.5px; margin-bottom:4px; line-height:1.15; }
.r-tagline { font-family:'Outfit',sans-serif; font-size:14px; color:rgba(199,210,254,.85); margin-bottom:14px; }
.r-contact { display:flex; flex-wrap:wrap; gap:14px; font-family:'Outfit',sans-serif; font-size:12px; color:rgba(199,210,254,.7); }
.r-body { padding:24px 36px 32px; display:flex; flex-direction:column; gap:20px; }
.r-sec-title { font-family:'Outfit',sans-serif; font-size:10px; font-weight:700; letter-spacing:2px; color:#6366f1; text-transform:uppercase; margin-bottom:10px; padding-bottom:6px; border-bottom:1.5px solid #e0e7ff; }
.r-exp { margin-bottom:14px; }
.r-exp:last-child { margin-bottom:0; }
.r-exp-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px; }
.r-exp-role { font-family:'DM Serif Display',serif; font-size:15px; color:#1e293b; }
.r-exp-date { font-family:'Outfit',sans-serif; font-size:11px; color:#94a3b8; white-space:nowrap; margin-top:2px; }
.r-exp-company { font-family:'Outfit',sans-serif; font-size:12px; color:#6366f1; font-weight:600; margin-bottom:6px; }
.r-bullets { list-style:none; padding:0; }
.r-bullets li { font-family:'Outfit',sans-serif; font-size:12.5px; color:#475569; line-height:1.6; padding-left:14px; position:relative; margin-bottom:3px; }
.r-bullets li::before { content:'▸'; position:absolute; left:0; color:#6366f1; font-size:10px; top:2px; }
.r-skills { display:flex; flex-wrap:wrap; gap:6px; }
.r-skill { padding:4px 10px; border-radius:6px; font-family:'Outfit',sans-serif; font-size:11px; font-weight:600; background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; }
.r-skill.hl { background:#ede9fe; color:#5b21b6; border-color:#ddd6fe; }
.r-summary { font-family:'Outfit',sans-serif; font-size:13px; color:#475569; line-height:1.7; }
.r-edu-row { display:flex; justify-content:space-between; align-items:flex-start; }
.r-edu-deg { font-family:'DM Serif Display',serif; font-size:14px; color:#1e293b; }
.r-edu-school { font-family:'Outfit',sans-serif; font-size:12px; color:#6366f1; font-weight:500; }
.r-edu-date { font-family:'Outfit',sans-serif; font-size:11px; color:#94a3b8; }
/* JD overlay */
.rai-jd-overlay { position:absolute; inset:0; background:rgba(8,13,26,.96); backdrop-filter:blur(10px); z-index:10; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.rai-jd-card { width:100%; max-width:500px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:24px; }
.rai-jd-ta { width:100%; height:180px; padding:12px; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); color:#e2e8f0; font-size:12px; font-family:'Outfit',sans-serif; resize:none; outline:none; line-height:1.6; }
.rai-jd-ta:focus { border-color:rgba(99,102,241,.5); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
.rai-jd-ta::placeholder { color:#334155; }
`;

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

  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
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
    <div className="rai-root">
      {/* ── Chat Panel ── */}
      <div className="rai-chat">
        {/* Header */}
        <div className="rai-hdr">
          <div className="rai-bot-row">
            <div className="rai-avatar"><Sparkles size={18} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>ResumeAI by TalentFlow</div>
              <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                <span className="rai-dot" /> Online & ready
              </div>
            </div>
          </div>
          <div className="rai-tabs">
            {MODES.map(m => (
              <div key={m.id} className={`rai-tab${mode === m.id ? " active" : ""}`} onClick={() => !streaming && setMode(m.id)}>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="rai-msgs" ref={msgsRef}>
          {msgs.map(msg => (
            <div key={msg.id} className={`rai-msg${msg.role === "user" ? " user" : ""}`}>
              <div className={`rai-msg-av ${msg.role}`}>{msg.role === "bot" ? "✨" : "PS"}</div>
              <div>
                {msg.typing ? (
                  <div className="rai-bubble bot">
                    <div className="rai-typing"><span /><span /><span /></div>
                  </div>
                ) : (
                  <div
                    className={`rai-bubble ${msg.role}${msg.streaming ? " streaming" : ""}`}
                    dangerouslySetInnerHTML={msg.role === "bot" ? { __html: fmt(msg.text) } : undefined}
                  >
                    {msg.role === "user" ? esc(msg.text) : undefined}
                  </div>
                )}
                <div className={`rai-time${msg.role === "user" ? " " : ""}`} style={msg.role === "user" ? { textAlign: "right" } : {}}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="rai-qas">
          {QUICK_ACTIONS[mode].map(a => (
            <div key={a} className="rai-qa" onClick={() => { if (!streaming) { addMsg("user", a); callAI(a); } }}>{a}</div>
          ))}
        </div>

        {/* Paste area */}
        {showPaste && (
          <div className="rai-paste">
            <div className="rai-paste-lbl">PASTE YOUR EXISTING RESUME</div>
            <textarea
              className="rai-paste-ta"
              placeholder="Paste your resume text here (any format — plain text, copied from PDF/Word)..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="rai-paste-btn" onClick={submitPaste}>Submit Resume →</button>
              <button onClick={() => setShowPaste(false)} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "#64748b", fontSize: 12, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="rai-input-area">
          <div className="rai-input-wrap">
            <textarea
              ref={inputRef}
              className="rai-textarea"
              rows={1}
              placeholder="Ask me to build, tailor, or improve your resume..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="rai-send" onClick={send} disabled={streaming || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
          <div className="rai-hints">
            <span className="rai-hint" onClick={() => setShowJD(true)}>📋 Paste Job Description</span>
            <span className="rai-hint" onClick={() => setShowPaste(true)}>📄 Paste My Resume</span>
            <span className="rai-hint" onClick={() => { addMsg("user", "Tailor for this role"); callAI("Tailor my resume for better ATS performance"); }}>🎯 Tailor for role</span>
            <span className="rai-hint" onClick={() => { addMsg("user", "Suggest improvements"); callAI("Review my resume and suggest the most impactful improvements"); }}>💡 Suggest improvements</span>
          </div>
        </div>
      </div>

      {/* ── Resume Preview Panel ── */}
      <div className="rai-resume-panel">
        <div className="rai-resume-hdr">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div className="rai-resume-title">Live Resume Preview</div>
              <div className="rai-resume-sub">
                {lastUpdated ? `Last updated · ${lastUpdated}` : "Start chatting to generate your resume"}
              </div>
            </div>
            {atsScore && (
              <div className="rai-ats" style={{
                background: atsScore >= 80 ? "rgba(16,185,129,.15)" : atsScore >= 60 ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)",
                border: `1px solid ${atsScore >= 80 ? "rgba(16,185,129,.3)" : atsScore >= 60 ? "rgba(245,158,11,.3)" : "rgba(239,68,68,.3)"}`,
                color: atsScore >= 80 ? "#34d399" : atsScore >= 60 ? "#fbbf24" : "#f87171",
              }}>
                <CheckCircle size={11} /> ATS: {atsScore}%
              </div>
            )}
          </div>
          <div className="rai-resume-actions">
            <button className="rai-rbtn" onClick={copyResume} disabled={!resumeData}>
              <Copy size={12} /> Copy
            </button>
            <button className="rai-rbtn primary" onClick={() => setShowJD(true)}>
              <Star size={12} /> Tailor to JD
            </button>
          </div>
        </div>

        <div className="rai-preview-wrap">
          <ResumeDocument data={resumeData} />
        </div>

        {/* JD Overlay */}
        {showJD && (
          <div className="rai-jd-overlay">
            <div className="rai-jd-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>🎯 Tailor to Job Description</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Paste the JD — AI will optimize your resume to match it</div>
                </div>
                <button onClick={() => setShowJD(false)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", fontSize: 18 }}>
                  <X size={15} />
                </button>
              </div>
              <textarea
                className="rai-jd-ta"
                placeholder={`Senior Frontend Engineer at Stripe\n\nRequirements:\n• 5+ years React / TypeScript\n• Performance optimization experience\n• Strong CSS & testing skills\n\nResponsibilities:\n• Build scalable web applications\n• Collaborate with design...`}
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => setShowJD(false)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>
                  Cancel
                </button>
                <button onClick={tailorWithJD} style={{ flex: 2, padding: 10, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
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
