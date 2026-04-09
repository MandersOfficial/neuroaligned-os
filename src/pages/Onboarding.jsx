import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import StepWelcome from '../components/onboarding/StepWelcome';
import StepNeurotype from '../components/onboarding/StepNeurotype';
import StepBusiness from '../components/onboarding/StepBusiness';
import StepEnergy from '../components/onboarding/StepEnergy';
import StepComplete from '../components/onboarding/StepComplete';

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    display_name: '',
    pronouns: '',
    neurotypes: [],
    business_type: '',
    biggest_challenge: '',
    energy_peak: '',
    work_style: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        setData(prev => ({ ...prev, display_name: u.full_name?.split(' ')[0] || '' }));
        // Check if already onboarded
        base44.entities.UserProfile.filter({ user_email: u.email }).then(profiles => {
          if (profiles.length > 0 && profiles[0].onboarding_completed) {
            navigate('/');
          }
        });
      }
    });
  }, []);

  const onChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    setLoading(true);
    const profileData = {
      ...data,
      user_email: user?.email || '',
      onboarding_completed: true,
    };
    // Update name on user record
    if (data.display_name) {
      await base44.auth.updateMe({ full_name: data.display_name });
    }
    await base44.entities.UserProfile.create(profileData);
    navigate('/');
  };

  return (
    <OnboardingLayout step={step} totalSteps={TOTAL_STEPS}>
      {step === 1 && (
        <StepWelcome
          data={data}
          onChange={onChange}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepNeurotype
          data={data}
          onChange={onChange}
          name={data.display_name}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepBusiness
          data={data}
          onChange={onChange}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepEnergy
          data={data}
          onChange={onChange}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <StepComplete
          name={data.display_name}
          onFinish={handleFinish}
          loading={loading}
        />
      )}
    </OnboardingLayout>
  );
}