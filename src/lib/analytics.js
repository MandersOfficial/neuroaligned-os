import { base44 } from '@/api/base44Client';

/**
 * Central analytics helper — wraps base44.analytics.track
 * Use these named events everywhere instead of raw strings.
 */
export const track = (eventName, properties = {}) => {
  base44.analytics.track({ eventName, properties });
};

export const Analytics = {
  // Onboarding
  onboardingStarted: () => track('onboarding_started'),
  onboardingCompleted: (neurotypes) => track('onboarding_completed', { neurotypes: neurotypes?.join(',') }),

  // Subscription
  planSelected: (plan) => track('plan_selected', { plan }),
  upgradePageViewed: () => track('upgrade_page_viewed'),
  subscriptionStarted: (plan, billing) => track('subscription_started', { plan, billing }),
  trialBannerClicked: (daysLeft) => track('trial_banner_clicked', { days_left: daysLeft }),

  // Tasks
  taskCreated: (category, energy) => track('task_created', { category, energy_required: energy }),
  taskCompleted: (energy) => track('task_completed', { energy_required: energy }),

  // Focus
  focusModeActivated: (name, neurotype) => track('focus_mode_activated', { name, neurotype }),

  // Burnout
  burnoutChecked: (score) => track('burnout_risk_checked', { score }),

  // Community
  forumPostCreated: (category) => track('forum_post_created', { category }),

  // Knowledge
  articleViewed: (title, category) => track('article_viewed', { title, category }),
};