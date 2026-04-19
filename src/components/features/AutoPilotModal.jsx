'use client';
import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Bot, CheckCircle, RefreshCcw, Briefcase, FileText, Send } from "lucide-react";

export default function AutoPilotModal({ isOpen, onClose, selectedJobs = [] }) {
  const [step, setStep] = useState(0); // 0: Config, 1: Running, 2: Done
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setLogs([]);
      setProgress(0);
    }
  }, [isOpen]);

  const handleStart = () => {
    if (selectedJobs.length === 0) {
      alert("No matching jobs to auto-apply right now. Adjust your filters and try again.");
      return;
    }
    setStep(1);
    simulateAutoPilot(selectedJobs);
  };

  const simulateAutoPilot = (jobsArr) => {
     let currentIdx = 0;
     const totalSteps = jobsArr.length * 3; // parse, cover letter, submit
     let completedSteps = 0;

     const processNext = () => {
        if (currentIdx >= jobsArr.length) {
           setStep(2);
           return;
        }

        const job = jobsArr[currentIdx];
        
        // 1. Parsing
        setTimeout(() => {
           setLogs(prev => [...prev, `[${job.title}] Extracting ATS keywords from JD...`]);
           completedSteps++;
           setProgress(Math.round((completedSteps / totalSteps) * 100));
           
           // 2. Cover Letter
           setTimeout(() => {
             setLogs(prev => [...prev, `[${job.title}] AI drafting tailored cover letter...`]);
             completedSteps++;
             setProgress(Math.round((completedSteps / totalSteps) * 100));
             
             // 3. Submit
             setTimeout(() => {
                setLogs(prev => [...prev, `[${job.title}] ✅ Successfully submitted application`]);
                completedSteps++;
                setProgress(Math.round((completedSteps / totalSteps) * 100));
                
                currentIdx++;
                processNext();
             }, 800);
           }, 1000);
        }, 800);
     };

     processNext();
  };

  return (
     <Modal isOpen={isOpen} onClose={step === 1 ? () => {} : onClose} title="Application Auto-Pilot">
        <div style={{ padding: '10px 0' }}>
           {step === 0 && (
              <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                 <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', marginBottom: '16px' }}>
                    <Bot size={48} />
                 </div>
                 <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>Set Your Job Hunt on Assembly Line</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                    Auto-Pilot will parse the {selectedJobs.length} active jobs that currently match your dashboard filters. For each job, Claude will automatically draft a custom cover letter and submit your profile queue.
                 </p>
                 <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Workload Summary</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                       <span>Matching Roles:</span> <strong>{selectedJobs.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                       <span>Estimated Time:</span> <strong>&lt; 2 mins</strong>
                    </div>
                 </div>
                 <Button onClick={handleStart} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                    Initialize Auto-Pilot Sequence
                 </Button>
              </div>
           )}

           {step === 1 && (
             <div className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <RefreshCcw size={32} className="animate-spin" style={{ color: 'var(--primary-color)', margin: '0 auto 16px' }} />
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Processing Applications</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Please do not close this window.</p>
                </div>

                <div style={{ 
                    height: '8px', width: '100%', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' 
                }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                </div>

                <div style={{ 
                    background: '#000', borderRadius: '8px', padding: '16px', height: '200px', overflowY: 'auto', 
                    fontFamily: 'monospace', fontSize: '12px', color: '#10b981', border: '1px solid var(--border-color)' 
                }}>
                    {logs.map((log, i) => (
                       <div key={i} style={{ marginBottom: '8px', opacity: i === logs.length -1 ? 1 : 0.6 }}>
                          &gt; {log}
                       </div>
                    ))}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>
             </div>
           )}

           {step === 2 && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                 <CheckCircle size={56} style={{ color: 'var(--success-color)', margin: '0 auto 16px' }} />
                 <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>Batch Completed Successfully</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    Applied to {selectedJobs.length} roles. Your Candidate CRM has been automatically updated to track these new pipeline additions.
                 </p>
                 <Button onClick={onClose} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                    View My Applications
                 </Button>
              </div>
           )}
        </div>
     </Modal>
  )
}
