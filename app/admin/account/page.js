'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/services';
import {
  User, Mail, Shield, Key, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Loader2, Lock, BadgeCheck, Phone,
  Camera, Edit3
} from 'lucide-react';

export default function AdminAccountPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState(null); // { type: 'success'|'error', text }

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage(null);

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      setPwMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    try {
      setPwLoading(true);
      await authService.changePassword(
        pwForm.currentPassword,
        pwForm.newPassword,
        pwForm.confirmNewPassword
      );
      setPwMessage({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwMessage({ type: 'error', text: err?.message || 'Failed to change password. Check your current password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 0 3rem' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e2338', margin: 0 }}>
          My Account
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Manage your admin profile and security settings
        </p>
      </div>

      {/* Profile Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2338 0%, #2d3a5f 100%)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(99,102,241,0.15)',
        }} />
        <div style={{
          position: 'absolute', right: '80px', bottom: '-60px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.1)',
        }} />

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: 'white',
            border: '3px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            {initials}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#10b981', border: '2px solid #1e2338',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>
              {user?.name || 'Administrator'}
            </h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '999px', padding: '0.2rem 0.75rem',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
            }}>
              <Shield size={11} />
              ADMIN
            </span>
          </div>
          <p style={{ color: '#94a3b8', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
            {user?.email || '—'}
          </p>
          {user?.isEmailVerified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
              <BadgeCheck size={14} color="#10b981" />
              <span style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 600 }}>Email verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        background: '#f3f4f6', borderRadius: '12px', padding: '4px',
        marginBottom: '1.5rem', width: 'fit-content',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1.25rem', borderRadius: '9px', border: 'none',
                background: active ? 'white' : 'transparent',
                color: active ? '#1e2338' : '#6b7280',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem', cursor: 'pointer',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ─────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #e5e7eb', padding: '2rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e2338', marginTop: 0, marginBottom: '1.5rem' }}>
            Account Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <InfoField icon={<User size={15} color="#6366f1" />} label="Full Name" value={user?.name || '—'} />
            <InfoField icon={<Mail size={15} color="#6366f1" />} label="Email Address" value={user?.email || '—'} />
            <InfoField icon={<Shield size={15} color="#6366f1" />} label="Role" value={user?.role || 'ADMIN'} badge />
            <InfoField
              icon={<BadgeCheck size={15} color="#6366f1" />}
              label="Email Status"
              value={user?.isEmailVerified ? 'Verified' : 'Not Verified'}
              verified={user?.isEmailVerified}
            />
            <InfoField icon={<Key size={15} color="#6366f1" />} label="User ID" value={user?.id || user?._id || '—'} mono />
          </div>

          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.25rem',
            background: '#fafafa', border: '1px solid #e5e7eb',
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <AlertCircle size={16} color="#6366f1" />
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
              Profile details are managed by your super administrator. Contact support to update your name or email.
            </p>
          </div>
        </div>
      )}

      {/* ── Security Tab ──────────────────────────────────── */}
      {activeTab === 'security' && (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #e5e7eb', padding: '2rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e2338', marginTop: 0, marginBottom: '0.35rem' }}>
            Change Password
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 0, marginBottom: '1.75rem' }}>
            Use a strong password with at least 8 characters, including numbers and symbols.
          </p>

          {/* Status Banner */}
          {pwMessage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.5rem',
              background: pwMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${pwMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: pwMessage.type === 'success' ? '#166534' : '#991b1b',
            }}>
              {pwMessage.type === 'success'
                ? <CheckCircle size={16} />
                : <AlertCircle size={16} />}
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{pwMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} noValidate style={{ maxWidth: '460px' }}>
            {[
              { name: 'currentPassword', label: 'Current Password', key: 'current', autoComplete: 'current-password' },
              { name: 'newPassword', label: 'New Password', key: 'new', autoComplete: 'new-password' },
              { name: 'confirmNewPassword', label: 'Confirm New Password', key: 'confirm', autoComplete: 'new-password' },
            ].map((field) => (
              <div key={field.name} style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.825rem', fontWeight: 600,
                  color: '#374151', marginBottom: '0.5rem',
                }}>
                  {field.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[field.key] ? 'text' : 'password'}
                    name={field.name}
                    value={pwForm[field.name]}
                    onChange={handlePwChange}
                    autoComplete={field.autoComplete}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '0.75rem 3rem 0.75rem 1rem',
                      borderRadius: '10px', border: '1.5px solid #d1d5db',
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                      color: '#111827', background: '#fafafa', transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((p) => ({ ...p, [field.key]: !p[field.key] }))}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
                    }}
                  >
                    {showPw[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={pwLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '10px', border: 'none',
                background: pwLoading ? '#818cf8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontSize: '0.9rem', fontWeight: 700,
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {pwLoading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
                : <><Save size={16} /> Update Password</>}
            </button>
          </form>

          {/* Security Tips */}
          <div style={{
            marginTop: '2rem', padding: '1.25rem',
            background: '#f8faff', border: '1px solid #e0e7ff',
            borderRadius: '12px',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.825rem', fontWeight: 700, color: '#4338ca' }}>
              🔐 Security Tips
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.8 }}>
              <li>Use at least 8 characters with uppercase, numbers, and symbols</li>
              <li>Never reuse passwords from other sites</li>
              <li>Change your password regularly (every 90 days)</li>
              <li>Never share your admin credentials with anyone</li>
            </ul>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function InfoField({ icon, label, value, badge, verified, mono }) {
  return (
    <div style={{
      padding: '1rem', borderRadius: '12px',
      background: '#fafafa', border: '1px solid #e5e7eb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        {icon}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: mono ? '0.75rem' : '0.9rem',
          fontWeight: badge || verified !== undefined ? 600 : 500,
          color: verified === false ? '#dc2626' : '#1e2338',
          fontFamily: mono ? 'monospace' : 'inherit',
          wordBreak: 'break-all',
        }}>
          {value}
        </span>
        {badge && (
          <span style={{
            background: '#ede9fe', color: '#7c3aed',
            borderRadius: '999px', padding: '0.1rem 0.6rem',
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            {value}
          </span>
        )}
        {verified === true && <BadgeCheck size={14} color="#10b981" />}
        {verified === false && <AlertCircle size={14} color="#dc2626" />}
      </div>
    </div>
  );
}
