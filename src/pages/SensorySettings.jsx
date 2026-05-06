import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Type, Zap, Palette, Check, Wind, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSensory, THEMES } from '../lib/SensoryContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { base44 } from '@/api/base44Client';

export default function SensorySettings() {
  const { prefs, updatePref, activeThemeId } = useSensory();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/sensory'));
  }, []);

  const Toggle = ({ checked, onChange, label, description, icon: Icon, color = 'bg-primary' }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${color}/10 flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
            </Link>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Sensory Settings</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Customize how NeuroAligned looks and feels for your brain. Changes apply instantly and are saved to your device.
            </p>
          </div>

          {/* Color Themes */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Color Palette</h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Pick the visual environment that works for your sensory needs.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.values(THEMES).map(theme => (
                <motion.button
                  key={theme.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updatePref('manualTheme', theme.id)}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    prefs.manualTheme === theme.id
                      ? 'border-primary/50 bg-primary/5 shadow-sm'
                      : 'border-border/60 hover:border-primary/30 hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-xl shrink-0">{theme.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{theme.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                  </div>
                  {prefs.manualTheme === theme.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {activeThemeId === theme.id && prefs.manualTheme !== theme.id && (
                    <div className="absolute top-3 right-3 text-[10px] text-primary/70 font-medium">active</div>
                  )}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Auto Brain State */}
          <section className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-blue-400" />
              <h2 className="font-display font-semibold text-base text-foreground">Auto Sensory Mode</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Let NeuroAligned adapt the theme to your nervous system state after each check-in.</p>

            <Toggle
              checked={prefs.autoBrainStateTheme}
              onChange={v => updatePref('autoBrainStateTheme', v)}
              icon={Wind}
              color="bg-blue-400"
              label="Auto-apply Calm Blue when overwhelmed"
              description="When your check-in shows Red (overwhelmed), Yellow (scattered), or Blue (frozen) zones, the Calm Blue palette activates automatically to reduce visual stress."
            />

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-700">How it works</p>
              <div className="space-y-1.5 text-xs text-blue-600">
                <div className="flex items-center gap-2">
                  <span>🔴</span><span>Red / Overwhelmed → <strong>Calm Blue</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟡</span><span>Yellow / Scattered → <strong>Calm Blue</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔵</span><span>Blue / Frozen → <strong>Calm Blue</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟢</span><span>Green / Flow → <strong>Your chosen palette</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Dark Mode */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Appearance</h2>
            </div>
            <Toggle
              checked={prefs.darkMode}
              onChange={v => updatePref('darkMode', v)}
              icon={Moon}
              color="bg-slate-700"
              label="Dark mode"
              description="Switch to a dark background — easier on the eyes at night or in low-light environments."
            />
          </section>

          {/* Accessibility */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Accessibility</h2>
            </div>

            <Toggle
              checked={prefs.dyslexiaFont}
              onChange={v => updatePref('dyslexiaFont', v)}
              icon={Type}
              color="bg-amber-500"
              label="Dyslexia-friendly font"
              description="Switches to a font designed to reduce letter confusion and improve reading flow for dyslexic brains."
            />
            <Toggle
              checked={prefs.largerText}
              onChange={v => updatePref('largerText', v)}
              icon={Type}
              color="bg-green-500"
              label="Larger base text"
              description="Increases base font size to 18px across the app — easier to read when fatigued or sensory-overloaded."
            />
            <Toggle
              checked={prefs.reducedMotion}
              onChange={v => updatePref('reducedMotion', v)}
              icon={Zap}
              color="bg-purple-500"
              label="Reduce motion & animations"
              description="Disables non-essential animations and transitions. Helpful for vestibular sensitivity, migraine, or sensory overload."
            />
          </section>

          {/* Current state indicator */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Currently active: <span className="font-medium text-foreground">{THEMES[activeThemeId]?.label || 'Default'}</span>
              {activeThemeId !== prefs.manualTheme && <span className="text-blue-500 ml-1">(auto-applied from brain state)</span>}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}