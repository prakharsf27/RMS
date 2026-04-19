'use client';
import { useState } from "react";
import { Bot, Sparkles, X, Send } from "lucide-react";
import styles from "./AIWidget.module.css";

export const AIWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  
  return (
    <div className={styles.aiWidget}>
      {open && (
        <div className={styles.aiPopup}>
          <div className={styles.aiPopupHeader}>
            <div className={styles.aiPopupTitle}>
              <div className={styles.botIconWrap}>
                <Bot size={13} color="white" />
              </div>
              AI Career Assistant
            </div>
            <button onClick={() => setOpen(false)} className={styles.closeBtn}>
              <X size={15} />
            </button>
          </div>
          <div className={styles.aiMessages}>
            <div className={`${styles.aiMsg} ${styles.bot}`}>👋 Hi! I found 3 new jobs matching your profile. Want me to tailor your resume?</div>
            <div className={`${styles.aiMsg} ${styles.user}`}>Yes, please review my resume.</div>
            <div className={`${styles.aiMsg} ${styles.bot}`}>✅ Analyzing... I suggest emphasizing React performance and TypeScript experience. Shall I make these changes?</div>
          </div>
          <div className={styles.aiInputRow}>
            <input 
              className={styles.aiInput} 
              placeholder="Ask me anything..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && setInput("")}
            />
            <button className={styles.aiSend} onClick={() => setInput("")}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
      <button className={styles.aiFab} onClick={() => setOpen(!open)} aria-label="Open AI Assistant">
        <Sparkles size={22} color="white" />
      </button>
    </div>
  );
};
