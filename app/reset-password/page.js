'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '../../components/auth/AuthCard';
import FormField from '../../components/auth/FormField';
import FormBanner from '../../components/auth/FormBanner';
import { useAuth } from '../../lib/auth-context';
import { resetPasswordSchema, validate } from '../../lib/validation';
import { ApiError } from '../../lib/api';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!token) {
      setFormError('This reset link is invalid or has expired. Please request a new one.');
      return;
    }

    const { data, fieldErrors } = validate(resetPasswordSchema, values);
    setErrors(fieldErrors);
    if (!data) return;

    setSubmitting(true);
    try {
      await resetPassword({ token, password: data.password });
      router.push('/login?reset=1');
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'This reset link is invalid or has expired. Please request a new one.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Make it something you haven't used before.">
      {!token && (
        <FormBanner tone="error">
          This link is missing its reset token. Please{' '}
          <Link href="/forgot-password" className="font-semibold underline">
            request a new one
          </Link>
          .
        </FormBanner>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        <FormField label="New password" error={errors.password} htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            className="field-input"
            required
            minLength={8}
          />
        </FormField>

        <FormField label="Confirm new password" error={errors.confirmPassword} htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            className="field-input"
            required
          />
        </FormField>

        <button type="submit" disabled={submitting || !token} className="btn-primary w-full">
          {submitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </AuthCard>
  );
}
