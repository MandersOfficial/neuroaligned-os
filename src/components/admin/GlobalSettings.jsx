import { useState } from 'react';
import { CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MobileSelect from '@/components/ui/MobileSelect';

const DEFAULT_SETTINGS = [
  {
    category: 'General',
    fields: [
      { key: 'app_name', label: 'App Display Name', value: 'NeuroAligned', type: 'text' },
      { key: 'support_email', label: 'Support Email', value: 'support@neuroaligned.co', type: 'text' },
      { key: 'max_free_tasks', label: 'Free Tier Task Limit', value: '10', type: 'number' },
    ],
  },
  {
    category: 'Onboarding',
    fields: [
      { key: 'onboarding_enabled', label: 'Show Onboarding Flow', value: true, type: 'boolean' },
      { key: 'skip_onboarding_allowed', label: 'Allow Skipping Onboarding', value: false, type: 'boolean' },
      { key: 'welcome_message', label: 'Welcome Message', value: 'Welcome to NeuroAligned — your OS is ready.', type: 'text' },
    ],
  },
  {
    category: 'Community',
    fields: [
      { key: 'moderation_mode', label: 'Post Moderation Mode', value: 'manual', type: 'select', options: ['off', 'manual', 'auto'] },
      { key: 'community_enabled', label: 'Community Forum Enabled', value: true, type: 'boolean' },
      { key: 'max_posts_per_day', label: 'Max Posts Per User/Day', value: '5', type: 'number' },
    ],
  },
  {
    category: 'AI',
    fields: [
      { key: 'ai_insights_enabled', label: 'AI Daily Insights', value: true, type: 'boolean' },
      { key: 'ai_task_suggestions', label: 'AI Task Suggestions', value: true, type: 'boolean' },
      { key: 'ai_model', label: 'AI Model', value: 'gpt-4o-mini', type: 'select', options: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku'] },
    ],
  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-all ${checked ? 'bg-primary' : 'bg-border'}`}
      style={{ height: '22px' }}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

export default function GlobalSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const updateField = (catIdx, fieldIdx, newValue) => {
    const next = settings.map((cat, ci) =>
      ci !== catIdx ? cat : {
        ...cat,
        fields: cat.fields.map((f, fi) => fi !== fieldIdx ? f : { ...f, value: newValue }),
      }
    );
    setSettings(next);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Global Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide configuration</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-5">
        {settings.map((cat, catIdx) => (
          <div key={cat.category} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-secondary/40 border-b border-border/40">
              <h3 className="font-semibold text-sm text-foreground">{cat.category}</h3>
            </div>
            <div className="divide-y divide-border/40">
              {cat.fields.map((field, fieldIdx) => (
                <div key={field.key} className="px-6 py-4 flex items-center justify-between gap-6">
                  <div>
                    <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{field.key}</p>
                  </div>
                  <div className="shrink-0">
                    {field.type === 'boolean' && (
                      <Toggle checked={field.value} onChange={v => updateField(catIdx, fieldIdx, v)} />
                    )}
                    {(field.type === 'text' || field.type === 'number') && (
                      <Input
                        type={field.type}
                        value={field.value}
                        onChange={e => updateField(catIdx, fieldIdx, e.target.value)}
                        className="h-8 text-sm w-64 text-right"
                      />
                    )}
                    {field.type === 'select' && (
                      <MobileSelect
                        value={field.value}
                        onChange={v => updateField(catIdx, fieldIdx, v)}
                        options={field.options.map(o => ({ value: o, label: o }))}
                        className="h-8 text-sm border border-input rounded-md px-3 bg-background text-foreground min-w-[140px]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}