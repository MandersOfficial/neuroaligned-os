import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Brain, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // always show success
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              If an account exists for <span className="font-medium">{email}</span>, you'll receive a reset link shortly.
            </div>
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-primary font-medium hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reset link
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}