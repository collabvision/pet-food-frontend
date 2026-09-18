'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, ApiError, setAccessToken, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' -> checking for an existing session on first paint
  // 'authenticated' | 'guest'
  const [status, setStatus] = useState('loading');
  const bootstrapped = useRef(false);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // On first load, try to silently exchange the httpOnly refresh cookie
  // (if any) for a fresh access token + profile. Never trusts anything
  // stored client-side.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!refreshRes.ok) throw new Error('no-session');
        const body = await refreshRes.json();
        const token = body?.data?.accessToken;
        if (!token) throw new Error('no-session');
        setAccessToken(token);

        const me = await api.get('/auth/me');
        setUser(me?.data ?? null);
        setStatus('authenticated');
      } catch {
        clearSession();
      }
    })();
  }, [clearSession]);

  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password }, { auth: false });
    const token = res?.data?.accessToken;
    if (!token) throw new ApiError('Login did not return a session. Please try again.', 500);
    setAccessToken(token);
    setUser(res?.data?.user ?? null);
    setStatus('authenticated');
    return res?.data?.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    return api.post('/auth/register', { name, email, password }, { auth: false });
  }, []);

  const verifyEmail = useCallback(async ({ email, code }) => {
    return api.post('/auth/verify-email', { email, code }, { auth: false });
  }, []);

  const resendVerification = useCallback(async ({ email }) => {
    return api.post('/auth/resend-verification', { email }, { auth: false });
  }, []);

  const forgotPassword = useCallback(async ({ email }) => {
    return api.post('/auth/forgot-password', { email }, { auth: false });
  }, []);

  const resetPassword = useCallback(async ({ token, password }) => {
    return api.post('/auth/reset-password', { token, password }, { auth: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    status, // 'loading' | 'authenticated' | 'guest'
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
