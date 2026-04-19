'use client';
import { useState, useRef, useEffect } from "react";
import { Mic, Video, VideoOff, MicOff, MessageCircle, Play, StopCircle, Award, Target, HelpCircle, XCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import styles from "./InterviewSimulator.module.css";
import { useRouter } from 'next/navigation';
;

// Note: Ensure Anthropic API key is available via environment or context in real app
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export default function InterviewSimulator() {
  const [hasStarted, setHasStarted] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  
  // Session tracking
  const [usageLimit, setUsageLimit] = useState(3);
  const [usageCount, setUsageCount] = useState(0);

  // Chat/Interview State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [debrief, setDebrief] = useState(null);

  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    // Basic LocalStorage tracking for Mock Session limit
    const count = parseInt(localStorage.getItem("rms_interview_count") || "0", 10);
    setUsageCount(count);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startInterview = async () => {
    if (usageCount >= usageLimit) return;
    if (!jobDescription || !roleTitle) return alert("Please fill in Role Title and Job Description.");

    localStorage.setItem("rms_interview_count", (usageCount + 1).toString());
    setUsageCount(prev => prev + 1);
    setHasStarted(true);

    const systemPrompt = `You are a strict, professional hiring manager conducting a mock interview for the role of "${roleTitle}" at "${companyName}". 
Here is the job description you are hiring for: "${jobDescription}".
Guidelines:
1. Start with a brief professional greeting, introduce yourself, and ask the FIRST interview question immediately.
2. Wait for the user to answer. DO NOT ask multiple questions at once.
3. After the user answers, briefly evaluate their answer based on clarity and the STAR method (silently or with a short compliment/critique if requested), then seamlessly move to the NEXT question.
4. Keep character context strictly. You are NOT an AI assistant, you are an interviewer.
5. After exactly 4-5 questions, or if the user says they are done, end the interview by outputting a JSON debrief block formatted EXACTLY like this (and say nothing else):
\`\`\`debrief-json
{
  "confidenceScore": 85,
  "clarityScore": 80,
  "technicalScore": 90,
  "strengths": ["Clear communication", "Good technical depth"],
  "weaknesses": ["Rambled on question 2", "Missed explaining the 'Result' in STAR method"],
  "overallFeedback": "Strong candidate but needs to structure answers more efficiently."
}
\`\`\``;

    historyRef.current = [{ role: "system", content: systemPrompt }];

    setIsTyping(true);
    callClaude([
      { role: "system", content: systemPrompt },
      { role: "user", content: "I am ready to begin the interview. Please ask your first question." }
    ]);
  };

  const callClaude = async (msgsArray) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1500,
          messages: msgsArray.filter(m => m.role !== "system"),
          system: msgsArray.find(m => m.role === "system")?.content
        })
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      const aiText = data.content?.[0]?.text || "";
      
      // Check if debrief JSON is present
      const jsonMatch = aiText.match(/```debrief-json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
         try {
           const parsed = JSON.parse(jsonMatch[1]);
           setDebrief(parsed);
           setIsFinished(true);
           setMessages(prev => [...prev, { sender: "bot", text: "The interview has concluded. See your evaluation debrief." }]);
         } catch(e) {}
      } else {
         setMessages(prev => [...prev, { sender: "bot", text: aiText }]);
         historyRef.current = [
           ...msgsArray, 
           { role: "assistant", content: aiText }
         ];
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: `⚠️ API Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isFinished) return;
    
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    const newHistory = [...historyRef.current, { role: "user", content: userMsg }];
    callClaude(newHistory);
  };

  if (usageCount >= usageLimit && !hasStarted) {
    return (
      <div className="animate-fade-in" style={{ padding: "40px", textAlign: "center" }}>
        <XCircle size={64} style={{ color: "var(--danger-color)", margin: "0 auto 20px" }} />
        <h1 className="text-gradient">Usage Limit Reached</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
          You have used your {usageLimit} free mock interviews for this week. 
          Upgrade to TalentFlow Premium for unlimited AI interview simulations, salary negotiation coaching, and priority applications.
        </p>
        <Button variant="primary">Upgrade to Premium</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: "24px", margin: 0 }}>AI Interview Simulator</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
            Real-time evaluation and feedback to ace your next round.
          </p>
        </div>
        {!hasStarted && (
          <Badge variant="warning">
            {usageLimit - usageCount} Free Sessions Remaining
          </Badge>
        )}
      </div>

      <div className={styles.workspace}>
        {/* Left Pane - Setup or Video UI */}
        <div className={styles.simulatorPane}>
          {!hasStarted ? (
            <Card className={styles.setupCard}>
               <h3>Interview Configuration</h3>
               <p style={{ marginBottom: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
                 Paste the specifics of the role so Claude can dynamically tailor the questions to test the exact skills required.
               </p>
               
               <div className={styles.inputGroup}>
                 <label>Company Name (Optional)</label>
                 <input 
                   type="text" 
                   value={companyName} 
                   onChange={e => setCompanyName(e.target.value)} 
                   placeholder="e.g. Stripe, Acme Corp" 
                 />
               </div>
               <div className={styles.inputGroup}>
                 <label>Target Role Title *</label>
                 <input 
                   type="text" 
                   value={roleTitle} 
                   onChange={e => setRoleTitle(e.target.value)} 
                   placeholder="e.g. Senior Frontend Engineer" 
                 />
               </div>
               <div className={styles.inputGroup}>
                 <label>Job Description *</label>
                 <textarea 
                   rows={8} 
                   value={jobDescription} 
                   onChange={e => setJobDescription(e.target.value)} 
                   placeholder="Paste the full job description here..."
                 />
               </div>
               <Button onClick={startInterview} disabled={!jobDescription || !roleTitle} className={styles.startBtn}>
                 <Play size={16} /> Enter Waiting Room
               </Button>
            </Card>
          ) : (
             <div className={styles.videoRoom}>
               <div className={styles.mainVideo}>
                  {/* Mock interviewer avatar */}
                  <div className={styles.aiAvatar}>
                     <Target size={48} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div className={styles.videoLabel}>Hiring Manager (AI)</div>
                  
                  {isTyping && (
                    <div className={styles.pulsingIndicator}>
                       <div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div>
                    </div>
                  )}
               </div>
               <div className={styles.selfVideo}>
                  <div className={styles.selfPlaceholder}>
                    You
                  </div>
               </div>
               <div className={styles.videoControls}>
                  <button className={styles.ctrlBtn}><MicOff size={20} /></button>
                  <button className={styles.ctrlBtn}><VideoOff size={20} /></button>
                  <button className={`${styles.ctrlBtn} ${styles.endCall}`} onClick={() => window.location.reload()}>
                    <StopCircle size={20} />
                  </button>
               </div>
             </div>
          )}
        </div>

        {/* Right Pane - Chat/Evaluation */}
        <div className={styles.chatPane}>
          {hasStarted && !debrief ? (
            <div className={styles.chatWrapper}>
               <div className={styles.chatMessages}>
                 {messages.map((m, i) => (
                   <div key={i} className={`${styles.msgRow} ${m.sender === "user" ? styles.msgRight : styles.msgLeft}`}>
                      <div className={styles.bubble}>{m.text}</div>
                   </div>
                 ))}
                 {isTyping && (
                    <div className={`${styles.msgRow} ${styles.msgLeft}`}>
                      <div className={styles.bubble} style={{ opacity: 0.7 }}>...</div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
               <div className={styles.chatInputRow}>
                 <textarea 
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); handleSend(); } }}
                   placeholder="Type your answer here..."
                 />
                 <button onClick={handleSend} disabled={isTyping || !inputText.trim()}>
                   <MessageCircle size={18} />
                 </button>
               </div>
            </div>
          ) : debrief ? (
            <div className={styles.debriefPane}>
               <h3><Award size={20} style={{ color: "var(--primary-color)", verticalAlign: "middle", marginRight: "8px" }} /> Interview Debrief</h3>
               <div className={styles.scoreGrid}>
                  <div className={styles.scoreBox}>
                     <span>Confidence</span>
                     <div className={styles.scoreVal}>{debrief.confidenceScore}%</div>
                  </div>
                  <div className={styles.scoreBox}>
                     <span>Clarity</span>
                     <div className={styles.scoreVal}>{debrief.clarityScore}%</div>
                  </div>
                  <div className={styles.scoreBox}>
                     <span>Technical</span>
                     <div className={styles.scoreVal}>{debrief.technicalScore}%</div>
                  </div>
               </div>
               <div className={styles.debriefSection}>
                  <h4>Strengths</h4>
                  <ul>{debrief.strengths?.map((s,i) => <li key={i}>{s}</li>)}</ul>
               </div>
               <div className={styles.debriefSection}>
                  <h4>Areas to Improve</h4>
                  <ul>{debrief.weaknesses?.map((w,i) => <li key={i}>{w}</li>)}</ul>
               </div>
               <div className={styles.debriefSection}>
                  <h4>Overall Feedback</h4>
                  <p>{debrief.overallFeedback}</p>
               </div>
            </div>
          ) : (
            <div className={styles.placeholderChat}>
              <HelpCircle size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
              <p>Configure and start the interview to begin the chat and evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
