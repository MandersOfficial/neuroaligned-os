import { base44 } from '@/api/base44Client';

/**
 * Central analytics helper — wraps base44.analytics.track
 * Use these named events everywhere instead of raw strings.
 */
export const track = (eventName, properties = {}) => {
  base44.analytics.track({ eventName, properties });
};

export const Analytics = {
  // Landing
  landingPageViewed: () => track('landing_page_viewed'),
  heroCTAClicked: () => track('hero_cta_clicked'),
  pricingViewed: () => track('pricing_section_viewed'),

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

  // Regulation
  regulationPageViewed: () => track('regulation_page_viewed'),
  regulationCTAClicked: (cta) => track('regulation_cta_clicked', { cta }),
  regulationWidgetOpened: () => track('regulation_widget_opened'),
  regulationWidgetClosed: () => track('regulation_widget_closed'),
  regulationReminderToggled: (enabled) => track('regulation_reminder_toggled', { enabled }),
  regulationToolOpened: (tool) => track('regulation_tool_opened', { tool }),
  regulationReminderActed: (cue) => track('regulation_reminder_acted', { cue }),
  regulationReminderSkipped: (cue) => track('regulation_reminder_skipped', { cue }),
  hydrationConfirmed: () => track('hydration_confirmed'),
  stretchCompleted: () => track('stretch_completed'),
  breathingStarted: (pattern) => track('breathing_started', { pattern }),
  breathingStopped: (pattern, cycles) => track('breathing_stopped', { pattern, cycles }),
};