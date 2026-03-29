import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { User, Mail, Shield, Camera, Save, LogOut } from "lucide-react";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    bio: user?.bio || "",
    password: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put("/auth/profile", formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
      // Optionally reload or update context
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="text-gradient">My Profile</h1>
        <p>Manage your account settings and professional identity.</p>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <Card className={styles.avatarCard}>
            <div className={styles.avatarWrapper}>
              <img src={user?.avatar} alt="Profile" className={styles.avatar} />
              <button className={styles.cameraBtn}><Camera size={16} /></button>
            </div>
            <h3 className={styles.userName}>{user?.fname} {user?.lname}</h3>
            <span className={styles.userRole}>{user?.role?.toUpperCase()}</span>
            <div className={styles.badgeRow}>
               <Shield size={14} /> Verified Professional
            </div>
          </Card>
          
          <Card className={styles.statsCard}>
             <div className={styles.statLine}>
                <span>Since</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong>
             </div>
             <div className={styles.statLine}>
                <span>Status</span>
                <strong className="text-success">{user?.status?.toUpperCase()}</strong>
             </div>
          </Card>

          <Button variant="secondary" icon={LogOut} onClick={logout} style={{ width: '100%', marginTop: '1.5rem', color: 'var(--danger)' }}>
            Sign Out
          </Button>
        </aside>

        <main className={styles.main}>
          <Card>
            <div className={styles.formHeader}>
               <h2>General Information</h2>
               {!isEditing && (
                 <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
               )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
               <div className={styles.grid}>
                  <Input 
                    label="First Name" 
                    value={formData.fname} 
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, fname: e.target.value})}
                  />
                  <Input 
                    label="Last Name" 
                    value={formData.lname} 
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  />
               </div>
               
               <Input 
                 label="Email Address" 
                 icon={Mail} 
                 value={formData.email} 
                 disabled={!isEditing}
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
               />

               <div className={styles.bioGroup}>
                  <label>Professional Bio</label>
                  <textarea 
                    value={formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className={styles.textarea}
                  />
               </div>

               {isEditing && (
                  <div className={styles.footerActions}>
                     <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                     </Button>
                  </div>
               )}
            </form>
          </Card>

          <Card className={styles.securityCard}>
             <h2>Security Settings</h2>
             <p>Change your password or manage multi-factor authentication.</p>
             <div className={styles.securityItem}>
                <div>
                   <strong>Account Password</strong>
                   <p>Last changed recently</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Update Password</Button>
             </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
