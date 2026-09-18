'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-red-500" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 403 || /verify/i.test(err.message)) setNeedsVerification(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <span className="text-3xl">🐾</span>
            <span className="text-2xl font-black text-[#1e2338] tracking-tight">FurNest</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1e2338]">Welcome back!</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Log in to manage your pet&apos;s orders and care.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex flex-col gap-1">
              <span>{error}</span>
              {needsVerification && (
                <Link href={`/verify-email?email=${encodeURIComponent(email)}`} className="font-bold underline text-red-800 w-fit">
                  → Verify your email now
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" noValidate>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="login-email" className="block text-sm font-bold text-[#1e2338] mb-2">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[#1e2338] placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1e2338]/20 focus:border-[#1e2338] transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="login-password" className="block text-sm font-bold text-[#1e2338] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-[#1e2338] placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1e2338]/20 focus:border-[#1e2338] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="mb-6 text-right">
              <Link href="/forgot-password" className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#E84040] hover:bg-[#C83030] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in…</span>
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500 font-medium">
          New to FurNest?{' '}
          <Link href="/register" className="font-bold text-[#1e2338] hover:underline">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
