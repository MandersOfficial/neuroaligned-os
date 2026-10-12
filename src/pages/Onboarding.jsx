import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DisclaimerModal from '../components/onboarding/DisclaimerModal';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import StepWelcome from '../components/onboarding/StepWelcome';
import StepNeurotype from '../components/onboarding/StepNeurotype';
import StepBusiness from '../components/onboarding/StepBusiness';
import StepEnergy from '../components/onboarding/StepEnergy';
import StepGoals from '../components/onboarding/StepGoals';
import StepPersonalize from '../components/onboarding/StepPersonalize';
import { FOCUS_PRESETS } from '../components/onboarding/StepPersonalize';
import StepNotifications from '../components/onboarding/StepNotifications';
import StepComplete from '../components/onboarding/StepComplete';
import { buildInitialSubscription } from '../lib/subscription';
import { planEnergyTasks } from '@/lib/onboardingEnergy';

const TOTAL_STEPS = 8;
const STASH_KEY = 'na_onboarding_data';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState(null);
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    display_name: '',
    pronouns: '',
    neurotypes: [],
    business_type: '',
    biggest_challenge: '',
    energy_peak: '',
    work_style: '',
    initial_goals: [],
    focus_preset: '',
    dashboard_widgets: ['energy_checkin', 'ai_insight'],
    push_notifications: false,
    push_checkin_time: '09:00',
    push_reminder_time: '08:00',
    notification_timezone: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      const params = new URLSearchParams(window.location.search);
      const preview = params.get('preview') === '1';
      const complete = params.get('complete') === '1';

      // Resume after a brand-new visitor registers mid-onboarding: their answers
      // were stashed before sign-up, so finish saving + go straight to the dashboard.
      if (complete && u) {
        const stashRaw = sessionStorage.getItem(STASH_KEY);
        if (stashRaw) {
          const stashed = JSON.parse(stashRaw);
          sessionStorage.removeItem(STASH_KEY);
          setData(stashed);
          setStep(8);
          runCompletion(stashed, u);
          return;
        }
      }

      // Fresh visit: clear any stale stash.
      sessionStorage.removeItem(STASH_KEY);

      if (u) {
        setUser(u);
        setData(prev => ({ ...prev, display_name: u.full_name?.split(' ')[0] || '' }));
        if (!preview) {
          return base44.entities.UserProfile.filter({ user_email: u.email }).then(profiles => {
            if (profiles.length > 0 && profiles[0].onboarding_completed) {
              navigate('/dashboard');
            }
          });
        }
      }
      // Anonymous visitors proceed through the questions; their answers are
      // stashed at the end and saved once they create an account.
    }).catch(() => {});
  }, []);

  const onChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    if (pendingAnimation) pendingAnimation();
    doFinish();
  };

  const handleFinish = (runAnimation) => {
    setPendingAnimation(() => runAnimation);
    setShowDisclaimer(true);
  };

  const runCompletion = async (profile, userObj) => {
    setLoading(true);

    // Update display name
    if (profile.display_name) {
      try {
        await base44.auth.updateMe({ full_name: profile.display_name });
      } catch (e) {
        // ignore
      }
    }

    // Save user profile
    await base44.entities.UserProfile.create({
      user_email: userObj?.email || '',
      display_name: profile.display_name,
      pronouns: profile.pronouns,
      neurotypes: profile.neurotypes,
      business_type: profile.business_type,
      biggest_challenge: profile.biggest_challenge,
      energy_peak: profile.energy_peak,
      work_style: profile.work_style,
      onboarding_completed: true,
      push_notifications: profile.push_notifications === true,
      push_checkin_time: profile.push_checkin_time || '09:00',
      push_reminder_time: profile.push_reminder_time || '08:00',
      notification_timezone: profile.notification_timezone || '',
    });

    // Seed initial tasks, each matched to the member's peak-energy window
    if (profile.initial_goals?.length > 0) {
      await Promise.all(
        planEnergyTasks(profile.initial_goals, profile.energy_peak, profile.work_style).map(task =>
          base44.entities.Task.create({
            title: task.title,
            status: 'todo',
            energy_required: task.energy_required,
            is_today: true,
          })
        )
      );
    }

    // Seed selected focus mode
    if (profile.focus_preset) {
      const preset = FOCUS_PRESETS.find(p => p.value === profile.focus_preset);
      if (preset) {
        await base44.entities.FocusMode.create({
          name: preset.label,
          emoji: preset.emoji,
          description: preset.desc,
          is_active: true,
          is_custom: false,
          work_block_minutes: preset.work_block_minutes,
          break_minutes: preset.break_minutes,
          show_one_task: preset.show_one_task,
        });
      }
    }

    // Founding members get free lifetime access; the free trial starts at the cutoff.
    await base44.entities.Subscription.create(buildInitialSubscription(userObj?.email || ''));

    navigate('/dashboard');
  };

  const doFinish = async () => {
    if (!user) {
      // No anonymous users: send new visitors to create an account before their
      // dashboard. Stash their answers so onboarding auto-completes after sign-up.
      sessionStorage.setItem(STASH_KEY, JSON.stringify(data));
      navigate(`/register?returnTo=${encodeURIComponent('/onboarding?complete=1')}`);
      return;
    }
    const preview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (preview) {
      navigate('/dashboard');
      return;
    }
    setLoading(true);
    // Wait for the build animation to complete (~3.7s total)
    await new Promise(r => setTimeout(r, 3800));
    await runCompletion(data, user);
  };

  return (
    <>
    <DisclaimerModal
      open={showDisclaimer}
      onAccept={handleDisclaimerAccept}
      onClose={() => setShowDisclaimer(false)}
    />
    <OnboardingLayout step={step} totalSteps={TOTAL_STEPS}>
      {step === 1 && (
        <StepWelcome data={data} onChange={onChange} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <StepNeurotype data={data} onChange={onChange} name={data.display_name} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && (
        <StepBusiness data={data} onChange={onChange} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}
      {step === 4 && (
        <StepEnergy data={data} onChange={onChange} onNext={() => setStep(5)} onBack={() => setStep(3)} />
      )}
      {step === 5 && (
        <StepGoals data={data} onChange={onChange} onNext={() => setStep(6)} onBack={() => setStep(4)} />
      )}
      {step === 6 && (
        <StepPersonalize data={data} onChange={onChange} onNext={() => setStep(7)} onBack={() => setStep(5)} />
      )}
      {step === 7 && (
        <StepNotifications data={data} onChange={onChange} onNext={() => setStep(8)} onBack={() => setStep(6)} />
      )}
      {step === 8 && (
        <StepComplete name={data.display_name} data={data} onFinish={handleFinish} loading={loading} />
      )}
    </OnboardingLayout>
    </>
  );
}