import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Analytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, CreditCard, Lock, Sparkles, Zap, Shield } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 30,
    emoji: '🌱',
    color: 'border-blue-200 bg-blue-50/50',
    activeColor: 'border-blue-500 bg-blue-50',
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
    price: 50,
    emoji: '⚡',
    color: 'border-purple-200 bg-purple-50/50',
    activeColor: 'border-primary bg-primary/5',
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
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all ${selected ? plan.activeColor + ' shadow-sm' : plan.color + ' hover:border-opacity-70'}`}
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
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

function PaymentForm({ plan, onSuccess, onBack }) {
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatNumber = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };
  const formatCvc = v => v.replace(/\D/g, '').slice(0, 4);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulated processing
    setSuccess(true);
    setTimeout(() => onSuccess(plan, form.number.slice(-4)), 1200);
  };

  const isValid = form.name.trim() && form.number.replace(/\s/g,'').length === 16 && form.expiry.length === 5 && form.cvc.length >= 3;

  if (success) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-foreground">Welcome to {plan.name}! 🎉</h3>
        <p className="text-sm text-muted-foreground">Your subscription is active. Redirecting you back...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="w-3.5 h-3.5" /> Change plan
      </button>

      <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{plan.emoji} {plan.name} Plan</span>
        <span className="text-sm font-bold text-foreground">${plan.price}/mo</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Name on card</label>
          <input
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Card number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-widest"
              placeholder="1234 5678 9012 3456"
              value={form.number}
              onChange={e => setForm(p => ({ ...p, number: formatNumber(e.target.value) }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Expiry</label>
            <input
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={e => setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">CVC</label>
            <input
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="123"
              value={form.cvc}
              onChange={e => setForm(p => ({ ...p, cvc: formatCvc(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        Your payment info is encrypted and secure.
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Processing...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Start {plan.name} — ${plan.price}/mo</>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Cancel anytime. No hidden fees. By subscribing you agree to our{' '}
        <Link to="/terms" className="underline hover:text-foreground">Terms</Link>{' '}and{' '}
        <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </p>
    </form>
  );
}

export default function Upgrade() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [step, setStep] = useState('plans'); // 'plans' | 'payment'

  useEffect(() => {
    Analytics.upgradePageViewed();
    Promise.all([base44.auth.me(), base44.entities.Subscription.list('-created_date', 1)])
      .then(([u, subs]) => {
        setUser(u);
        const sub = subs.find(s => s.user_email === u.email) || null;
        setSubscription(sub);
      });
  }, []);

  const daysLeft = subscription?.trial_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 14;

  const handleSuccess = async (plan, last4) => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    if (subscription) {
      await base44.entities.Subscription.update(subscription.id, {
        plan: plan.id, status: 'active',
        subscription_start_date: today,
        next_billing_date: nextMonth,
        payment_last4: last4,
      });
    } else {
      await base44.entities.Subscription.create({
        user_email: user.email,
        plan: plan.id, status: 'active',
        subscription_start_date: today,
        next_billing_date: nextMonth,
        payment_last4: last4,
      });
    }
    navigate('/dashboard');
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    Analytics.planSelected(planId);
  };

  const activePlan = PLANS.find(p => p.id === selectedPlan);

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
          {daysLeft > 0 ? (
            <p className="text-sm text-muted-foreground">
              Your free trial ends in <span className="font-bold text-foreground">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>. Subscribe to keep everything running.
            </p>
          ) : (
            <p className="text-sm text-red-600 font-medium">Your trial has ended. Choose a plan to regain full access.</p>
          )}
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
          <AnimatePresence mode="wait">
            {step === 'plans' ? (
              <motion.div key="plans" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {PLANS.map(plan => (
                    <PlanCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} onSelect={handleSelectPlan} />
                  ))}
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Continue with {activePlan?.name} — ${activePlan?.price}/mo
                </button>
              </motion.div>
            ) : (
              <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <PaymentForm plan={activePlan} onSuccess={handleSuccess} onBack={() => setStep('plans')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}