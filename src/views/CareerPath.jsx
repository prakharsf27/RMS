'use client';
import { useState, useRef } from "react";
import { Search, Compass, MapPin, Loader, ArrowRight, Target, Briefcase, MessageSquare, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import styles from "./CareerPath.module.css";

export default function CareerPath() {
  const [currentRole, setCurrentRole] = useState("");
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Follow-up state
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const followUpRef = useRef(null);

  const generatePath = async () => {
    if (!currentRole.trim()) return;
    
    setLoading(true);
    setSelectedNode(null);
    setFollowUpAnswer("");

    const prompt = `I am currently a "${currentRole}". 
I want you to map out 2 distinct career trajectories for me. 
Provide VERY DETAILED and PRECISE steps. Use industry-standard terminology.

Respond ONLY with a JSON object. Strictly parseable JSON exactly like this:
{
  "paths": [
    {
      "name": "Leadership/Management Track",
      "nodes": [
         { 
           "title": "Current Role", 
           "timeframe": "0 yrs", 
           "skills": ["..."], 
           "desc": "A detailed summary of your current standing and immediate focus.", 
           "next_steps": ["Step 1 with detail", "Step 2 with detail"] 
         },
         { 
           "title": "Precise Next Role", 
           "timeframe": "2-3 yrs", 
           "skills": ["Specific Skill 1", "Specific Skill 2"], 
           "desc": "A deep dive into what this role entails in the modern industry.", 
           "next_steps": ["Highly actionable step 1", "Highly actionable step 2", "Certification/Training X"] 
         }
      ]
    },
    {
      "name": "Specialized/Expert Track",
      "nodes": [
         { "title": "Current Role", "timeframe": "0 yrs", "skills": [], "desc": "...", "next_steps": ["..."] },
         { "title": "Subject Matter Expert", "timeframe": "3-5 yrs", "skills": ["..."], "desc": "...", "next_steps": ["..."] }
      ]
    }
  ]
}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const rawText = data.content[0].text.trim();
      const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "");
      const parsed = JSON.parse(jsonStr);
      setPathData(parsed);
    } catch (err) {
      alert("Error generating career path. Try a simpler role title.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !pathData) return;
    
    setFollowUpLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: [
            { role: "system", content: "You are a career expert helping a user understand their career path. Provide detailed, precise, and encouraging advice." },
            { role: "user", content: `My current career path analysis is: ${JSON.stringify(pathData)}. \n\nMy question is: ${followUpQuery}` }
          ]
        })
      });
      const data = await response.json();
      setFollowUpAnswer(data.content[0].text);
      setTimeout(() => followUpRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setFollowUpAnswer("Sorry, I couldn't process that follow-up. Please try again.");
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
       <div className={styles.header}>
         <div>
           <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Career Path Visualizer</h1>
           <p style={{ color: 'var(--text-secondary)' }}>Discover your next moves. See what skills you need, how long it takes, and what jobs serve as stepping stones.</p>
         </div>
       </div>

       <div className={styles.searchBar}>
         <Compass size={20} className={styles.searchIcon} />
         <input 
           type="text" 
           value={currentRole} 
           onChange={(e) => setCurrentRole(e.target.value)} 
           placeholder="What is your current role? (e.g. Senior Frontend Developer)"
           onKeyDown={(e) => e.key === 'Enter' && generatePath()}
         />
         <Button onClick={generatePath} disabled={loading || !currentRole.trim()}>
           {loading ? <Loader className="animate-spin" size={16} /> : "Map My Future"}
         </Button>
       </div>

       {pathData && (
         <div className={styles.layout}>
            <div className={styles.canvas}>
               {pathData.paths.map((path, pIdx) => (
                  <div key={pIdx} className={styles.pathTrack}>
                     <h3 className={styles.trackTitle}>{path.name}</h3>
                     <div className={styles.nodesContainer}>
                        {path.nodes.map((node, nIdx) => (
                           <div key={nIdx} className={styles.nodeWrapper}>
                              <div 
                                className={`${styles.nodeBox} ${selectedNode?.title === node.title ? styles.selected : ''}`}
                                onClick={() => setSelectedNode(node)}
                              >
                                 <div className={styles.nodeTitle}>{node.title}</div>
                                 <div className={styles.nodeTime}>{node.timeframe}</div>
                              </div>
                              {nIdx < path.nodes.length - 1 && (
                                 <div className={styles.connector}><ArrowRight size={16} /></div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               ))}

               {/* Follow-up Section */}
               <Card className={styles.followUpSection}>
                  <div className={styles.followUpHeader}>
                     <MessageSquare size={18} />
                     <h3>Ask a Follow-up Question</h3>
                  </div>
                  <p className={styles.followUpHint}>Ask about specific skills, companies, or how to bridge the gap between roles.</p>
                  
                  <div className={styles.followUpInput}>
                     <textarea 
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        placeholder="e.g. Which specific certifications should I get for the Design Lead role?"
                        rows={2}
                     />
                     <button onClick={handleFollowUp} disabled={followUpLoading || !followUpQuery.trim()}>
                        {followUpLoading ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                     </button>
                  </div>

                  {followUpAnswer && (
                     <div className={styles.answerBox} ref={followUpRef}>
                        <div className={styles.answerHeader}>AI Career Advisor</div>
                        <div className={styles.answerText}>{followUpAnswer}</div>
                     </div>
                  )}
               </Card>
            </div>

            <div className={styles.sideDrawer}>
               {selectedNode ? (
                  <Card className={styles.drawerCard}>
                     <h3>{selectedNode.title}</h3>
                     <p className={styles.desc}>{selectedNode.desc}</p>
                     
                     {selectedNode.skills && selectedNode.skills.length > 0 && (
                        <div className={styles.section}>
                           <h4><Target size={14} /> Skills to Acquire</h4>
                           <div className={styles.skillsLabels}>
                              {selectedNode.skills.map((s, i) => <span key={i} className={styles.skillTag}>{s}</span>)}
                           </div>
                        </div>
                     )}

                     {selectedNode.next_steps && selectedNode.next_steps.length > 0 && (
                        <div className={styles.section}>
                           <h4><Compass size={14} /> Detailed Next Steps</h4>
                           <ul className={styles.stepsList}>
                              {selectedNode.next_steps.map((step, i) => <li key={i}>{step}</li>)}
                           </ul>
                        </div>
                     )}

                     <div className={styles.section}>
                        <h4><Briefcase size={14} /> Stepping Stone Jobs</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                           Filter roles in the <a href="/jobs" style={{ color: 'var(--primary)' }}>jobs portal</a> matching these skills to accelerate your path to this node.
                        </p>
                     </div>
                  </Card>
               ) : (
                  <div className={styles.emptyDrawer}>
                     <MapPin size={48} strokeWidth={1} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                     Click on any node in the map to see detailed skills and actionable steps.
                  </div>
               )}
            </div>
         </div>
       )}
    </div>
  );
}
