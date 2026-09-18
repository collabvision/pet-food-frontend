'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '../../components/auth/AuthCard';
import FormField from '../../components/auth/FormField';
import FormBanner from '../../components/auth/FormBanner';
import { useAuth } from '../../lib/auth-context';
import { verifyEmailSchema, validate } from '../../lib/validation';
import { ApiError } from '../../lib/api';

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const { verifyEmail, resendVerification } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [values, setValues] = useState({ email: searchParams.get('email') || '', code: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    const { data, fieldErrors } = validate(verifyEmailSchema, values);
    setErrors(fieldErrors);
    if (!data) return;

    setSubmitting(true);
    try {
      await verifyEmail(data);
      router.push('/login?verified=1');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    const { data, fieldErrors } = validate(verifyEmailSchema.pick({ email: true }), { email: values.email });
    if (!data) {
      setErrors((e) => ({ ...e, email: fieldErrors.email }));
      return;
    }
    setFormError('');
    setSuccess('');
    try {
      await resendVerification(data);
      setSuccess('A new verification code is on its way to your inbox.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not resend the code. Please try again.');
    }
  }

  return (
    <AuthCard title="Verify your email" subtitle="Enter the code we emailed you to activate your account.">
      <form onSubmit={handleSubmit} noValidate>
        {formError && <FormBanner tone="error">{formError}</FormBanner>}
        {success && <FormBanner tone="success">{success}</FormBanner>}

        <FormField label="Email address" error={errors.email} htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            className="field-input"
            required
          />
        </FormField>

        <FormField label="Verification code" error={errors.code} htmlFor="code">
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={values.code}
            onChange={handleChange}
            className="field-input tracking-widest"
            placeholder="000000"
            required
          />
        </FormField>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="mt-4 w-full text-center text-sm font-medium text-coral hover:underline disabled:cursor-not-allowed disabled:text-navy/40 disabled:no-underline"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}
      </button>

      <p className="mt-5 text-center text-sm text-navy/60">
        Wrong email?{' '}
        <Link href="/register" className="font-semibold text-coral hover:underline">
          Start over
        </Link>
      </p>
    </AuthCard>
  );
}
