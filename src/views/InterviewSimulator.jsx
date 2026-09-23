'use client';
import { useState, useRef, useEffect } from "react";
import { 
  Mic, Video, VideoOff, MicOff, MessageCircle, Play, 
  StopCircle, Award, Target, HelpCircle, Sparkles, CheckCircle2, 
  Volume2, ShieldCheck, Camera, Settings, ArrowRight, Check
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import styles from "./InterviewSimulator.module.css";

const EVALUATION_DIMENSIONS = [
  { name: "Component Architecture", desc: "Modularity, state isolation, and clean separation of concerns." },
  { name: "Performance & Web Vitals", desc: "LCP, CLS, FID/INP optimization and asset bundling efficiency." },
  { name: "Problem Solving & Logic", desc: "Structured approach to edge cases and trade-off analysis." },
  { name: "Communication & Articulation", desc: "Clear explanation of technical concepts and active listening." }
];

export default function InterviewSimulator() {
  const [hasStarted, setHasStarted] = useState(false);

  // Pre-interview Configuration State
  const [companyName, setCompanyName] = useState("TalentFlow Technologies");
  const [roleTitle, setRoleTitle] = useState("Senior Frontend Engineer");
  const [interviewType, setInterviewType] = useState("Technical Architecture");
  const [difficulty, setDifficulty] = useState("Senior");
  const [duration, setDuration] = useState("30 Minutes");
  const [jobDescription, setJobDescription] = useState(
    "Seeking a Senior Frontend Engineer proficient in React, Next.js, and TypeScript. Responsible for architecting reusable component libraries, optimizing Core Web Vitals, and collaborating with distributed teams."
  );

  // Hardware Checks
  const [cameraStatus, setCameraStatus] = useState("ready"); // 'ready' | 'testing' | 'active'
  const [micStatus, setMicStatus] = useState("ready");

  // Media & Video Room State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [debrief, setDebrief] = useState(null);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleStartInterview = async () => {
    setHasStarted(true);
    // Initial welcome message from AI Interviewer
    setMessages([
      {
        sender: "ai",
        text: `Welcome Aarav! I am your Technical Interviewer for the ${roleTitle} position at ${companyName}. Today's ${interviewType} round will assess architecture patterns, performance considerations, and system tradeoffs.\n\nTo begin, could you walk me through how you approach architecting a scalable enterprise component library in Next.js?`
      }
    ]);

    // Request camera stream
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn("Camera access not available or permission denied:", err);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Excellent response. You highlighted component composition and prop interface typing effectively. How would you handle state management across deeply nested components without causing unnecessary re-renders?";
      if (messages.length > 2) {
        reply = "Very thoughtful trade-off analysis between Context API and atomic state libraries. Next question: In terms of Core Web Vitals, how do you diagnose and eliminate Largest Contentful Paint (LCP) bottlenecks in production Next.js apps?";
      }

      setMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleEndSession = () => {
    setDebrief({
      confidenceScore: 92,
      clarityScore: 89,
      technicalScore: 94,
      strengths: [
        "Articulated micro-frontend modularity and design system boundaries with high precision.",
        "Demonstrated hands-on command over Core Web Vitals optimization techniques.",
        "Clear, structured communication with zero conversational hesitation."
      ],
      weaknesses: [
        "Could elaborate further on server-side streaming tradeoffs with React Server Components (RSC)."
      ],
      overallFeedback: "Strong performance suitable for Senior Frontend Engineer benchmark. Candidate showed exceptional readiness for technical deep-dives."
    });
  };

  return (
    <div className={`animate-fade-in ${styles.pageContainer}`}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>AI Mock Interview Simulator</h1>
          <p className={styles.pageSubtitle}>
            Configure technical dimensions, test audio/video hardware, and practice realistic role interviews with instant AI debriefs.
          </p>
        </div>
        {!hasStarted && (
          <Badge variant="primary">Practice Sandbox Ready</Badge>
        )}
      </div>

      {!hasStarted ? (
        /* ─── Pre-interview Configuration Flow ─── */
        <div className={styles.configGrid}>
          {/* Left: Role Configuration & Dimensions */}
          <div className={styles.setupSection}>
            <div className={styles.sectionHeading}>
              <Settings size={18} style={{ color: 'var(--primary)' }} />
              <span>Session Configuration & Target Role</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Company / Target Organization</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  className={styles.inputField} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Target Role Title</label>
                <input 
                  type="text" 
                  value={roleTitle} 
                  onChange={e => setRoleTitle(e.target.value)}
                  className={styles.inputField} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Interview Type</label>
                <select 
                  value={interviewType} 
                  onChange={e => setInterviewType(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="Technical Architecture">Technical Architecture</option>
                  <option value="System Design">System Design & Scalability</option>
                  <option value="Behavioral (STAR)">Behavioral & Leadership (STAR)</option>
                  <option value="HR / Recruiter Screening">HR & Recruiter Initial Screen</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Difficulty Tier</label>
                <select 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="Mid-Level">Mid-Level (3-5 Years)</option>
                  <option value="Senior">Senior Level (5-8 Years)</option>
                  <option value="Staff / Principal">Staff / Principal (8+ Years)</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Target Duration</label>
              <select 
                value={duration} 
                onChange={e => setDuration(e.target.value)}
                className={styles.selectField}
              >
                <option value="15 Minutes">15 Minutes (Express Screening)</option>
                <option value="30 Minutes">30 Minutes (Standard Deep-Dive)</option>
                <option value="45 Minutes">45 Minutes (Comprehensive Technical)</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Evaluation Dimensions Tracked
              </div>
              <div className={styles.dimensionsList}>
                {EVALUATION_DIMENSIONS.map((dim, i) => (
                  <div key={i} className={styles.dimensionCard}>
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div className={styles.dimensionName}>{dim.name}</div>
                      <div className={styles.dimensionDesc}>{dim.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Device Checks & Privacy Disclosure */}
          <div className={styles.deviceCard}>
            <div className={styles.sectionHeading}>
              <Camera size={18} style={{ color: 'var(--primary)' }} />
              <span>Hardware & Audio Check</span>
            </div>

            <div className={styles.devicePreview}>
              <div style={{ color: '#94a3b8', fontSize: '0.813rem', textAlign: 'center' }}>
                <Camera size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
                <span>Camera feed will engage upon launching interview</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className={styles.deviceStatusRow}>
                <span>Camera Check</span>
                <Badge variant="success">HD Webcam Ready</Badge>
              </div>
              <div className={styles.deviceStatusRow}>
                <span>Microphone Audio</span>
                <Badge variant="success">Default Mic Input Active</Badge>
              </div>
            </div>

            <div className={styles.privacyNotice}>
              <ShieldCheck size={14} style={{ color: 'var(--primary)', display: 'inline', marginRight: 4 }} />
              <strong>Privacy Guarantee:</strong> This is a secure candidate practice simulation. No facial telemetry or audio feeds are recorded or shared with third parties.
            </div>

            <Button 
              variant="primary" 
              size="md" 
              onClick={handleStartInterview}
              style={{ marginTop: 'auto' }}
            >
              <Play size={15} /> Enter Mock Interview Session
            </Button>
          </div>
        </div>
      ) : (
        /* ─── Active Simulation Session ─── */
        <div className={styles.workspace}>
          {/* Video Room */}
          <div className={styles.videoRoom}>
            <div className={styles.videoLabel}>
              {companyName} • {interviewType}
            </div>

            <div className={styles.mainVideo}>
              <div className={styles.aiAvatar}>
                <Target size={42} />
              </div>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.938rem' }}>
                Technical Interviewer (AI)
              </div>
              {isTyping && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Formulating follow-up question...</span>
              )}
            </div>

            <div className={styles.selfVideo}>
              <video ref={videoRef} autoPlay playsInline muted className={styles.videoElement} />
              {!isVideoOn && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <VideoOff size={20} />
                </div>
              )}
            </div>

            <div className={styles.videoControls}>
              <button 
                className={`${styles.ctrlBtn} ${!isMicOn ? styles.off : ''}`} 
                onClick={() => setIsMicOn(!isMicOn)}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button 
                className={`${styles.ctrlBtn} ${!isVideoOn ? styles.off : ''}`} 
                onClick={() => setIsVideoOn(!isVideoOn)}
                title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button 
                className={`${styles.ctrlBtn} ${styles.endCall}`} 
                onClick={handleEndSession}
                title="Conclude Interview & Review Debrief"
              >
                <StopCircle size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Chat & Debrief */}
          <div className={styles.chatWrapper}>
            {!debrief ? (
              <>
                <div className={styles.chatMessages}>
                  {messages.map((m, i) => (
                    <div key={i} className={`${styles.msgRow} ${m.sender === "user" ? styles.msgRight : styles.msgLeft}`}>
                      <div className={styles.bubble}>{m.text}</div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={`${styles.msgRow} ${styles.msgLeft}`}>
                      <div className={styles.bubble}>...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className={styles.chatInputRow}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type technical response or speak to answer..."
                    className={styles.chatInput}
                  />
                  <Button size="sm" variant="primary" onClick={handleSend} disabled={isTyping || !inputText.trim()}>
                    <MessageCircle size={14} /> Send
                  </Button>
                </div>
              </>
            ) : (
              /* Debrief Panel */
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={20} style={{ color: 'var(--primary)' }} /> Interview Performance Debrief
                  </h3>
                  <Badge variant="success">Completed</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <Card>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Confidence</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{debrief.confidenceScore}%</div>
                  </Card>
                  <Card>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Clarity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{debrief.clarityScore}%</div>
                  </Card>
                  <Card>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Technical Depth</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{debrief.technicalScore}%</div>
                  </Card>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                    Key Strengths Demonstrated
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {debrief.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                    Recommended Next Steps
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {debrief.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>

                <Button variant="secondary" onClick={() => setHasStarted(false)}>
                  Return to Configuration
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
