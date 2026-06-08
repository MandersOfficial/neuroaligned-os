import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Brain, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">New password</h1>
          <p className="text-sm text-muted-foreground">Choose a strong new password</p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              Password reset successfully!
            </div>
            <Link to="/login" className="block text-center text-sm text-primary font-medium hover:underline">
              Sign in with new password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">New Password</label>
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
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}