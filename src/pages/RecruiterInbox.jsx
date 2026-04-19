import { useState } from "react";
import { FileText, Eye, AlertTriangle, CheckCircle, RefreshCcw, Download } from "lucide-react";
import styles from "./RecruiterInbox.module.css";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function RecruiterInbox() {
  const [resumeText, setResumeText] = useState("");
  const [parsedResume, setParsedResume] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  // Simulate ATS Parsing
  const simulateATSParse = () => {
    if (!resumeText.trim()) return;
    setIsParsing(true);
    
    setTimeout(() => {
      // Simulate typical ATS mangling:
      // - Removes multiple spaces/newlines
      // - Discards fancy bullets and replaces them with random chars or concats
      // - Extracts contact info poorly
      
      const lines = resumeText.split("\n").filter(l => l.trim().length > 0);
      
      let parsed = lines.map(line => {
        // Strip emojis
        let mangled = line.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
        // Strip special bullets
        mangled = mangled.replace(/[•▪▸❖]/g, '*');
        
        // Randomly squish some lines (simulate bad newline parsing)
        if (Math.random() > 0.8) {
          mangled += " ";
        }
        return mangled;
      }).join("\n");

      // Extract mock scores
      const hasEmail = /@/.test(resumeText);
      const hasPhone = /\d{3}[.\- ]?\d{3}[.\- ]?\d{4}/.test(resumeText);
      
      setParsedResume({
        rawText: parsed,
        missingFields: [
          !hasEmail && "Email Address", 
          !hasPhone && "Phone Number", 
          !/20\d{2}/.test(resumeText) && "Graduation/Work Dates"
        ].filter(Boolean),
        readabilityScore: Math.floor(Math.random() * 30) + 40 // ATS readability is notoriously harsh
      });
      setIsParsing(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Recruiter Inbox Simulator</h1>
        <p style={{ color: "var(--text-secondary)" }}>See what your resume actually looks like when passed through an enterprise Applicant Tracking System (ATS).</p>
      </div>

      <div className={styles.container}>
        {/* Left Side: Input */}
        <Card className={styles.inputCard}>
          <div className={styles.cardHeader}>
            <FileText size={18} />
            <h3>Your Resume</h3>
          </div>
          <p className={styles.helperText}>Paste your formatted resume text here to see how an ATS strips and analyzes it.</p>
          <textarea 
            className={styles.textarea}
            placeholder="John Doe\njohn@example.com | 555-0123\n\nExperience\n• Led a team of 5 engineers to build..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <Button onClick={simulateATSParse} disabled={!resumeText.trim() || isParsing} className={styles.actionBtn}>
             {isParsing ? "Parsing..." : "Simulate ATS Parse"} <RefreshCcw size={16} className={isParsing ? "animate-spin" : ""} />
          </Button>
        </Card>

        {/* Right Side: Output */}
        <Card className={styles.outputCard}>
          <div className={styles.cardHeader}>
            <Eye size={18} />
            <h3>Recruiter View (ATS Database)</h3>
          </div>
          
          {!parsedResume && !isParsing && (
            <div className={styles.emptyState}>
              <AlertTriangle size={32} opacity={0.2} />
              <p>Paste your resume and parse it to see the results.</p>
            </div>
          )}

          {isParsing && (
            <div className={styles.parsingState}>
              <RefreshCcw size={32} className="animate-spin" style={{ color: "var(--primary-color)" }} />
              <p>Extracting entities and normalizing text...</p>
            </div>
          )}

          {parsedResume && !isParsing && (
            <div className={styles.resultsGrid}>
               <div className={styles.metricsRow}>
                  <div className={styles.metricBox}>
                     <span className={styles.metricLabel}>ATS Readability</span>
                     <span className={styles.metricValue} style={{ color: parsedResume.readabilityScore > 60 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {parsedResume.readabilityScore}%
                     </span>
                  </div>
                  <div className={styles.metricBox}>
                     <span className={styles.metricLabel}>Detected Issues</span>
                     <span className={styles.metricValue}>{parsedResume.missingFields.length || "None"}</span>
                  </div>
               </div>

               {parsedResume.missingFields.length > 0 && (
                 <div className={styles.warnings}>
                    <h4><AlertTriangle size={14} /> Missing Critical Fields</h4>
                    <ul>
                      {parsedResume.missingFields.map((f, i) => <li key={i}>{f} not detected automatically</li>)}
                    </ul>
                 </div>
               )}

               <div className={styles.parsedOutputBox}>
                 <h4>Plaintext Extraction result:</h4>
                 <pre className={styles.preformatted}>
                   {parsedResume.rawText}
                 </pre>
                 <div className={styles.disclaimer}>
                   * Recruiters often scan this mangled text before ever looking at your PDF attachment.
                 </div>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
