'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, Loader2, Shield, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, status, isAdmin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as admin, redirect immediately
  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      router.replace('/admin');
    } else if (status === 'authenticated' && !isAdmin) {
      setError('Access denied. This portal is for administrators only.');
    }
  }, [status, isAdmin, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your admin email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      if (user?.role !== 'ADMIN') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid credentials. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at 60% 20%, #1e2d4d 0%, #0f172a 60%, #09090b 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 32px rgba(99,102,241,0.4)',
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            FurNest Admin
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Restricted area — Admin access only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.5rem',
            }}>
              <AlertCircle size={16} color="#f87171" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@furnest.com"
                style={{
                  width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.875rem 3rem 0.875rem 1rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                background: submitting ? '#4338ca' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: submitting ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.2s', opacity: submitting ? 0.8 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Authenticating…
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1.5rem',
        }}>
          Not an admin?{' '}
          <a href="/" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
            Return to store →
          </a>
        </p>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
