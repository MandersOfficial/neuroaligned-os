/**
 * Subscription rules shared across the app.
 *
 * Founding members — everyone who joined before the cutoff — keep free lifetime
 * access. From the cutoff onwards, new members start a 14-day free trial and are
 * then invited to subscribe.
 */
export const GRANDFATHER_CUTOFF = new Date(2026, 10, 1); // 1 Nov 2026, local midnight
export const TRIAL_DAYS = 14;

// 'beta' is kept alongside 'lifetime' so existing founding records still count.
const GRANDFATHERED_PLANS = ['lifetime', 'beta'];

/** Free-for-life access: never billed, never shown a trial countdown. */
export function isGrandfathered(sub) {
  return !!sub && GRANDFATHERED_PLANS.includes(sub.plan);
}

export function isTrial(sub) {
  return !!sub && sub.plan === 'trial' && sub.status === 'trialing';
}

/** Days left on a running trial, or null when there is no trial to count down. */
export function trialDaysLeft(sub) {
  if (!isTrial(sub) || !sub.trial_end_date) return null;
  return Math.max(0, Math.ceil((new Date(sub.trial_end_date) - new Date()) / 86400000));
}

export function planLabel(sub) {
  if (isGrandfathered(sub)) return 'Free Lifetime';
  if (isTrial(sub)) {
    const days = trialDaysLeft(sub);
    return days === null ? 'Free trial' : `Free trial — ${days} day${days === 1 ? '' : 's'} left`;
  }
  if (sub?.plan === 'pro') return 'Pro';
  if (sub?.plan === 'starter') return 'Starter';
  return 'Active';
}

/** The subscription record a brand-new member gets at the end of onboarding. */
export function buildInitialSubscription(userEmail, now = new Date()) {
  if (now < GRANDFATHER_CUTOFF) {
    return {
      user_email: userEmail,
      plan: 'lifetime',
      status: 'active',
      subscription_start_date: now.toISOString().split('T')[0],
      description: 'Founding member — free lifetime access',
    };
  }

  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  return {
    user_email: userEmail,
    plan: 'trial',
    status: 'trialing',
    trial_start_date: now.toISOString().split('T')[0],
    trial_end_date: trialEnd.toISOString().split('T')[0],
  };
}