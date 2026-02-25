import React from 'react';

export default function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            flexDirection: 'column',
            gap: '16px',
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--gradient-primary)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                animation: 'pulse-glow 2s ease infinite',
            }}>💎</div>
            <div style={{
                width: '120px',
                height: '3px',
                background: 'var(--border)',
                borderRadius: '99px',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    background: 'var(--gradient-primary)',
                    borderRadius: '99px',
                    animation: 'loading-bar 1.2s ease infinite',
                }} />
            </div>
            <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 80%; margin-left: 10%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
        </div>
    );
}
