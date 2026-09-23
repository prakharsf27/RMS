'use client';
import { useState } from "react";
import { 
  Compass, ArrowRight, Target, Briefcase, Award, 
  CheckCircle2, AlertCircle, Sparkles, BookOpen, ChevronRight, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import styles from "./CareerPath.module.css";

const TRACKS = {
  management: {
    name: "Engineering Leadership Track",
    nodes: [
      {
        id: "fe_dev",
        title: "Frontend Developer",
        timeframe: "0 – 2 Years",
        isCurrent: false,
        summary: "Foundation in modern client frameworks, responsive UI layout, and core component logic.",
        skills: ["HTML5 / CSS3", "JavaScript (ES6+)", "React Basics", "Git Version Control", "REST APIs"],
        missingSkills: [],
        learningAreas: ["Component lifecycle & Hooks", "CSS Grid & Flexbox layouts", "Basic state management"],
        nextSteps: ["Contribute to reusable component library", "Improve test coverage with Jest"],
        relevantJobs: ["Frontend Developer at Nova Systems", "Junior React Engineer at Apex Cloud"]
      },
      {
        id: "sr_fe",
        title: "Senior Frontend Developer",
        timeframe: "3 – 5 Years",
        isCurrent: true,
        summary: "Architecting complex client applications, driving performance benchmarks, and mentoring juniors.",
        skills: ["Next.js (App Router)", "TypeScript", "Core Web Vitals", "State Management (Redux/Zustand)", "Design Systems"],
        missingSkills: ["Distributed GraphQL Federation", "Micro-frontend orchestration"],
        learningAreas: ["Server-Side Rendering (SSR) & Streaming", "Advanced Web Vitals (INP/LCP)", "Accessibility standards (WCAG)"],
        nextSteps: ["Lead migration to modular component architecture", "Spearhead CI/CD bundle size budgets"],
        relevantJobs: ["Senior Frontend Engineer at TalentFlow Technologies", "Lead UI Engineer at Vertex Labs"]
      },
      {
        id: "lead_fe",
        title: "Lead Frontend Engineer",
        timeframe: "5 – 7 Years",
        isCurrent: false,
        summary: "Technical leadership across multiple product pods, architectural decision records (ADRs), and cross-functional alignment.",
        skills: ["System Architecture", "Cross-team Mentorship", "Micro-frontends", "Performance Auditing", "CI/CD Deployment"],
        missingSkills: ["Engineering resource budgeting", "Staff career ladder coaching"],
        learningAreas: ["Enterprise architecture patterns", "Incident management & SLAs", "High-level stakeholder negotiation"],
        nextSteps: ["Drive technical roadmap alignment with VP of Engineering", "Establish hiring rubric for senior talent"],
        relevantJobs: ["Staff Frontend Engineer at Nova Systems", "Engineering Lead at Apex Cloud"]
      },
      {
        id: "eng_mgr",
        title: "Engineering Manager",
        timeframe: "7+ Years",
        isCurrent: false,
        summary: "People management, strategic hiring, performance management, and organizational roadmap execution.",
        skills: ["People Management", "1:1 Coaching", "Sprint & OKR Planning", "Talent Acquisition", "Technical Strategy"],
        missingSkills: ["P&L budget governance", "Executive stakeholder management"],
        learningAreas: ["Leadership psychological safety", "Organizational scaling patterns", "Conflict resolution frameworks"],
        nextSteps: ["Participate in hiring committee calibration", "Lead cross-functional engineering reorganization"],
        relevantJobs: ["Director of Frontend Engineering at TalentFlow", "Engineering Manager at Apex Cloud"]
      }
    ]
  },
  architect: {
    name: "Staff & Principal Architect Track",
    nodes: [
      {
        id: "sr_fe_arch",
        title: "Senior Frontend Developer",
        timeframe: "3 – 5 Years",
        isCurrent: true,
        summary: "Hands-on application development with deep focus on maintainability and frontend performance.",
        skills: ["React & TypeScript", "Next.js", "Web Vitals", "Design Systems"],
        missingSkills: ["Edge computing & Cloudflare Workers"],
        learningAreas: ["Zero-runtime CSS styling", "Compiler performance (SWC/Turbopack)"],
        nextSteps: ["Publish internal technical RFCs", "Benchmark rendering engines"],
        relevantJobs: ["Senior Frontend Engineer at TalentFlow Technologies"]
      },
      {
        id: "staff_eng",
        title: "Staff Frontend Engineer",
        timeframe: "5 – 8 Years",
        isCurrent: false,
        summary: "Technical authority setting standards across entire organization. Solves complex scalability and platform bottlenecks.",
        skills: ["Distributed Micro-Frontends", "Compiler & Tooling Optimization", "High-Throughput Caching", "Enterprise RFCs"],
        missingSkills: ["Multi-region CDN orchestration", "Large-scale monorepo tooling (Turborepo)"],
        learningAreas: ["Wasm integration in client runtimes", "Global edge caching strategies"],
        nextSteps: ["Standardize company-wide build pipeline", "Mentor aspiring senior engineers"],
        relevantJobs: ["Staff Platform Engineer at Vertex Labs"]
      },
      {
        id: "principal_arch",
        title: "Principal Frontend Architect",
        timeframe: "8+ Years",
        isCurrent: false,
        summary: "Sets multi-year technology vision, evaluates emerging web standards, and ensures architectural continuity across all platforms.",
        skills: ["Strategic Technology Vision", "Distributed Edge Architecture", "Standards Committee Alignment", "Cross-Platform Cohesion"],
        missingSkills: ["Executive board alignment"],
        learningAreas: ["AI-native UI orchestration", "Distributed systems resilience"],
        nextSteps: ["Author multi-year technical roadmap", "Represent organization at international tech summits"],
        relevantJobs: ["Principal Architect at Apex Cloud"]
      }
    ]
  }
};

export default function CareerPath() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState("management");
  const currentNodes = TRACKS[selectedTrack].nodes;
  const [selectedNode, setSelectedNode] = useState(currentNodes[1]); // default to Senior Frontend Engineer

  return (
    <div className={`animate-fade-in ${styles.pageContainer}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Career Roadmap & Skill Progression</h1>
          <p className={styles.pageSubtitle}>
            Interactive technical trajectory mapping verified competencies, learning milestones, and matching openings.
          </p>
        </div>
      </div>

      {/* Track Selector */}
      <div className={styles.trackSelector}>
        <button 
          className={`${styles.trackTab} ${selectedTrack === "management" ? styles.active : ""}`}
          onClick={() => {
            setSelectedTrack("management");
            setSelectedNode(TRACKS.management.nodes[1]);
          }}
        >
          Leadership & Management
        </button>
        <button 
          className={`${styles.trackTab} ${selectedTrack === "architect" ? styles.active : ""}`}
          onClick={() => {
            setSelectedTrack("architect");
            setSelectedNode(TRACKS.architect.nodes[0]);
          }}
        >
          Staff & Principal Architect
        </button>
      </div>

      <div className={styles.layout}>
        {/* Left: Roadmap Timeline Flow */}
        <div className={styles.roadmapCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              {TRACKS[selectedTrack].name}
            </h2>
            <Badge variant="primary">Target Trajectory</Badge>
          </div>

          <div className={styles.roadmapTimeline}>
            {currentNodes.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const hasLine = index < currentNodes.length - 1;

              return (
                <div 
                  key={node.id} 
                  className={`${styles.stageRow} ${node.isCurrent ? styles.current : ''} ${isSelected ? styles.selected : ''}`}
                >
                  {hasLine && <div className={styles.lineConnector} />}
                  <div className={styles.stageNode}>
                    {index + 1}
                  </div>

                  <div 
                    className={styles.stageContent}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className={styles.stageHeader}>
                      <span className={styles.stageTitle}>
                        {node.title} {node.isCurrent && <Badge variant="success" style={{ marginLeft: 6 }}>Current Level</Badge>}
                      </span>
                      <span className={styles.stageTime}>{node.timeframe}</span>
                    </div>
                    <p className={styles.stageSummary}>{node.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspector Details Pane */}
        <div className={styles.detailPane}>
          <div className={styles.detailHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Stage Blueprint
              </span>
              <Badge variant={selectedNode.isCurrent ? "success" : "secondary"}>
                {selectedNode.timeframe}
              </Badge>
            </div>
            <h3 className={styles.detailTitle}>{selectedNode.title}</h3>
            <p className={styles.detailSubtitle}>{selectedNode.summary}</p>
          </div>

          {/* Required Skills */}
          <div className={styles.sectionBlock}>
            <span className={styles.blockTitle}>Core Technical Competencies</span>
            <div className={styles.skillsPillGrid}>
              {selectedNode.skills.map(sk => (
                <span key={sk} className={styles.skillPill}>
                  <Check size={11} /> {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills / Skills Gap */}
          {selectedNode.missingSkills.length > 0 && (
            <div className={styles.sectionBlock}>
              <span className={styles.blockTitle}>Identified Skill Gaps</span>
              <div className={styles.skillsPillGrid}>
                {selectedNode.missingSkills.map(gap => (
                  <span key={gap} className={styles.missingSkillPill}>
                    <AlertCircle size={11} /> {gap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Learning Focus */}
          <div className={styles.sectionBlock}>
            <span className={styles.blockTitle}>Key Learning Focus Areas</span>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {selectedNode.learningAreas.map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div className={styles.sectionBlock}>
            <span className={styles.blockTitle}>Recommended Next Steps</span>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {selectedNode.nextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Relevant Jobs */}
          <div className={styles.sectionBlock}>
            <span className={styles.blockTitle}>Matching Open Positions</span>
            <div className={styles.jobsList}>
              {selectedNode.relevantJobs.map((jobName, idx) => (
                <div key={idx} className={styles.jobItem}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{jobName}</span>
                  <Button size="sm" variant="ghost" onClick={() => router.push('/jobs')}>
                    View <ChevronRight size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
