import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Analytics } from '@/lib/analytics';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, CreditCard, Lock, Sparkles, Zap, Shield, ExternalLink } from 'lucide-react';
import { isNativeApp } from '@/lib/isNativeApp';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19.99,
    emoji: '🌱',
    color: 'border-border bg-card',
    activeColor: 'border-blue-500 bg-blue-500/10',
    badge: null,
    features: [
      'Energy-aware task management',
      'Focus mode presets (5 included)',
      'Burnout risk dashboard',
      'Basic regulation tools',
      'Knowledge base access',
      'Community forum',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 45.99,
    emoji: '⚡',
    color: 'border-primary/40 bg-primary/5',
    activeColor: 'border-primary bg-primary/10',
    badge: 'Most Popular',
    features: [
      'Everything in Starter',
      'Unlimited focus mode customisation',
      'AI-powered daily guidance',
      'AI context capture from emails',
      'Auto-break scheduling',
      'Priority community support',
      'Advanced burnout insights',
      'Google Calendar integration (coming soon)',
    ],
  },
];

function PlanCard({ plan, selected, onSelect }) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(plan.id)}
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all ${selected ? plan.activeColor + ' shadow-sm' : plan.color + ' hover:border-primary/50'}`}
    >
      {plan.badge && (
        <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          {plan.badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{plan.emoji}</span>
            <span className="font-display font-bold text-base text-foreground">{plan.name}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-3xl text-foreground">${plan.price}</span>
            <span className="text-sm text-foreground/70">/month</span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
            <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

export default function Upgrade() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Analytics.upgradePageViewed();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    // Returning from Stripe Checkout — verify the payment server-side
    if (sessionId) {
      setConfirming(true);
      base44.functions.invoke('confirmSubscription', { session_id: sessionId })
        .then(res => {
          setConfirming(false);
          setSuccessPlan(res.data?.plan || selectedPlan);
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch(() => {
          setConfirming(false);
          setError('We could not confirm your payment just now. If you were charged, your plan will update shortly — or contact support.');
        });
    } else if (urlParams.get('canceled')) {
      setError('Checkout was canceled — nothing was charged.');
    }

    Promise.all([base44.auth.me(), base44.entities.Subscription.list('-created_date', 5)])
      .then(([u, subs]) => {
        setUser(u);
        setSubscription(subs.find(s => s.user_email === u.email) || null);
      })
      .catch(() => {});
  }, []);

  const daysLeft = subscription?.trial_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 14;

  const activePlan = PLANS.find(p => p.id === selectedPlan);
  const isBeta = subscription?.plan === 'beta';
  const isPaid = ['starter', 'pro'].includes(subscription?.plan) && subscription?.status === 'active';

  const handleCheckout = async () => {
    setError('');
    if (!user?.email) {
      setError('Please sign in first to subscribe.');
      return;
    }
    // Stripe Checkout must be top-level, never inside an iframe. In the
    // builder preview we are framed, so open the tab synchronously here —
    // before any await — or the popup blocker will drop the user's click.
    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open('', '_blank') : null;
    if (isFramed && !checkoutTab) {
      setError('Allow popups to continue to checkout.');
      return;
    }
    if (checkoutTab) checkoutTab.opener = null;

    setCheckoutLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', { plan: selectedPlan, user_email: user.email });
      if (res.data?.url) {
        if (checkoutTab) {
          checkoutTab.location.replace(res.data.url);
        } else {
          window.location.assign(res.data.url);
        }
      } else {
        checkoutTab?.close();
        setError(res.data?.error || 'Could not start checkout. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (e) {
      checkoutTab?.close();
      setError(e?.response?.data?.error || 'Could not start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    Analytics.planSelected(planId);
  };

  // Native app shell: Apple/Google policy — hide paid-upgrade CTAs entirely
  // and direct users to the canonical website to manage their plan.
  if (isNativeApp()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5 text-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">Manage your plan</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              To keep payments secure and simple, plan management happens on our website. Your account and all your data stay perfectly in sync.
            </p>
          </div>
          <a
            href="https://neuroaligned.app/upgrade"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open neuroaligned.app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display font-black text-2xl text-foreground">Continue with NeuroAligned</h1>
          {daysLeft > 0 && !isBeta && !isPaid ? (
            <p className="text-sm text-muted-foreground">
              Your free trial ends in <span className="font-bold text-foreground">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>. Subscribe to keep everything running.
            </p>
          ) : daysLeft <= 0 && !isBeta && !isPaid ? (
            <p className="text-sm text-red-600 font-medium">Your trial has ended. Choose a plan to regain full access.</p>
          ) : null}
        </div>

        {/* Guarantee strip */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: Shield, text: '14-day money-back guarantee' },
            { icon: Lock, text: 'Cancel any time' },
            { icon: Sparkles, text: 'Instant access, no waiting' },
          ].map(({ icon: IconComp, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconComp className="w-3.5 h-3.5 text-primary" />{text}
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          {successPlan ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground capitalize">Welcome to {successPlan}! 🎉</h3>
              <p className="text-sm text-muted-foreground">Your subscription is active. Redirecting you back...</p>
            </div>
          ) : confirming ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Confirming your payment…</p>
            </div>
          ) : isBeta ? (
            <div className="py-6 space-y-3 text-center">
              <div className="text-3xl">💙</div>
              <h3 className="font-display font-bold text-lg text-foreground">You're on the Beta plan</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                As one of our founding beta members, your access is grandfathered — free, forever. No payment needed, ever.
                Thank you for helping build NeuroAligned.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isPaid && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current plan</span>
                  <span className="text-sm font-semibold text-foreground capitalize">{subscription.plan}{subscription.plan !== selectedPlan ? ' — switching below' : ''}</span>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {PLANS.map(plan => (
                  <PlanCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} onSelect={handleSelectPlan} />
                ))}
              </div>

              {error && (
                <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Redirecting to secure checkout…</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Continue with {activePlan?.name} — ${activePlan?.price}/mo</>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Cancel anytime. No hidden fees. By subscribing you agree to our{' '}
                <Link to="/terms" className="underline hover:text-foreground">Terms</Link>{' '}and{' '}
                <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}