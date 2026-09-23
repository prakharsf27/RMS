'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, ArrowRight, RotateCw, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Button } from "../components/ui/Button";
import styles from "./VerifyEmail.module.css";
import { cn } from "../lib/utils";

export default function VerifyEmail() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const inputsRef = useRef([]);

  // Redirect if already verified or demo account
  useEffect(() => {
    if (user) {
      if (user.isDemoAccount || user.emailVerified || user.isEmailVerified) {
        if (user.onboardingCompleted) {
          router.replace('/dashboard');
        } else {
          router.replace('/onboarding');
        }
      }
    }
  }, [user?.emailVerified, user?.isEmailVerified, user?.onboardingCompleted, user?.isDemoAccount, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric digit
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      // Handle paste of multiple digits
      const digits = value.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    setError("");
    const targetIdx = Math.min(digits.length, 5);
    inputsRef.current[targetIdx]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setIsVerifying(true);
    setError("");
    try {
      const email = user?.email;
      const { data } = await api.post('/auth/verify-email-otp', {
        email,
        otp: code
      });

      setSuccessMsg("Email verified successfully! Redirecting...");
      
      // Update local storage and context immediately
      if (data.user) {
        updateUser(data.user);
        localStorage.setItem("rms_user", JSON.stringify(data.user));
      } else {
        updateUser({ emailVerified: true, isEmailVerified: true });
      }

      setTimeout(() => {
        router.replace(data.user?.onboardingCompleted ? '/dashboard' : '/onboarding');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setSuccessMsg("");
    try {
      const email = user?.email;
      const { data } = await api.post('/auth/send-email-otp', { email });
      setSuccessMsg("A fresh 6-digit code has been sent to your email.");
      setCooldown(data.cooldownSeconds || 60);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Mail size={28} />
        </div>

        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          We sent a 6-digit verification code to<br />
          <span className={styles.emailHighlight}>{user?.email || 'your email address'}</span>
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

        <form onSubmit={handleVerify}>
          <div className={styles.otpRow} onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={cn(styles.otpInput, digit && styles.otpInputFilled)}
                autoFocus={idx === 0}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className={styles.submitBtn} 
            disabled={isVerifying || otp.join('').length < 6}
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"} <ArrowRight size={16} />
          </Button>
        </form>

        <div className={styles.footerActions}>
          <button 
            type="button" 
            className={styles.resendBtn} 
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>

          <button 
            type="button" 
            className={styles.logoutBtn} 
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            <LogOut size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
