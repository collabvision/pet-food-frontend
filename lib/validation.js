import { z } from 'zod';

// These schemas exist to give the person fast, friendly feedback and to stop
// obviously-bad requests before they hit the network. They are NOT a
// security boundary — the backend re-validates everything server-side, and
// nothing here should ever be trusted to enforce authorization or pricing.

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(80),
    email: z.string().trim().email('Enter a valid email address').max(254),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email(),
  code: z
    .string()
    .trim()
    .min(4, 'Enter the code from your email')
    .max(10),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** Runs a zod schema and returns { data } or { fieldErrors }. */
export function validate(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data, fieldErrors: {} };
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? '_form';
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { data: null, fieldErrors };
}
