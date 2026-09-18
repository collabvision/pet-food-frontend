'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/auth/AuthCard';
import FormField from '../../components/auth/FormField';
import FormBanner from '../../components/auth/FormBanner';
import { useAuth } from '../../lib/auth-context';
import { registerSchema, validate } from '../../lib/validation';
import { ApiError } from '../../lib/api';

const initialValues = { name: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
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
    const { data, fieldErrors } = validate(registerSchema, values);
    setErrors(fieldErrors);
    if (!data) return;

    setSubmitting(true);
    try {
      await register(data);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join FurNest for happier, healthier pets.">
      <form onSubmit={handleSubmit} noValidate>
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        <FormField label="Full name" error={errors.name} htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            className="field-input"
            required
          />
        </FormField>

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

        <FormField label="Password" error={errors.password} htmlFor="password">
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

        <FormField label="Confirm password" error={errors.confirmPassword} htmlFor="confirmPassword">
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

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-navy/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-coral hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
