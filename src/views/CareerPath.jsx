'use client';
import { useState } from "react";
import { Search, Compass, MapPin, Loader, ArrowRight, Target, Briefcase } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import styles from "./CareerPath.module.css";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export default function CareerPath() {
  const [currentRole, setCurrentRole] = useState("");
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const generatePath = async () => {
    if (!currentRole.trim()) return;
    
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      alert("Configuration Error: NEXT_PUBLIC_ANTHROPIC_API_KEY is not set. The AI requires an API key in the environment to function.");
      return;
    }

    setLoading(true);
    setSelectedNode(null);

    const prompt = `I am currently a "${currentRole}". 
I want you to map out 2 distinct career trajectories for me. 
Respond ONLY with a JSON object. No markdown, no markdown formatting blocks, no extra text. Strictly parseable JSON exactly like this:
{
  "paths": [
    {
      "name": "Management Track",
      "nodes": [
         { "title": "Current Role", "timeframe": "0 yrs", "skills": [], "desc": "Where you are now", "next_steps": ["Ensure strong foundation in current role"] },
         { "title": "Engineering Manager", "timeframe": "2-3 yrs", "skills": ["Leadership", "Agile", "System Design"], "desc": "First level management", "next_steps": ["Complete leadership training", "Take point on cross-functional projects", "Mentor junior team members"] }
      ]
    },
    {
      "name": "Individual Contributor Track",
      "nodes": [
         { "title": "Current Role", "timeframe": "0 yrs", "skills": [], "desc": "Where you are now", "next_steps": ["Ensure strong foundation"] },
         { "title": "Staff Engineer", "timeframe": "3-5 yrs", "skills": ["Architecture", "Mentorship", "Deep Tech"], "desc": "High level IC", "next_steps": ["Lead architectural reviews", "Specialize in scalable systems"] }
      ]
    }
  ]
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const rawText = data.content[0].text.trim();
      // Remove any trailing markdown if accidentally added
      const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "");
      const parsed = JSON.parse(jsonStr);
      setPathData(parsed);
    } catch (err) {
      alert("Error generating career path. Try a simpler role title.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
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
                           <h4><Compass size={14} /> Next Steps</h4>
                           <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                              {selectedNode.next_steps.map((step, i) => <li key={i} style={{ marginBottom: '4px' }}>{step}</li>)}
                           </ul>
                        </div>
                     )}

                     <div className={styles.section}>
                        <h4><Briefcase size={14} /> Stepping Stone Jobs</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                           Filter roles in the <a href="/jobs" style={{ color: 'var(--primary-color)' }}>jobs portal</a> matching these skills to accelerate your path to this node.
                        </p>
                     </div>
                  </Card>
               ) : (
                  <div className={styles.emptyDrawer}>
                     <MapPin size={48} strokeWidth={1} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                     Click on any node in the map to see skills and matching jobs.
                  </div>
               )}
            </div>
         </div>
       )}
    </div>
  );
}
