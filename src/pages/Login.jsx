import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import styles from "./Login.module.css";
import heroImage from '../assets/media__1774505635430.jpg';

export default function Login() {
  const { login, register } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [role, setRole] = useState("candidate");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    
    try {
      if (isRegister) {
        await register(fname, lname, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async (e, p) => {
    setEmail(e);
    setPassword(p);
    setIsLoggingIn(true);
    try {
        await login(e, p);
    } catch (err) {
        setError(err.response?.data?.message || err.message);
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <img 
          src={heroImage} 
          alt="TalentFlow RMS Hero" 
          className={styles.heroImage} 
        />
        <div className={styles.imageOverlay}>
          <div className={styles.brandDisplay}>
            <h1 className="animate-fade-in">TalentFlow <span className="text-gradient">RMS</span></h1>
            <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>Automate and manage your recruitment lifecycle with artificial intelligence and seamless workflows.</p>
            <div className={styles.featureList}>
              <span className="animate-fade-in" style={{ animationDelay: '0.2s' }}>📋 End-to-End Hiring Pipeline</span>
              <span className="animate-fade-in" style={{ animationDelay: '0.3s' }}>👥 Role-Based Dashboards</span>
              <span className="animate-fade-in" style={{ animationDelay: '0.4s' }}>📊 Analytics & Reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <Card glow className={styles.loginCard}>
          <div className={styles.header}>
            <h2 className="text-gradient">{isRegister ? "Create an Account" : "Welcome Back"}</h2>
            <p>{isRegister ? "Join the complete recruitment platform" : "Sign in to your account"}</p>
          </div>

          <form onSubmit={handleAuth} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            {isRegister && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  required
                />
              </div>
            )}

            <Input
              icon={Mail}
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              icon={Lock}
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isRegister && (
               <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                  <button 
                     type="button" 
                     className={styles.forgotBtn} 
                     onClick={() => alert("Password reset logic integrated with Nodemailer.")}
                  >
                     Forgot Password?
                  </button>
               </div>
            )}

            {isRegister && (
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Role</label>
                 <select 
                   value={role} 
                   onChange={(e) => setRole(e.target.value)}
                   style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'inherit' }}
                 >
                   <option value="candidate">Candidate</option>
                   <option value="recruiter">Recruiter</option>
                   
                 </select>
               </div>
            )}

            <Button type="submit" size="lg" className={styles.submitBtn} disabled={isLoggingIn}>
              {isLoggingIn ? "Authenticating..." : (isRegister ? "Register" : "Sign In")}
            </Button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button 
              className={styles.toggleBtn}
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
            >
              {isRegister ? "Already have an account? Sign in here" : "Don't have an account? Create one"}
            </button>
          </div>

          {!isRegister && (
            <div className={styles.demoAccounts}>
              <p>Quick Access Demo</p>
              <div className={styles.demoButtons}>
                <Button size="sm" variant="secondary" className={styles.demoBtn} onClick={() => handleDemoLogin("admin@rms.com", "password123")}>Admin</Button>
                <Button size="sm" variant="secondary" className={styles.demoBtn} onClick={() => handleDemoLogin("recruiter@rms.com", "password123")}>Recruiter</Button>
                <Button size="sm" variant="secondary" className={styles.demoBtn} onClick={() => handleDemoLogin("candidate@rms.com", "password123")}>Candidate</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
