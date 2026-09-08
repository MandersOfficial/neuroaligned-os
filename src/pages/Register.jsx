import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Brain, Loader2 } from 'lucide-react';
import { safeReturnTo } from '@/lib/authReturnTo';
import useSingleAction from '@/hooks/useSingleAction';

// New sign-ups continue to onboarding next. Honor ?returnTo= if present
// (e.g. /onboarding or /onboarding?complete=1), defaulting to /onboarding.
function nextAfterRegister() {
  const dest = safeReturnTo();
  return dest === '/' ? '/onboarding' : dest;
}

export default function Register() {
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(res.access_token);
      window.location.href = nextAfterRegister();
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = useSingleAction(async () => {
    setError('');
    try {
      await base44.auth.resendOtp(email);
    } catch {
      // silent
    }
  });

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', nextAfterRegister());
  };

  const handleApple = () => {
    base44.auth.loginWithProvider('apple', nextAfterRegister());
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          {step === 'register' ? (
            <>
              <h1 className="font-display font-bold text-2xl text-foreground">Create your account</h1>
              <p className="text-sm text-muted-foreground">Join NeuroAligned and work with your brain</p>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">We sent a verification code to <span className="font-medium text-foreground">{email}</span></p>
            </>
          )}
        </div>

        {step === 'register' ? (
          <>
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-foreground"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleApple}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-foreground"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.72 3.01.75.96-.19 1.87-.76 3.09-.82 1.51-.07 2.93.54 3.77 1.71-3.38 2.02-2.84 6.4.47 7.7-.56 1.55-1.3 3.08-2.34 3.54zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              or
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create account
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </>
        ) : (
          /* OTP Step */
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Verification Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & continue
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Didn't get the code?{' '}
              <button type="button" onClick={handleResend} className="text-primary font-medium hover:underline">Resend</button>
            </p>
          </form>
        )}

        {/* Health disclaimer + legal links */}
        <div className="pt-2 border-t border-border/60 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            NeuroAligned is a productivity platform — not a medical device and not a substitute for professional healthcare.{' '}
            <Link to="/disclaimer" className="underline hover:text-foreground">Read our Health Disclaimer</Link>.
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}