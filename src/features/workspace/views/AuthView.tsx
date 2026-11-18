import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui';
import { findAccount, isValidEmail, requestOtp, verifyOtp } from '../../../lib/accountStore';
import { saveProfile } from '../../../lib/welcomeStore';
import { PROFILE_PREFIXES } from '../profileOptions';

type Mode = 'login' | 'register';

export const AuthView: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [error, setError] = useState('');

  const sendCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Name is required.');
        return;
      }
      if (!dob) {
        setError('Date of birth is required.');
        return;
      }
      if (findAccount(email)) {
        setError('An account with this email already exists. Sign in instead.');
        return;
      }
    } else if (!findAccount(email)) {
      setError('No account found with this email. Create an account first.');
      return;
    }

    const pending = requestOtp(
      email,
      mode === 'register'
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            dob,
            phone: phone.trim() || undefined,
            prefix: prefix || undefined,
          }
        : undefined
    );
    setDemoCode(pending.code);
    setStep('otp');
  };

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const account = verifyOtp(email, code);
    if (!account) {
      setError('That code is not valid or has expired.');
      return;
    }
    saveProfile({
      prefix: account.prefix ?? '',
      name: account.name,
      email: account.email,
      dob: account.dob,
      phone: account.phone ?? '',
      welcomed: true,
    });
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)]">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <Link
          to="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to ViDo
        </Link>

        <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Local account
              </p>
              <h1 className="text-2xl font-extrabold text-[var(--ink)]">
                {step === 'otp' ? 'Check your code' : mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            {step === 'otp'
              ? `Enter the 6-digit code for ${email}. In this local prototype the code is shown below.`
              : 'Use email and a one-time code. No password needed.'}
          </p>

          {step === 'details' ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-[88px_1fr] gap-2">
                    <div>
                      <label htmlFor="auth-prefix" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                        Prefix
                      </label>
                      <select
                        id="auth-prefix"
                        value={prefix}
                        onChange={(event) => setPrefix(event.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-2 py-2 text-sm"
                      >
                        {PROFILE_PREFIXES.map((value) => (
                          <option key={value || 'none'} value={value}>
                            {value || 'None'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="auth-name" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                        Name <span className="text-[var(--accent)]">*</span>
                      </label>
                      <input
                        id="auth-name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="auth-dob" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                      Date of birth <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      id="auth-dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(event) => setDob(event.target.value)}
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-phone" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                      Phone <span className="text-[var(--faint)]">(optional)</span>
                    </label>
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91…"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                  Email <span className="text-[var(--accent)]">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-semibold text-[var(--amber)]">{error}</p>}

              <Button type="submit" variant="primary" className="w-full">
                Send code
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="w-full text-center text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="mt-6 space-y-4">
              <div>
                <label htmlFor="auth-code" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                  Verification code
                </label>
                <input
                  id="auth-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="000000"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 text-center font-mono text-lg tracking-[0.3em]"
                />
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Local prototype code
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-[var(--accent)]">{demoCode}</p>
                <p className="mt-1 text-[10px] text-[var(--faint)]">
                  Later this is delivered by email. No password is stored.
                </p>
              </div>

              {error && <p className="text-xs font-semibold text-[var(--amber)]">{error}</p>}

              <Button type="submit" variant="primary" className="w-full" disabled={code.length !== 6}>
                <Check className="h-3.5 w-3.5" /> Verify and continue
              </Button>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full text-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Use a different email
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthView;
