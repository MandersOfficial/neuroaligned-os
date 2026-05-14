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
import StepComplete from '../components/onboarding/StepComplete';

const TOTAL_STEPS = 7;

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
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return; // allow unauthenticated users to browse onboarding
      setUser(u);
      setData(prev => ({ ...prev, display_name: u.full_name?.split(' ')[0] || '' }));
      return base44.entities.UserProfile.filter({ user_email: u.email }).then(profiles => {
        if (profiles.length > 0 && profiles[0].onboarding_completed) {
          navigate('/dashboard');
        }
      });
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

  const doFinish = async () => {
    if (!user) {
      base44.auth.redirectToLogin('/onboarding');
      return;
    }
    setLoading(true);
    // Wait for the build animation to complete (~3.7s total)
    await new Promise(r => setTimeout(r, 3800));

    // Update display name (only if authenticated)
    if (data.display_name && user) {
      try {
        await base44.auth.updateMe({ full_name: data.display_name });
      } catch (e) {
        // ignore if not authenticated
      }
    }

    // Save user profile
    await base44.entities.UserProfile.create({
      user_email: user?.email || '',
      display_name: data.display_name,
      pronouns: data.pronouns,
      neurotypes: data.neurotypes,
      business_type: data.business_type,
      biggest_challenge: data.biggest_challenge,
      energy_peak: data.energy_peak,
      work_style: data.work_style,
      onboarding_completed: true,
    });

    // Seed initial tasks from goals
    if (data.initial_goals?.length > 0) {
      await Promise.all(
        data.initial_goals.map(title =>
          base44.entities.Task.create({
            title,
            status: 'todo',
            energy_required: 'medium',
            is_today: true,
          })
        )
      );
    }

    // Seed selected focus mode
    if (data.focus_preset) {
      const preset = FOCUS_PRESETS.find(p => p.value === data.focus_preset);
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

    // Create trial subscription record
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);
    await base44.entities.Subscription.create({
      user_email: user?.email || '',
      plan: 'trial',
      status: 'trialing',
      trial_start_date: now.toISOString().split('T')[0],
      trial_end_date: trialEnd.toISOString().split('T')[0],
    });

    navigate('/dashboard');
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
        <StepComplete name={data.display_name} data={data} onFinish={handleFinish} loading={loading} />
      )}
    </OnboardingLayout>
    </>
  );
}