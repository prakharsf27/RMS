'use client';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <Loader2 
          size={48} 
          style={{
            animation: 'spin 1s linear infinite',
            color: 'var(--primary)'
          }} 
        />
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      <h2 style={{
        marginTop: '2rem',
        fontSize: '1.25rem',
        fontWeight: '600',
        letterSpacing: '-0.025em',
        background: 'var(--premium-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Loading TalentFlow...
      </h2>
    </div>
  );
}
