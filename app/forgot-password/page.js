'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '../../components/auth/AuthCard';
import FormField from '../../components/auth/FormField';
import FormBanner from '../../components/auth/FormBanner';
import { useAuth } from '../../lib/auth-context';
import { forgotPasswordSchema, validate } from '../../lib/validation';
import { ApiError } from '../../lib/api';

const GENERIC_SUCCESS = "If an account exists for that email, we've sent a link to reset your password.";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null); // { tone, message }
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBanner(null);
    const { data, fieldErrors } = validate(forgotPasswordSchema, { email });
    setError(fieldErrors.email || '');
    if (!data) return;

    setSubmitting(true);
    try {
      await forgotPassword(data);
      setBanner({ tone: 'success', message: GENERIC_SUCCESS });
    } catch (err) {
      // Deliberately avoid distinguishing "email not found" from other
      // outcomes — that distinction is exactly what lets an attacker
      // enumerate registered accounts. Only surface genuinely actionable
      // errors like rate limiting.
      if (err instanceof ApiError && err.status === 429) {
        setBanner({ tone: 'error', message: err.message });
      } else {
        setBanner({ tone: 'success', message: GENERIC_SUCCESS });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to get back into your account.">
      <form onSubmit={handleSubmit} noValidate>
        {banner && <FormBanner tone={banner.tone}>{banner.message}</FormBanner>}

        <FormField label="Email address" error={error} htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            required
          />
        </FormField>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-navy/60">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-coral hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
