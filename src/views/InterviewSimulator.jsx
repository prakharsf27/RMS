'use client';
import { useState, useRef, useEffect } from "react";
import { Mic, Video, VideoOff, MicOff, MessageCircle, Play, StopCircle, Award, Target, HelpCircle, XCircle, Code, Volume2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import styles from "./InterviewSimulator.module.css";

export default function InterviewSimulator() {
  const [hasStarted, setHasStarted] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  
  // Session tracking
  const [usageLimit] = useState(100);
  const [usageCount, setUsageCount] = useState(0);

  // Media & Speech State
  const [stream, setStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  // Chat/Interview State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [debrief, setDebrief] = useState(null);

  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const historyRef = useRef([]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setInputText(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("rms_interview_count") || "0", 10);
    setUsageCount(count);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported in this browser.");
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const requestMedia = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      return true;
    } catch (err) {
      alert("Camera and Microphone access are mandatory for the AI interview. Please enable them to continue.");
      return false;
    }
  };

  const startInterview = async () => {
    if (usageCount >= usageLimit) return;
    if (!jobDescription || !roleTitle) return alert("Please fill in Role Title and Job Description.");

    const mediaGranted = await requestMedia();
    if (!mediaGranted) return;

    localStorage.setItem("rms_interview_count", (usageCount + 1).toString());
    setUsageCount(prev => prev + 1);
    setHasStarted(true);

    const systemPrompt = `You are a strict, professional hiring manager conducting a mock interview for the role of "${roleTitle}" at "${companyName}". 
Here is the job description: "${jobDescription}".

CRITICAL RULES:
1. Start with a greeting and introduction, then ask the FIRST question.
2. At least once during the interview, provide a technical scenario and say: "Please write a piece of code in the chat to solve this problem."
3. Evaluate their code and their verbal answers.
4. Wait for the user to answer. DO NOT ask multiple questions at once.
5. You are an interviewer, not an assistant. Keep context.
6. After 5-6 questions, or if the user is finished, output ONLY a JSON debrief block like this:
\`\`\`debrief-json
{
  "confidenceScore": 85,
  "clarityScore": 80,
  "technicalScore": 90,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "overallFeedback": "..."
}
\`\`\``;

    historyRef.current = [{ role: "system", content: systemPrompt }];
    setIsTyping(true);
    
    callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: "I am ready. Please introduce yourself and start the interview." }
    ]);
  };

  const callAI = async (msgsArray) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: msgsArray.filter(m => m.role !== "system").map(m => ({
            role: m.role,
            content: m.content || m.text
          })),
          system: msgsArray.find(m => m.role === "system")?.content
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const aiText = data.content?.[0]?.text || "";
      
      const jsonMatch = aiText.match(/```debrief-json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
         try {
           const parsed = JSON.parse(jsonMatch[1]);
           setDebrief(parsed);
           setIsFinished(true);
           setMessages(prev => [...prev, { sender: "bot", text: "The interview has concluded. Thank you." }]);
         } catch(e) {}
      } else {
         setMessages(prev => [...prev, { sender: "bot", text: aiText }]);
         speakText(aiText);
         
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
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    const newHistory = [...historyRef.current, { role: "user", content: userMsg }];
    callAI(newHistory);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  if (usageCount >= usageLimit && !hasStarted) {
    return (
      <div className="animate-fade-in" style={{ padding: "40px", textAlign: "center" }}>
        <XCircle size={64} style={{ color: "var(--danger-color)", margin: "0 auto 20px" }} />
        <h1 className="text-gradient">Usage Limit Reached</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Upgrade to Premium for more sessions.</p>
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
            Mandatory Camera & Mic enabled for proctoring. AI will read questions aloud.
          </p>
        </div>
        {!hasStarted && <Badge variant="warning">{usageLimit - usageCount} Sessions Left</Badge>}
      </div>

      <div className={styles.workspace}>
        <div className={styles.simulatorPane}>
          {!hasStarted ? (
            <Card className={styles.setupCard}>
               <h3>Interview Configuration</h3>
               <div className={styles.inputGroup}>
                 <label>Company Name</label>
                 <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
               </div>
               <div className={styles.inputGroup}>
                 <label>Target Role Title *</label>
                 <input type="text" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
               </div>
               <div className={styles.inputGroup}>
                 <label>Job Description *</label>
                 <textarea rows={6} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description..." />
               </div>
               <div className={styles.mediaNotice}>
                  <Volume2 size={16} /> <span>Camera & Mic will be activated on start.</span>
               </div>
               <Button onClick={startInterview} disabled={!jobDescription || !roleTitle} className={styles.startBtn}>
                 <Play size={16} /> Start Mandatory Media Session
               </Button>
            </Card>
          ) : (
             <div className={styles.videoRoom}>
               <div className={styles.mainVideo}>
                  <div className={styles.aiAvatar}>
                     <Target size={48} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div className={styles.videoLabel}>Hiring Manager (AI)</div>
                  {isTyping && <div className={styles.pulsingIndicator}><div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div></div>}
               </div>
               <div className={styles.selfVideo}>
                  <video ref={videoRef} autoPlay playsInline muted className={styles.userStream} />
                  {!isVideoOn && <div className={styles.cameraOff}><VideoOff size={32} /></div>}
                  <div className={styles.videoLabel}>You</div>
               </div>
               <div className={styles.videoControls}>
                  <button className={`${styles.ctrlBtn} ${!isMicOn ? styles.off : ""}`} onClick={toggleMic}>
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button className={`${styles.ctrlBtn} ${!isVideoOn ? styles.off : ""}`} onClick={toggleVideo}>
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button className={`${styles.ctrlBtn} ${styles.endCall}`} onClick={() => window.location.reload()}>
                    <StopCircle size={20} />
                  </button>
               </div>
             </div>
          )}
        </div>

        <div className={styles.chatPane}>
          {hasStarted && !debrief ? (
            <div className={styles.chatWrapper}>
               <div className={styles.chatMessages}>
                 {messages.map((m, i) => (
                   <div key={i} className={`${styles.msgRow} ${m.sender === "user" ? styles.msgRight : styles.msgLeft}`}>
                      <div className={styles.bubble}>{m.text}</div>
                   </div>
                 ))}
                 {isTyping && <div className={`${styles.msgRow} ${styles.msgLeft}`}><div className={styles.bubble} style={{ opacity: 0.7 }}>...</div></div>}
                 <div ref={messagesEndRef} />
               </div>
               <div className={styles.chatInputRow}>
                 <textarea 
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); handleSend(); } }}
                   placeholder={isListening ? "Listening..." : "Type or use voice to answer..."}
                 />
                 <div className={styles.inputActions}>
                   <button className={`${styles.voiceBtn} ${isListening ? styles.listening : ""}`} onClick={toggleListening}>
                      <Mic size={18} />
                   </button>
                   <button onClick={handleSend} disabled={isTyping || !inputText.trim()} className={styles.sendBtn}>
                     <MessageCircle size={18} />
                   </button>
                 </div>
               </div>
            </div>
          ) : debrief ? (
            <div className={styles.debriefPane}>
               <h3><Award size={20} style={{ color: "var(--primary-color)", verticalAlign: "middle", marginRight: "8px" }} /> Interview Debrief</h3>
               <div className={styles.scoreGrid}>
                  <div className={styles.scoreBox}><span>Confidence</span><div className={styles.scoreVal}>{debrief.confidenceScore}%</div></div>
                  <div className={styles.scoreBox}><span>Clarity</span><div className={styles.scoreVal}>{debrief.clarityScore}%</div></div>
                  <div className={styles.scoreBox}><span>Technical</span><div className={styles.scoreVal}>{debrief.technicalScore}%</div></div>
               </div>
               <div className={styles.debriefSection}><h4>Strengths</h4><ul>{debrief.strengths?.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
               <div className={styles.debriefSection}><h4>Areas to Improve</h4><ul>{debrief.weaknesses?.map((w,i) => <li key={i}>{w}</li>)}</ul></div>
               <div className={styles.debriefSection}><h4>Overall Feedback</h4><p>{debrief.overallFeedback}</p></div>
            </div>
          ) : (
            <div className={styles.placeholderChat}>
              <HelpCircle size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
              <p>Start the interview to begin the proctored session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
