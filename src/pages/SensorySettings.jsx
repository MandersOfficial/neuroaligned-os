import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Type, Zap, Palette, Check, Wind, Moon, Trash2, AlertTriangle, Volume2, Mail, Mic, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory, THEMES } from '../lib/SensoryContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ReaderVoicePicker from '@/components/accessibility/ReaderVoicePicker';
import EmailUpdateFrequency from '@/components/settings/EmailUpdateFrequency';
import PushNotificationSettings from '@/components/settings/PushNotificationSettings';
import ThemePreview from '@/components/settings/ThemePreview';
import { base44 } from '@/api/base44Client';
import { getCommandMode, setCommandMode as persistCommandMode, subscribeCommandMode, loadCommandMode } from '@/lib/voiceCommandStore';

export default function SensorySettings() {
  const { prefs, updatePref, activeThemeId } = useSensory();
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [commandMode, setCommandMode] = useState(getCommandMode());
  const [speechSupported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/sensory'));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCommandMode(setCommandMode);
    loadCommandMode();
    return unsubscribe;
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    // Delete all user data then sign out
    if (user) {
      const [tasks, profiles, subs, modes] = await Promise.all([
        base44.entities.Task.filter({ created_by: user.email }),
        base44.entities.UserProfile.filter({ user_email: user.email }),
        base44.entities.Subscription.filter({ user_email: user.email }),
        base44.entities.FocusMode.filter({ created_by: user.email }),
      ]);
      await Promise.all([
        ...tasks.map(t => base44.entities.Task.delete(t.id)),
        ...profiles.map(p => base44.entities.UserProfile.delete(p.id)),
        ...subs.map(s => base44.entities.Subscription.delete(s.id)),
        ...modes.map(m => base44.entities.FocusMode.delete(m.id)),
      ]);
    }
    base44.auth.logout('/');
  };

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

      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Settings</h1>
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
            <p className="text-xs text-muted-foreground -mt-2">Pick the visual environment that works for your sensory needs. Each palette previews in both light and dark.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.values(THEMES).map(theme => (
                <motion.button
                  key={theme.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updatePref('manualTheme', theme.id)}
                  className={`relative flex flex-col p-4 rounded-xl border text-left transition-all ${
                    prefs.manualTheme === theme.id
                      ? 'border-primary/50 bg-primary/5 shadow-sm'
                      : 'border-border/60 hover:border-primary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{theme.emoji}</span>
                    <div className="flex-1 min-w-0 pr-5">
                      <p className="text-sm font-semibold text-foreground">{theme.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                    </div>
                  </div>
                  <ThemePreview theme={theme} darkMode={prefs.darkMode} />
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

          {/* Voice Commands */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Voice Commands</h2>
            </div>

            <Toggle
              checked={commandMode}
              onChange={persistCommandMode}
              icon={Mic}
              color="bg-indigo-500"
              label="Command Mode"
              description="Speak commands like “go to tasks” or “set my focus mode to hyperfocus” instead of typing. Common phrases are matched instantly; anything else is understood by AI. While this is on, dictation pauses so the mic listens for instructions."
            />

            {!speechSupported && (
              <p className="text-xs text-muted-foreground pt-3">
                Speech recognition isn't available in this browser, so Command Mode can't be used here.
              </p>
            )}
          </section>

          {/* Reader Voice */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Reader Voice</h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Choose the voice for Read Aloud. The device voice is free and always available; premium voices are richer and more natural.
            </p>
            <ReaderVoicePicker />
          </section>

          {/* Email Updates */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Email Updates</h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Choose how often NeuroAligned emails you — daily or weekly. Prefer no email at all? That works too.
            </p>
            <EmailUpdateFrequency />
          </section>

          {/* Push Notifications */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">Push Notifications</h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Choose what reaches your phone. Nothing is sent unless you turn it on here, and you can switch any type off on its own.
            </p>
            <PushNotificationSettings />
          </section>

          {/* Current state indicator */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Currently active: <span className="font-medium text-foreground">{THEMES[activeThemeId]?.label || 'Default'}</span>
              {activeThemeId !== prefs.manualTheme && <span className="text-blue-500 ml-1">(auto-applied from brain state)</span>}
            </p>
          </div>

          {/* Danger Zone */}
          <section className="bg-card border border-destructive/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="font-display font-semibold text-base text-destructive">Danger Zone</h2>
            </div>
            <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </section>

        </div>
      </main>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Delete Account</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This will permanently erase all your data.</p>
                </div>
              </div>

              <ul className="text-xs text-muted-foreground space-y-1 bg-secondary/50 rounded-xl p-4">
                <li>✗ All tasks and projects</li>
                <li>✗ Your profile and preferences</li>
                <li>✗ Focus modes and subscription</li>
              </ul>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Type <span className="font-mono text-destructive">DELETE</span> to confirm</label>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-destructive text-foreground placeholder:text-muted-foreground font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE' || deleting}
                  className="px-4 py-2 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Deleting…' : 'Delete my account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}