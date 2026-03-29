import { Mail, Calendar, CheckCircle, XCircle, Info } from "lucide-react";
import { format } from "date-fns";
import styles from "./EmailTemplate.module.css";

export const EmailTemplate = ({ notification }) => {
  if (!notification) return null;

  const getIcon = () => {
    if (notification.subject.toLowerCase().includes("hired")) return <CheckCircle className={styles.iconSuccess} />;
    if (notification.subject.toLowerCase().includes("rejected") || notification.subject.toLowerCase().includes("not moving forward")) return <XCircle className={styles.iconDanger} />;
    return <Info className={styles.iconInfo} />;
  };

  return (
    <div className={styles.emailContainer}>
      <div className={styles.emailHeader}>
        <div className={styles.senderAvatar}>
          <Mail size={20} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.topRow}>
            <span className={styles.senderName}>{notification.sender || "TalentFlow RMS"}</span>
            <span className={styles.timestamp}>{format(new Date(notification.timestamp), "MMM d, h:mm a")}</span>
          </div>
          <h3 className={styles.subject}>{notification.subject}</h3>
        </div>
      </div>
      
      <div className={styles.emailBody}>
        <div className={styles.statusBanner}>
          {getIcon()}
          <span>System Update</span>
        </div>
        
        <p className={styles.greeting}>Dear Candidate,</p>
        <p className={styles.message}>{notification.message}</p>
        
        <div className={styles.footer}>
          <p>Best Regards,</p>
          <p><strong>{notification.sender || "TalentFlow Recruitment Team"}</strong></p>
          <div className={styles.divider}></div>
          <p className={styles.disclaimer}>This is an automated notification from TalentFlow RMS regarding your recent job application status.</p>
        </div>
      </div>
    </div>
  );
};
