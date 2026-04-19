'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';
;
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { 
  Rocket, 
  Zap, 
  CheckCircle, 
  Play, 
  ArrowRight, 
  Layout, 
  Briefcase, 
  FileText, 
  Video, 
  User, 
  Star, 
  Map, 
  DollarSign, 
  Check, 
  X,
  Plus,
  Menu
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import styles from "./LandingPage.module.css";

const Reveal = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.12, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 28 }
      }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Update active hash
      const sections = ["features", "how", "pricing"];
      const current = sections.find(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveHash(`#${current}`);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={styles.container}>
      {/* --- NAV --- */}
      <nav className={cn(styles.nav, scrolled && styles.navScrolled)}>
        <Link className={styles.navLogo} href="/" onClick={closeMenu}>
          <div className={styles.navLogoIcon}>T</div>
          <span className={styles.navLogoText}>TalentFlow</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#features" className={activeHash === "#features" ? styles.active : ""}>Features</a>
          <a href="#how" className={activeHash === "#how" ? styles.active : ""}>How it works</a>
          <a href="#pricing" className={activeHash === "#pricing" ? styles.active : ""}>Pricing</a>
          <a href="#">Blog</a>
        </div>
        <div className={styles.navCtas}>
          <div className={styles.themeToggleDesktop}>
            <ThemeToggle />
          </div>
          {user ? (
            <Link href="/dashboard" className={cn(styles.btnPrimary, styles.hideMobile)}>
              Back to Dashboard
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(styles.btnGhost, styles.hideMobile)}>Sign in</Link>
              <Link href="/login" className={cn(styles.btnPrimary, styles.hideMobile)}>
                Get started free
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </>
          )}
          
          <div className={styles.mobileNavActions}>
             <ThemeToggle />
             <button className={styles.menuBtn} onClick={toggleMenu} aria-label="Toggle Menu">
               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className={styles.mobileDrawer}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.mobileLinks}>
                <a href="#features" onClick={closeMenu}>Features</a>
                <a href="#how" onClick={closeMenu}>How it works</a>
                <a href="#pricing" onClick={closeMenu}>Pricing</a>
                <a href="#" onClick={closeMenu}>Blog</a>
                
                <div className={styles.mobileDrawerCtas}>
                  {user ? (
                    <Link href="/dashboard" className={styles.btnPrimaryFull} onClick={closeMenu}>
                      Back to Dashboard
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className={styles.btnGhostFull} onClick={closeMenu}>Sign in</Link>
                      <Link href="/login" className={styles.btnPrimaryFull} onClick={closeMenu}>
                        Get started free
                        <ArrowRight size={16} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO --- */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}></div>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroGlow2}></div>

        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot}></span>
          Now in Beta · Join 14,200+ job seekers
        </div>

        <h1 className={styles.heroH1}>
          Land your dream job.<br />
          <span className={styles.gradText}>Impossibly faster.</span>
        </h1>

        <p className={styles.heroSub}>
          TalentFlow uses AI to build your resume, simulate interviews, track applications, and tailor everything to every job — so you get hired, not just considered.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/login" className={cn(styles.btnHero, styles.primary)}>
            <Rocket size={16} />
            Start for free — no card needed
          </Link>
          <a href="#features" className={cn(styles.btnHero, styles.secondary)}>
            <Play size={16} fill="currentColor" />
            See how it works
          </a>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatVal}>14.2K</div>
            <div className={styles.heroStatLbl}>Active job seekers</div>
          </div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatVal}>94%</div>
            <div className={styles.heroStatLbl}>Interview success rate</div>
          </div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatVal}>3×</div>
            <div className={styles.heroStatLbl}>Faster than solo applying</div>
          </div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStatItem}>
            <div className={styles.heroStatVal}>2.1M</div>
            <div className={styles.heroStatLbl}>Resumes tailored</div>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className={styles.heroMockup}>
          <div className={styles.mmBar}>
            <div className={styles.mmDot} style={{ background: "#ef4444" }}></div>
            <div className={styles.mmDot} style={{ background: "#f59e0b" }}></div>
            <div className={styles.mmDot} style={{ background: "#22c55e" }}></div>
            <div className={styles.mmBarSearch}></div>
          </div>
          <div className={styles.mmBody}>
            <div className={styles.mmSidebar}>
              <div className={styles.mmLogoRow}>
                <div className={styles.mmLogoIco}>T</div>
                <span className={styles.mmLogoTxt}>TalentFlow</span>
              </div>
              <div className={cn(styles.mmNavItem, styles.mmNavItemActive)}>
                <Layout size={12} /> Dashboard
              </div>
              <div className={styles.mmNavItem}><Briefcase size={12} /> Jobs</div>
              <div className={styles.mmNavItem}><FileText size={12} /> Applications</div>
              <div className={styles.mmNavItem}><Rocket size={12} /> Interview AI</div>
              <div className={styles.mmNavItem}><User size={12} /> Profile</div>
            </div>
            <div className={styles.mmMain}>
              <div className={styles.mmHeroCard}>
                <div>
                  <div className={styles.mmGreeting}>Welcome back, Prakhar 👋</div>
                  <div className={styles.mmGreetingSub}>3 new matching jobs · 1 interview tomorrow</div>
                </div>
                <div className={styles.mmHeroBtn}>Browse Jobs</div>
              </div>
              <div className={styles.mmStatsGrid}>
                <div className={styles.mmStatCard}>
                  <div className={styles.mmStatVal} style={{ color: "#818cf8" }}>24</div>
                  <div className={styles.mmStatLbl}>APPLIED</div>
                </div>
                <div className={styles.mmStatCard}>
                  <div className={styles.mmStatVal} style={{ color: "#f59e0b" }}>8</div>
                  <div className={styles.mmStatLbl}>INTERVIEWS</div>
                </div>
                <div className={styles.mmStatCard}>
                  <div className={styles.mmStatVal} style={{ color: "#34d399" }}>2</div>
                  <div className={styles.mmStatLbl}>OFFERS</div>
                </div>
                <div className={styles.mmStatCard}>
                  <div className={styles.mmStatVal} style={{ color: "#c084fc" }}>147</div>
                  <div className={styles.mmStatLbl}>VIEWS</div>
                </div>
              </div>
              <div className={styles.mmJobList}>
                <div className={styles.mmJobItem}>
                  <div className={styles.mmJobLogo} style={{ background: "#635bff" }}>S</div>
                  <div>
                    <div className={styles.mmJobRole}>Senior Frontend Engineer</div>
                    <div className={styles.mmJobCo}>Stripe · Remote</div>
                  </div>
                  <div className={styles.mmJobMatch}>96%</div>
                </div>
                <div className={styles.mmJobItem}>
                  <div className={styles.mmJobLogo} style={{ background: "#5e6ad2" }}>L</div>
                  <div>
                    <div className={styles.mmJobRole}>Product Designer</div>
                    <div className={styles.mmJobCo}>Linear · San Francisco</div>
                  </div>
                  <div className={styles.mmJobMatch}>89%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOGOS --- */}
      <section className={styles.logosSection}>
        <Reveal>
          <div className={styles.logosLabel}>TRUSTED BY CANDIDATES TARGETING TOP COMPANIES</div>
          <div className={styles.logosTrackOuter}>
            <div className={styles.logosTrack}>
              {["Google", "Stripe", "OpenAI", "Microsoft", "Meta", "Netflix", "Apple", "Figma", "Linear", "Vercel", "Notion", "Anthropic"].map((logo, i) => (
                <span key={i} className={styles.logoName}>{logo}</span>
              ))}
              {["Google", "Stripe", "OpenAI", "Microsoft", "Meta", "Netflix", "Apple", "Figma", "Linear", "Vercel", "Notion", "Anthropic"].map((logo, i) => (
                <span key={`clone-${i}`} className={styles.logoName}>{logo}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* --- FEATURES BENTO --- */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <Reveal>
            <div className={styles.sectionBadge}>
              <Zap size={12} strokeWidth={2.5} />
              Everything you need
            </div>
            <h2 className={styles.sectionTitle}>Your unfair<br />hiring advantage</h2>
            <p className={styles.sectionSub}>Six AI-powered tools that cover every stage of the job hunt — from building your resume to negotiating the offer.</p>
          </Reveal>
        </div>

        <div className={styles.bento}>
          {/* Interview Simulator */}
          <div className={cn(styles.bentoCard, styles.span8)}>
            <Reveal>
              <div className={styles.bentoHeader}>
                <div className={styles.bentoIcon} style={{ background: "rgba(99,102,241,0.15)" }}>
                  <Video size={22} color="#818cf8" strokeWidth={1.8} />
                </div>
                <div className={styles.bentoMeta}>
                  <div className={styles.bentoTitle}>AI Interview Simulator</div>
                  <div className={styles.bentoDesc}>Practice with a real AI interviewer that knows the exact job description. Get scored on clarity, confidence, and depth — then receive a full debrief on what to fix.</div>
                  <span className={styles.bentoTag}>⭐ Most popular</span>
                </div>
              </div>
              <div className={styles.featPreview}>
                <div className={styles.intPreview}>
                  <div className={styles.intQ}>Question 3 of 8 — Behavioral</div>
                  <div className={styles.intQText}>"Tell me about a time you led a cross-functional team through a high-stakes deadline. What was your approach?"</div>
                  <div className={styles.intBarRow}>
                    <div className={styles.intBarLbl}>Clarity</div>
                    <div className={styles.intBarOuter}><div className={styles.intBarFill} style={{ width: "88%", background: "var(--premium-gradient)" }}></div></div>
                    <span className={styles.intBarVal}>88%</span>
                  </div>
                  <div className={styles.intBarRow}>
                    <div className={styles.intBarLbl}>Confidence</div>
                    <div className={styles.intBarOuter}><div className={styles.intBarFill} style={{ width: "76%", background: "linear-gradient(90deg,#f59e0b,#ef4444)" }}></div></div>
                    <span className={styles.intBarVal} style={{ color: "#f59e0b" }}>76%</span>
                  </div>
                  <div className={styles.intBarRow}>
                    <div className={styles.intBarLbl}>Depth</div>
                    <div className={styles.intBarOuter}><div className={styles.intBarFill} style={{ width: "93%", background: "linear-gradient(90deg,#10b981,#14b8a6)" }}></div></div>
                    <span className={styles.intBarVal} style={{ color: "#10b981" }}>93%</span>
                  </div>
                  <div className={styles.intScoreRow}>
                    <div className={styles.intScoreBox}>
                      <div className={styles.intScoreVal}>85 / 100</div>
                      <div className={styles.intScoreLbl}>Overall performance</div>
                    </div>
                    <button className={styles.intScoreBtn}>Next question →</button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Resume Builder */}
          <div className={cn(styles.bentoCard, styles.span4)}>
            <Reveal delay={0.1}>
              <div className={styles.bentoIcon} style={{ background: "rgba(16,185,129,0.15)" }}>
                <FileText size={22} color="#34d399" strokeWidth={1.8} />
              </div>
              <div className={styles.bentoTitle}>AI Resume Builder</div>
              <div className={styles.bentoDesc}>Build, tailor, and score your resume with AI. Paste any job description and watch every bullet rewrite itself to match.</div>
              <div className={cn(styles.featPreview, styles.resPreviewContainer)}>
                <div className={styles.resPreview}>
                  <div className={styles.resName}>Prakhar Singh</div>
                  <div className={styles.resRoleText}>SENIOR FRONTEND ENGINEER</div>
                  <div className={styles.resSection}>EXPERIENCE</div>
                  <div className={styles.resBullet}>Led React migration saving 40% bundle size across 3 product teams</div>
                  <div className={styles.resBullet}>Built TypeScript design system used by 12 engineers...</div>
                  <div className={styles.resSection} style={{ marginTop: "8px" }}>SKILLS</div>
                  <div className={styles.resSkillRow}>
                    <span className={styles.resSkill}>React</span><span className={styles.resSkill}>TypeScript</span><span className={styles.resSkill}>Node.js</span><span className={cn(styles.resSkill, styles.resSkillAlt)}>AWS</span>
                  </div>
                </div>
              </div>
              <div className={styles.resBadges}>
                <div className={styles.resBadgeAts}>ATS Score: 94%</div>
                <div className={styles.resBadgeTailored}>✨ AI Tailored</div>
              </div>
            </Reveal>
          </div>

          {/* Ghosting Tracker */}
          <div className={cn(styles.bentoCard, styles.span5)}>
            <Reveal>
              <div className={styles.bentoIcon} style={{ background: "rgba(245,158,11,0.15)" }}>
                <Briefcase size={22} color="#f59e0b" strokeWidth={1.8} />
              </div>
              <div className={styles.bentoTitle}>Job Ghosting Tracker</div>
              <div className={styles.bentoDesc}>Your personal job CRM. Track every application, set follow-up reminders, and get AI-drafted follow-up emails — so you never lose momentum.</div>
              <div className={styles.featPreview}>
                <div className={styles.trkPreview}>
                  {[
                    { co: "Stripe", role: "Frontend Eng", status: "Interviewing", color: "#635bff", badge: { bg: "rgba(16,185,129,0.15)", text: "#34d399" }, day: 3 },
                    { co: "Linear", role: "Designer", status: "Viewed", color: "#5e6ad2", badge: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" }, day: 7 },
                    { co: "Figma", role: "UI Eng", status: "Ghosted", color: "#a259ff", badge: { bg: "rgba(239,68,68,0.15)", text: "#f87171" }, day: 21 }
                  ].map((item, i) => (
                    <div key={i} className={styles.trkRow}>
                      <div className={styles.trkCoIco} style={{ background: item.color }}>{item.co[0]}</div>
                      <span className={styles.trkCoName}>{item.co} — {item.role}</span>
                      <span className={styles.trkStatus} style={{ background: item.badge.bg, color: item.badge.text }}>{item.status}</span>
                      <span className={styles.trkDays}>Day {item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Salary Intelligence */}
          <div className={cn(styles.bentoCard, styles.span4)}>
            <Reveal delay={0.1}>
              <div className={styles.bentoIcon} style={{ background: "rgba(20,184,166,0.15)" }}>
                <DollarSign size={22} color="#14b8a6" strokeWidth={1.8} />
              </div>
              <div className={styles.bentoTitle}>Salary Intelligence</div>
              <div className={styles.bentoDesc}>See real salary bands before you apply. Then let AI coach you on how to negotiate your offer with actual leverage points.</div>
              <div className={styles.salPreview}>
                <div className={styles.salHeader}>SENIOR FRONTEND · STRIPE · SF</div>
                <div className={styles.salVal}>$195K <span className={styles.salAvg}>avg</span></div>
                <div className={styles.salChartOuter}>
                  <div className={styles.salChartInner}>
                    <div className={styles.salChartFill}></div>
                  </div>
                </div>
                <div className={styles.salLabels}>
                  <span>$165K floor</span><span>$240K ceiling</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Career Path */}
          <div className={cn(styles.bentoCard, styles.span3)}>
            <Reveal delay={0.2}>
              <div className={styles.bentoIcon} style={{ background: "rgba(192,132,252,0.15)" }}>
                <Map size={22} color="#c084fc" strokeWidth={1.8} />
              </div>
              <div className={styles.bentoTitle}>Career Path Visualizer</div>
              <div className={styles.bentoDesc}>AI maps 3–5 career trajectories from where you are today. See the skills, timeline, and transitions.</div>
              <div className={styles.pathList}>
                <div className={cn(styles.pathItem, styles.pathItemActive)}>
                  <div className={styles.pathDot} style={{ background: "#6366f1" }}></div>Senior Engineer → Staff
                </div>
                <div className={styles.pathItem}>
                  <div className={styles.pathDot} style={{ background: "#475569" }}></div>Senior → Eng Manager
                </div>
                <div className={styles.pathItem}>
                  <div className={styles.pathDot} style={{ background: "#475569" }}></div>Senior → Founding Engineer
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- SPOTLIGHT: INTERVIEW SIMULATOR --- */}
      <section className={styles.spotlight}>
        <div className={styles.spotlightInner}>
          <div className={styles.spotlightLeft}>
            <Reveal>
              <div className={styles.sectionBadge} style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", color: "#c7d2fe" }}>
                <Video size={12} strokeWidth={2.5} />
                Interview Simulator
              </div>
              <h2 className={styles.sectionTitle} style={{ color: "#f8fafc" }}>Practice until<br />you can't fail</h2>
              <p className={styles.sectionSub} style={{ color: "rgba(199,210,254,0.75)" }}>Our AI interviewer knows the exact role, the company's hiring signals, and what answers actually impress hiring managers.</p>
              <div className={styles.spotlightFeatList}>
                {[
                  "Role-specific questions from real JDs",
                  "Live scoring: clarity, depth, confidence",
                  "Full debrief + example model answers",
                  "Behavioral, technical & system design modes"
                ].map((text, i) => (
                  <div key={i} className={styles.spotlightFeat}>
                    <div className={styles.spotlightFeatIco}><Check size={12} /></div>
                    {text}
                  </div>
                ))}
              </div>
              <Link href="/login" className={cn(styles.btnHero, styles.primary)}>
                Try a mock interview
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </Reveal>
          </div>
          <div className={styles.spotlightRight}>
            <Reveal delay={0.3}>
              <div className={styles.interviewUi}>
                <div className={styles.intUiHdr}>
                  <div className={styles.intAvatar}>AI</div>
                  <div className={styles.intHdrMeta}>
                    <div className={styles.intHdrTitle}>TalentFlow Interviewer</div>
                    <div className={styles.intHdrSub}>Stripe · Senior Frontend Engineer</div>
                  </div>
                  <div className={styles.intSessionBadge}>Live Session</div>
                </div>
                <div className={styles.intBody}>
                  <div className={cn(styles.intMsg, styles.intMsgBot)}>
                    "Walk me through how you'd architect a large-scale React application to handle 10M users. Focus on state management and performance."
                  </div>
                  <div className={cn(styles.intMsg, styles.intMsgUser)}>
                    "I'd start with a micro-frontend architecture using Module Federation, then implement Zustand for local state..."
                  </div>
                  <div className={styles.intFeedbackBox}>
                    <div className={styles.intFbTitle}>✅ Strong response detected</div>
                    <div className={styles.intFbText}>Good use of specific technologies. Consider mentioning code-splitting strategy for a complete answer.</div>
                    <div className={styles.intFbScores}>
                      <span className={cn(styles.intScBadge, styles.intScBadgeGood)}>Clarity: 92%</span>
                      <span className={cn(styles.intScBadge, styles.intScBadgeGood)}>Depth: 87%</span>
                      <span className={styles.intScBadge}>Confidence: 74%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how" className={styles.howSection}>
        <div className={styles.sectionHeader} style={{ textAlign: "center" }}>
          <Reveal>
            <div className={styles.sectionBadge} style={{ margin: "0 auto 20px" }}>
              <Zap size={12} strokeWidth={2.5} />
              Simple process
            </div>
            <h2 className={styles.sectionTitle}>Up and running in 5 minutes</h2>
            <p className={styles.sectionSub} style={{ margin: "0 auto" }}>No resume? No problem. Start from scratch or paste what you have — TalentFlow does the rest.</p>
          </Reveal>
        </div>
        <div className={styles.steps}>
          {[
            { num: 1, title: "Create your profile", desc: "Tell us your name, target role, and experience level. Or paste your existing resume automatically." },
            { num: 2, title: "AI builds your toolkit", desc: "Your resume gets written, scored, and tailored. Your interview simulator is loaded with role-specific questions." },
            { num: 3, title: "Apply with confidence", desc: "Browse matched jobs, apply with a tailored resume in one click, and walk into interviews prepared." }
          ].map((step, i) => (
            <div key={i} className={styles.step}>
              <Reveal delay={i * 0.1}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className={styles.testiSection}>
        <div className={styles.sectionHeader} style={{ textAlign: "center" }}>
          <Reveal>
            <div className={styles.sectionBadge} style={{ margin: "0 auto 20px" }}>
              <Star size={12} fill="currentColor" />
              Real results
            </div>
            <h2 className={styles.sectionTitle}>Hired at their dream companies</h2>
          </Reveal>
        </div>
        <div className={styles.testiGrid}>
          {[
            { 
              name: "Arjun Reddy", 
              role: "Senior Frontend Engineer", 
              co: "Stripe", 
              quote: "The interview simulator is genuinely scary good. It asked me the exact question Stripe asked in my actual interview — word for word.",
              initials: "AR",
              grad: "linear-gradient(135deg,#6366f1,#8b5cf6)"
            },
            { 
              name: "Sana Khan", 
              role: "Product Designer", 
              co: "Figma", 
              quote: "I went from 0 callbacks in 3 weeks to 4 interviews in one week. The resume tailor found keywords I'd never have thought to include.",
              initials: "SK",
              grad: "linear-gradient(135deg,#10b981,#14b8a6)"
            },
            { 
              name: "Marcus Powell", 
              role: "Full Stack Engineer", 
              co: "Vercel", 
              quote: "The ghosting tracker changed everything for me. I actually negotiated a $22K higher offer using the salary tool.",
              initials: "MP",
              grad: "linear-gradient(135deg,#f59e0b,#ef4444)"
            }
          ].map((item, i) => (
            <div key={i} className={styles.testiCard}>
              <Reveal delay={i * 0.1}>
                <div className={styles.testiStars}>
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className={styles.testiQuote}>"{item.quote}"</p>
                <div className={styles.testiPerson}>
                  <div className={styles.testiAv} style={{ background: item.grad }}>{item.initials}</div>
                  <div>
                    <div className={styles.testiName}>{item.name}</div>
                    <div className={styles.testiRole}>{item.role}</div>
                    <div className={styles.testiCompany}>Now at {item.co}</div>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.sectionHeader} style={{ textAlign: "center" }}>
          <Reveal>
            <div className={styles.sectionBadge} style={{ margin: "0 auto 20px" }}>
              <DollarSign size={12} />
              Simple pricing
            </div>
            <h2 className={styles.sectionTitle}>Start free, upgrade when hired</h2>
          </Reveal>
        </div>
        <div className={styles.pricingGrid}>
          {[
            { 
              name: "FREE", 
              price: "0", 
              sub: "forever free", 
              desc: "Everything to get started.", 
              feats: ["5 AI resumes / mo", "3 interviews / week", "Job tracker", "Basic ATS scoring"],
              noFeats: ["Salary intelligence", "Career path visualizer"],
              btn: "Get started free"
            },
            { 
              name: "PRO", 
              price: "19", 
              sub: "per month", 
              desc: "For serious job seekers.", 
              feats: ["Unlimited resumes", "Unlimited interviews", "Salary intelligence", "Career path visualizer", "Priority matching", "AI Cover Letters"],
              featured: true,
              btn: "Start 7-day free trial"
            },
            { 
              name: "TEAMS", 
              price: "49", 
              sub: "per seat / mo", 
              desc: "For bootcamps & centers.", 
              feats: ["Everything in Pro", "Admin dashboard", "Bulk resume review", "Cohort analytics", "Dedicated success", "SSO & Integrations"],
              btn: "Contact sales →"
            }
          ].map((plan, i) => (
            <div key={i} className={cn(styles.pricingCard, plan.featured && styles.pricingFeatured)}>
              <Reveal delay={i * 0.1}>
                {plan.featured && <div className={styles.pricingTag}>Most popular</div>}
                <div className={styles.pricingPlanName}>{plan.name}</div>
                <div className={styles.pricingPrice}><sup>$</sup>{plan.price}</div>
                <div className={styles.pricingPriceSub}>{plan.sub}</div>
                <div className={styles.pricingPlanDesc}>{plan.desc}</div>
                <ul className={styles.pricingFeats}>
                  {plan.feats.map((f, fi) => (
                    <li key={fi} className={styles.pricingFeat}>
                      <div className={cn(styles.pricingCheck, styles.checkYes)}><Check size={10} strokeWidth={3} /></div>
                      {f}
                    </li>
                  ))}
                  {plan.noFeats?.map((f, fi) => (
                    <li key={`no-${fi}`} className={styles.pricingFeat}>
                      <div className={cn(styles.pricingCheck, styles.checkNo)}><X size={10} strokeWidth={3} /></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(styles.pricingBtn, plan.featured && styles.pricingBtnHero)}>{plan.btn}</button>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className={styles.finalCta}>
        <Reveal>
          <div className={styles.ctaInner}>
            <h1 className={styles.ctaTitle}>Your next job is closer<br />than you think</h1>
            <p className={styles.ctaSub}>Join 14,200+ candidates who landed interviews at dream companies. Start free in under 60 seconds.</p>
            <div className={styles.ctaBtns}>
              <Link href="/login" className={cn(styles.btnHero, styles.primary)}>
                <Rocket size={16} />
                Get started — it's free
              </Link>
              <button className={cn(styles.btnHero, styles.secondary)} style={{ borderColor: "rgba(255,255,255,0.25)", color: "#c7d2fe" }}>
                Book a demo
              </button>
            </div>
            <div className={styles.ctaFooter}>
              <span>✓ No card required</span>
              <span>✓ Free forever plan</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --- FOOTER --- */}
      <footer className={styles.footer}>
        <div className={styles.footBrand}>
          <Link className={styles.footLogo} href="/">
            <div className={styles.footLogoIco}>T</div>
            <span className={styles.footLogoTxt}>TalentFlow</span>
          </Link>
          <p className={styles.footDesc}>AI-powered career platform helping ambitious people land jobs at dream companies.</p>
        </div>
        {[
          { title: "PRODUCT", links: ["Features", "Interview Simulator", "Resume AI", "Pricing"] },
          { title: "COMPANY", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "RESOURCES", links: ["Resume templates", "Interview guides", "Salary database"] }
        ].map((col, i) => (
          <div key={i}>
            <div className={styles.footColTitle}>{col.title}</div>
            <ul className={styles.footLinks}>
              {col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </footer>
      <div className={styles.footBottom}>
        <div className={styles.footBottomLeft}>© 2026 TalentFlow Inc. All rights reserved.</div>
        <div className={styles.footBottomRight}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
