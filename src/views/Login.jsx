'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import heroImage from '../assets/media__1774505635430.jpg';
import { cn } from "../lib/utils";

export default function Login({ initialMode = "login" }) {
  const { login, register, user } = useAuth();
  const router = useRouter();
  
  // Guarded client-side redirect when user state becomes active
  useEffect(() => {
    if (user) {
      if (user.isDemoAccount || (user.emailVerified && user.onboardingCompleted)) {
        router.replace('/dashboard');
      } else if (user.emailVerified === false && user.isEmailVerified === false) {
        router.replace('/verify-email');
      } else if (user.onboardingCompleted === false) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);
  
  const [isRegister, setIsRegister] = useState(initialMode === "register");
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
    
    // Safety timeout to prevent infinite "Authenticating" state
    const authTimeout = setTimeout(() => {
        if (isLoggingIn) {
            setIsLoggingIn(false);
            setError("Server response taking too long. Please try again or check your connection.");
        }
    }, 15000);

    try {
      let res;
      if (isRegister) {
        res = await register({ fname, lname, email, password, role });
      } else {
        res = await login(email, password);
      }
      clearTimeout(authTimeout);
      
      if (!res.success) {
        throw new Error(res.error);
      } else {
        const loggedUser = res.user;
        if (loggedUser?.isDemoAccount) {
          router.replace('/dashboard');
        } else if (loggedUser?.emailVerified === false && loggedUser?.isEmailVerified === false) {
          router.replace('/verify-email');
        } else if (loggedUser?.onboardingCompleted === false) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (err) {
      clearTimeout(authTimeout);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async (e, p) => {
    setEmail(e);
    setPassword(p);
    setIsLoggingIn(true);
    setError("");
    try {
        const res = await login(e, p);
        if (!res.success) {
            throw new Error(res.error);
        } else {
            router.push("/dashboard");
        }
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
          src={typeof heroImage === 'string' ? heroImage : (heroImage?.src || heroImage?.default?.src || "/favicon.png")} 
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
        <div className={cn(styles.glowSphere, styles.glowTop)} />
        <div className={cn(styles.glowSphere, styles.glowBottom)} />
        
        <Card glow className={styles.loginCard}>
          <div className={styles.header}>
            <h2 className="text-gradient">{isRegister ? "Create an Account" : "Welcome Back"}</h2>
            <p>{isRegister ? "Join the complete recruitment platform" : "Sign in to your account"}</p>
          </div>

          <form onSubmit={handleAuth} className={styles.form}>
            {error && (
              <div className={styles.errorBanner}>
                {error}
                {!isRegister && error.includes("not found") && (
                  <button 
                    type="button" 
                    className={styles.errorLink} 
                    onClick={() => { setIsRegister(true); setError(""); }}
                  >
                    Register instead?
                  </button>
                )}
              </div>
            )}

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
               <div className={styles.roleGroup}>
                 <label>Select Role</label>
                 <select 
                   value={role} 
                   onChange={(e) => setRole(e.target.value)}
                   className={styles.roleSelect}
                 >
                   <option value="candidate">Candidate</option>
                   <option value="recruiter">Recruiter</option>
                 </select>
               </div>
             )}

            <div className={styles.buttonGroup}>
              <Button type="submit" size="lg" className={styles.submitBtn} disabled={isLoggingIn}>
                {isLoggingIn ? "Authenticating..." : (isRegister ? "Register" : "Sign In")}
              </Button>
              <Button 
                type="button" 
                size="lg" 
                variant="outline" 
                className={styles.backHomeBtn}
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </div>

            {/* Quick Enterprise Demo Access */}
            {!isRegister && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
                  Quick Demo Access
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDemoLogin("candidate@rms.com", "password123")}
                    title="Log in as Candidate Aarav Sharma"
                  >
                    Candidate
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDemoLogin("recruiter@rms.com", "password123")}
                    title="Log in as Recruiter Sarah Jenkins"
                  >
                    Recruiter
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDemoLogin("admin@rms.com", "password123")}
                    title="Log in as Administrator Alexander Vance"
                  >
                    Admin
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <button 
              className={styles.toggleBtn}
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
            >
              {isRegister ? "Already have an account? Sign in here" : "Don't have an account? Create one"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
