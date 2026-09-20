'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  PawPrint,
  Heart,
  Bone,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    status,
    isAdmin,
    logout,
  } = useAuth();

  /*
   * Modes:
   *
   * login
   * register
   * verify
   * forgot
   * reset
   */
  const [mode, setMode] = useState('login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const [resetToken, setResetToken] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  /*
   * Read reset token from URL:
   *
   * /login?mode=reset&token=xxxx
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    const urlMode = params.get('mode');
    const token = params.get('token');

    if (urlMode === 'register') {
      setMode('register');
    }

    if (urlMode === 'forgot') {
      setMode('forgot');
    }

    if (urlMode === 'verify') {
      setMode('verify');

      const verificationEmail = params.get('email');

      if (verificationEmail) {
        setEmail(verificationEmail);
      }
    }

    if (urlMode === 'reset') {
      setMode('reset');

      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  /*
   * Already authenticated
   */
  // useEffect(() => {
  //   if (status !== 'authenticated') return;

  //   if (isAdmin) {
  //      window.location.replace('/admin');
  //   } 
  // }, [status, isAdmin]);
  useEffect(() => {
    if (status !== "authenticated") return;

    if (isAdmin) {
      // router.replace("/admin");
      // window.location.replace("/admin");  
    }
  }, [status, isAdmin, router]);

  function clearMessages() {
    setError('');
    setSuccess('');
  }

  function changeMode(newMode) {
    clearMessages();

    setMode(newMode);

    if (newMode === 'login') {
      setPassword('');
      setConfirmPassword('');
      setVerificationCode('');
    }
  }

 async function handleLogin(e) {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      if (!loggedInUser || loggedInUser.role !== "ADMIN") {
        setError("Access denied. This account does not have administrator access.");
        await logout();
        return;
      }

      // Force a hard location change. This ensures cookies are fully sent 
      // and the server-rendered/middleware environment picks up the fresh context.
      window.location.href = "/admin";

    } catch (err) {
      console.error("Admin login error:", err);
      if (err instanceof ApiError) {
        setError(err.message || "Invalid admin credentials.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    clearMessages();

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please create a password.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      /*
       * Registration is pending until email verification.
       */
      setMode('verify');

      setSuccess(
        'Account created! We sent a verification code to your email.'
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || 'Unable to create your account.'
        );
      } else {
        setError(
          'Unable to create your account. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError('Verification code must contain 6 digits.');
      return;
    }

    setSubmitting(true);

    try {
      await verifyEmail({
        email: email.trim(),
        code: verificationCode.trim(),
      });

      setSuccess(
        'Your email has been verified successfully! You can now sign in.'
      );

      setMode('login');

      setPassword('');
      setVerificationCode('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || 'Invalid verification code.'
        );
      } else {
        setError(
          'Unable to verify your email. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setResending(true);

    try {
      await resendVerification({
        email: email.trim(),
      });

      setSuccess(
        'A new verification code has been sent to your email.'
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || 'Unable to resend verification code.'
        );
      } else {
        setError(
          'Unable to resend the verification code.'
        );
      }
    } finally {
      setResending(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);

    try {
      await forgotPassword({
        email: email.trim(),
      });

      setSuccess(
        'If an account exists with this email, password reset instructions have been sent.'
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || 'Unable to process your request.'
        );
      } else {
        setError(
          'Unable to process your request. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    clearMessages();

    if (!resetToken) {
      setError(
        'Invalid or missing password reset token.'
      );
      return;
    }

    if (!password) {
      setError('Please enter your new password.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({
        token: resetToken,
        password,
      });

      setSuccess(
        'Your password has been changed successfully. Please sign in.'
      );

      setPassword('');
      setConfirmPassword('');
      setResetToken('');

      setMode('login');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || 'Unable to reset your password.'
        );
      } else {
        setError(
          'Unable to reset your password. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Dynamic content
   */
  const content = {
    login: {
      eyebrow: 'Welcome back',
      title: 'Happy to see you again',
      description:
        'Sign in to your FurNest account and continue taking care of your furry friend.',
    },

    register: {
      eyebrow: 'Join FurNest',
      title: 'Create your account',
      description:
        'Join our pet-loving community and make every day happier for your furry friend.',
    },

    verify: {
      eyebrow: 'Almost there',
      title: 'Verify your email',
      description:
        'We sent a 6-digit verification code to your email address.',
    },

    forgot: {
      eyebrow: 'Password help',
      title: 'Forgot your password?',
      description:
        'Enter your email and we will send you instructions to create a new password.',
    },

    reset: {
      eyebrow: 'Secure your account',
      title: 'Create a new password',
      description:
        'Choose a strong password that you have not used before.',
    },
  };

  const current = content[mode];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9F2] text-[#142653]">

      {/* =========================================================
          DECORATIONS
      ========================================================= */}

      <div className="pointer-events-none absolute -left-10 top-24 rotate-[-18deg] text-[#FFD7C8]">
        <PawPrint
          size={115}
          strokeWidth={1.3}
        />
      </div>

      <div className="pointer-events-none absolute right-[7%] top-20 rotate-12 text-[#FFB8A5]">
        <Heart
          size={60}
          fill="currentColor"
          strokeWidth={1}
        />
      </div>

      <div className="pointer-events-none absolute bottom-20 left-[7%] rotate-[-25deg] text-[#CFE9D9]">
        <Bone
          size={75}
          strokeWidth={1.5}
        />
      </div>

      <div className="pointer-events-none absolute bottom-12 right-[-15px] rotate-12 text-[#FFD9CA]">
        <PawPrint
          size={130}
          strokeWidth={1.2}
        />
      </div>

      <div className="pointer-events-none absolute left-[18%] top-[18%] h-3 w-3 rounded-full bg-[#FF8066]" />

      <div className="pointer-events-none absolute right-[23%] top-[30%] h-2.5 w-2.5 rounded-full bg-[#E7B75D]" />

      <div className="pointer-events-none absolute bottom-[25%] right-[17%] h-3 w-3 rounded-full bg-[#9AC9AE]" />

      {/* =========================================================
          PAGE
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-[1050px]">

          {/* =====================================================
              MAIN CARD
          ====================================================== */}

          <div className="grid overflow-hidden rounded-[30px] border border-[#EBDDD0] bg-white shadow-[0_25px_80px_rgba(20,38,83,0.12)] lg:grid-cols-[0.9fr_1.1fr]">

            {/* =================================================
                LEFT BRAND PANEL
            ================================================= */}

            <section className="relative hidden overflow-hidden bg-[#142653] p-10 lg:block">

              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#FF8066]/20" />

              <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#F9B8A7]/15" />

              {/* Logo */}
              <div className="relative z-10 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8066] shadow-lg">
                  <PawPrint
                    size={27}
                    strokeWidth={2.5}
                    className="text-white"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">
                    FurNest
                  </h2>

                  <p className="text-[10px] font-medium text-white/60">
                    Happy Pets. Happier Humans.
                  </p>
                </div>

              </div>

              {/* Decorative SVG */}
              <svg
                className="absolute right-8 top-8 h-12 w-12 text-[#FF9A83]"
                viewBox="0 0 100 100"
                fill="none"
              >
                <path
                  d="M34 55c-9-1-17 5-17 14 0 10 10 15 20 11 8-3 14-3 22 0 10 4 20-1 20-11 0-9-8-15-17-14-4 1-7-1-9-5-2-4-6-7-10-7s-8 3-10 7c-2 4-5 6-9 5Z"
                  fill="currentColor"
                />

                <circle
                  cx="27"
                  cy="30"
                  r="9"
                  fill="currentColor"
                />

                <circle
                  cx="48"
                  cy="21"
                  r="9"
                  fill="currentColor"
                />

                <circle
                  cx="70"
                  cy="30"
                  r="9"
                  fill="currentColor"
                />
              </svg>

              {/* Main message */}
              <div className="relative z-10 mt-24">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#FFD7C8]">
                  <PawPrint size={15} />
                  Happy pets start here
                </div>

                <h2 className="max-w-[400px] text-4xl font-extrabold leading-[1.08] tracking-tight text-white">

                  Everything your
                  <span className="block text-[#FF967E]">
                    pet needs.
                  </span>

                  All in one place.

                </h2>

                <p className="mt-5 max-w-[380px] text-sm leading-6 text-white/65">
                  Discover trusted pet food, toys, grooming products,
                  supplements and expert advice for happier,
                  healthier pets.
                </p>

                {/* Benefits */}
                <div className="mt-8 space-y-3">

                  <Feature
                    icon={<PawPrint size={17} />}
                    text="Trusted products for your pets"
                  />

                  <Feature
                    icon={<Heart size={17} />}
                    text="Expert pet care & advice"
                  />

                  <Feature
                    icon={<ShieldCheck size={17} />}
                    text="Safe & secure shopping"
                  />

                </div>

              </div>

              {/* Bottom illustration */}
              <div className="absolute bottom-4 right-5 opacity-30">
                <PetIllustration />
              </div>

              <div className="absolute bottom-8 left-10 text-xs italic text-white/40">
                “Good pets. Great people. Happy lives.”
              </div>

            </section>

            {/* =================================================
                RIGHT AUTH PANEL
            ================================================= */}

            <section className="relative bg-[#FFFDF9] px-6 py-9 sm:px-10 lg:px-12">

              {/* Mobile logo */}
              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF8066]">
                  <PawPrint
                    size={24}
                    className="text-white"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#142653]">
                    FurNest
                  </h2>

                  <p className="text-[9px] text-[#7B8498]">
                    Happy Pets. Happier Humans.
                  </p>
                </div>

              </div>

              {/* Header icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0EA]">
                {mode === 'login' && (
                  <PawPrint
                    size={26}
                    className="text-[#F26F56]"
                  />
                )}

                {mode === 'register' && (
                  <User
                    size={25}
                    className="text-[#F26F56]"
                  />
                )}

                {mode === 'verify' && (
                  <Mail
                    size={25}
                    className="text-[#F26F56]"
                  />
                )}

                {mode === 'forgot' && (
                  <KeyRound
                    size={25}
                    className="text-[#F26F56]"
                  />
                )}

                {mode === 'reset' && (
                  <Lock
                    size={25}
                    className="text-[#F26F56]"
                  />
                )}
              </div>

              {/* Heading */}
              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#F26F56]">
                  {current.eyebrow}
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#142653] sm:text-4xl">
                  {current.title}
                </h1>

                <p className="mt-3 max-w-[440px] text-sm leading-6 text-[#7B8498]">
                  {current.description}
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#F7C5BA] bg-[#FFF1ED] p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-[#E75B43]"
                  />

                  <span className="text-sm font-medium leading-5 text-[#B8402D]">
                    {error}
                  </span>

                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C7E5D3] bg-[#F1FAF4] p-4">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-[#4C9670]"
                  />

                  <span className="text-sm font-medium leading-5 text-[#3C7657]">
                    {success}
                  </span>

                </div>
              )}

              {/* =================================================
                  LOGIN
              ================================================= */}

              {mode === 'login' && (
                <form
                  onSubmit={handleLogin}
                  className="mt-8"
                >

                  <EmailInput
                    email={email}
                    setEmail={setEmail}
                  />

                  <PasswordInput
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    label="Password"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => changeMode('forgot')}
                      className="text-xs font-bold text-[#F26F56] hover:text-[#D9543E]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <SubmitButton
                    loading={submitting}
                    icon={<PawPrint size={18} />}
                    text="Sign In"
                    loadingText="Signing in..."
                  />

                  <div className="my-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#EDE4DB]" />
                    <span className="text-xs text-[#A39C95]">
                      New to FurNest?
                    </span>
                    <div className="h-px flex-1 bg-[#EDE4DB]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => changeMode('register')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#142653] bg-transparent px-5 py-3.5 text-sm font-extrabold text-[#142653] transition-all hover:bg-[#142653] hover:text-white"
                  >
                    Create an Account
                    <ArrowRight size={17} />
                  </button>

                </form>
              )}

              {/* =================================================
                  REGISTER
              ================================================= */}

              {mode === 'register' && (
                <form
                  onSubmit={handleRegister}
                  className="mt-8"
                >

                  <TextInput
                    icon={<User size={17} />}
                    label="Full Name"
                    value={name}
                    setValue={setName}
                    placeholder="Your name"
                    autoComplete="name"
                  />

                  <div className="mt-5">
                    <EmailInput
                      email={email}
                      setEmail={setEmail}
                    />
                  </div>

                  <PasswordInput
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    label="Create Password"
                  />

                  <div className="mt-5">
                    <PasswordInput
                      password={confirmPassword}
                      setPassword={setConfirmPassword}
                      showPassword={showConfirmPassword}
                      setShowPassword={setShowConfirmPassword}
                      label="Confirm Password"
                    />
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[#8A847D]">
                    By creating an account, you agree to our
                    <a
                      href="/terms"
                      className="mx-1 font-bold text-[#F26F56]"
                    >
                      Terms
                    </a>
                    and
                    <a
                      href="/privacy"
                      className="ml-1 font-bold text-[#F26F56]"
                    >
                      Privacy Policy
                    </a>.
                  </p>

                  <SubmitButton
                    loading={submitting}
                    icon={<User size={18} />}
                    text="Create Account"
                    loadingText="Creating account..."
                  />

                  <BackButton
                    onClick={() => changeMode('login')}
                    text="Already have an account? Sign in"
                  />

                </form>
              )}

              {/* =================================================
                  VERIFY EMAIL
              ================================================= */}

              {mode === 'verify' && (
                <form
                  onSubmit={handleVerify}
                  className="mt-8"
                >

                  <EmailInput
                    email={email}
                    setEmail={setEmail}
                  />

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold text-[#142653]">
                      Verification Code
                    </label>

                    <input
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full rounded-2xl border border-[#E7DDD3] bg-white px-4 py-4 text-center text-2xl font-extrabold tracking-[0.4em] text-[#142653] outline-none transition-all placeholder:text-[#D2CCC5] focus:border-[#FF8066] focus:ring-4 focus:ring-[#FF8066]/10"
                    />

                    <p className="mt-2 text-xs text-[#8A847D]">
                      Enter the 6-digit code sent to your email.
                    </p>
                  </div>

                  <SubmitButton
                    loading={submitting}
                    icon={<CheckCircle2 size={18} />}
                    text="Verify Email"
                    loadingText="Verifying..."
                  />

                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-bold text-[#F26F56] disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Resend verification code
                      </>
                    )}
                  </button>

                  <BackButton
                    onClick={() => changeMode('login')}
                    text="Back to sign in"
                  />

                </form>
              )}

              {/* =================================================
                  FORGOT PASSWORD
              ================================================= */}

              {mode === 'forgot' && (
                <form
                  onSubmit={handleForgotPassword}
                  className="mt-8"
                >

                  <EmailInput
                    email={email}
                    setEmail={setEmail}
                  />

                  <SubmitButton
                    loading={submitting}
                    icon={<Mail size={18} />}
                    text="Send Reset Link"
                    loadingText="Sending..."
                  />

                  <BackButton
                    onClick={() => changeMode('login')}
                    text="Back to sign in"
                  />

                </form>
              )}

              {/* =================================================
                  RESET PASSWORD
              ================================================= */}

              {mode === 'reset' && (
                <form
                  onSubmit={handleResetPassword}
                  className="mt-8"
                >

                  <PasswordInput
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    label="New Password"
                  />

                  <div className="mt-5">
                    <PasswordInput
                      password={confirmPassword}
                      setPassword={setConfirmPassword}
                      showPassword={showConfirmPassword}
                      setShowPassword={setShowConfirmPassword}
                      label="Confirm New Password"
                    />
                  </div>

                  <SubmitButton
                    loading={submitting}
                    icon={<Lock size={18} />}
                    text="Update Password"
                    loadingText="Updating..."
                  />

                  <BackButton
                    onClick={() => changeMode('login')}
                    text="Back to sign in"
                  />

                </form>
              )}

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="mt-9 flex items-center justify-center gap-2 text-center text-xs text-[#A39C95]">

                <Sparkles
                  size={14}
                  className="text-[#FFB36A]"
                />

                <span>
                  Made with love for pets everywhere
                </span>

                <Heart
                  size={13}
                  fill="currentColor"
                  className="text-[#FF8066]"
                />

              </div>

              <div className="mt-5 text-center">
                <a
                  href="/"
                  className="text-sm font-bold text-[#142653] transition-colors hover:text-[#F26F56]"
                >
                  ← Return to FurNest store
                </a>
              </div>

            </section>

          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#A39C95]">
            <PawPrint size={13} />
            <span>FurNest</span>
            <span>•</span>
            <span>Happy Pets. Happier Humans.</span>
          </div>

        </div>
      </div>
    </main>
  );
}

/* =============================================================
   COMPONENTS
============================================================= */

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#FF967E]">
        {icon}
      </span>

      {text}
    </div>
  );
}

function EmailInput({ email, setEmail }) {
  return (
    <div>
      <label
        htmlFor="email"
        className="mb-2 block text-sm font-bold text-[#142653]"
      >
        Email Address
      </label>

      <div className="relative">
        <Mail
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958D]"
        />

        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-[#E7DDD3] bg-white py-3.5 pl-11 pr-4 text-sm text-[#142653] outline-none transition-all placeholder:text-[#B5B1AC] focus:border-[#FF8066] focus:ring-4 focus:ring-[#FF8066]/10"
        />
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  setValue,
  placeholder,
  icon,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#142653]">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958D]">
          {icon}
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-[#E7DDD3] bg-white py-3.5 pl-11 pr-4 text-sm text-[#142653] outline-none transition-all placeholder:text-[#B5B1AC] focus:border-[#FF8066] focus:ring-4 focus:ring-[#FF8066]/10"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  label,
}) {
  return (
    <div className="mt-5">

      <label className="mb-2 block text-sm font-bold text-[#142653]">
        {label}
      </label>

      <div className="relative">

        <Lock
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958D]"
        />

        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-[#E7DDD3] bg-white py-3.5 pl-11 pr-12 text-sm text-[#142653] outline-none transition-all placeholder:text-[#B5B1AC] focus:border-[#FF8066] focus:ring-4 focus:ring-[#FF8066]/10"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B93A5] hover:text-[#142653]"
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>
    </div>
  );
}

function SubmitButton({
  loading,
  icon,
  text,
  loadingText,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF8066] px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(255,128,102,0.25)] transition-all hover:bg-[#F36F55] hover:shadow-[0_12px_30px_rgba(255,128,102,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {text}
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </>
      )}
    </button>
  );
}

function BackButton({ onClick, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-bold text-[#142653] transition-colors hover:text-[#F26F56]"
    >
      <ArrowLeft size={16} />
      {text}
    </button>
  );
}

function PetIllustration() {
  return (
    <svg
      width="230"
      height="160"
      viewBox="0 0 230 160"
      fill="none"
    >
      {/* Dog body */}
      <path
        d="M70 125c-10-32 5-59 34-64 31-5 59 18 62 48 2 20-15 34-43 35-24 1-46-4-53-19Z"
        fill="#FFB9A7"
      />

      {/* Dog head */}
      <circle
        cx="112"
        cy="55"
        r="36"
        fill="#FFE0D6"
      />

      {/* Ears */}
      <path
        d="M82 43C57 19 43 28 51 53c4 15 17 23 33 20L82 43Z"
        fill="#FF9F88"
      />

      <path
        d="M142 43c25-24 39-15 31 10-4 15-17 23-33 20l2-30Z"
        fill="#FF9F88"
      />

      {/* Eyes */}
      <circle
        cx="100"
        cy="55"
        r="3"
        fill="#142653"
      />

      <circle
        cx="125"
        cy="55"
        r="3"
        fill="#142653"
      />

      {/* Nose */}
      <ellipse
        cx="112"
        cy="67"
        rx="8"
        ry="6"
        fill="#142653"
      />

      {/* Mouth */}
      <path
        d="M112 72c-4 8-12 8-17 3M112 72c4 8 12 8 17 3"
        stroke="#142653"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Paws */}
      <circle
        cx="86"
        cy="132"
        r="11"
        fill="#FFE0D6"
      />

      <circle
        cx="144"
        cy="132"
        r="11"
        fill="#FFE0D6"
      />

      {/* Heart */}
      <path
        d="M181 36c-6-10-23-5-18 8 4 9 18 17 18 17s14-8 18-17c5-13-12-18-18-8Z"
        fill="#FF8066"
      />

      {/* Small paw */}
      <circle
        cx="38"
        cy="110"
        r="7"
        fill="#9AC9AE"
      />

      <circle
        cx="28"
        cy="98"
        r="5"
        fill="#9AC9AE"
      />

      <circle
        cx="39"
        cy="94"
        r="5"
        fill="#9AC9AE"
      />

      <circle
        cx="50"
        cy="98"
        r="5"
        fill="#9AC9AE"
      />
    </svg>
  );
}