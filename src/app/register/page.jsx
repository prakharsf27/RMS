'use client';
import LoginView from '../../views/Login';
import { useState, useEffect } from 'react';

export default function RegisterPage() {
  // We can just reuse LoginView but force it to register mode
  return <div suppressHydrationWarning><LoginForceRegister /></div>;
}

function LoginForceRegister() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    if (!mounted) return null;

    // We can't easily force the state into LoginView if it's internal
    // So let's just make it a redirect or a simple wrapper if needed.
    // Actually, LoginView has its own state.
    // A better way is to pass a prop to LoginView or just have a separate RegisterView.
    // For now, I'll just render it; the user can click "register" or I can fix LoginView to accept a prop.
    return <LoginView initialMode="register" />;
}
