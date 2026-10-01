import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Accessibility as AccessibilityIcon, Sparkles, Keyboard, Volume2, AlertTriangle, MessageSquare } from 'lucide-react';

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block">NeuroAligned</span>
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">Accessibility</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Accessibility</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: October 2026</p>
        </div>

        <section className="border rounded-2xl p-6 space-y-3 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <AccessibilityIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <h2 className="font-display font-semibold text-lg text-foreground">Our commitment</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-8">
            NeuroAligned exists for brains that were never the problem — so accessibility isn't a
            feature bolted on afterwards, it's the premise. We build for neurodivergent people, and
            that means we assume variation in attention, reading, sensory processing, motor control,
            and energy. If the app is hard to use, that's a design failure on our side, not yours.
          </p>
        </section>

        {[
          {
            icon: Sparkles,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40',
            title: 'Accessibility features built into NeuroAligned',
            content: `Every setting below lives in the app under Settings, and changes apply instantly.

Reading and vision
• Dyslexia-friendly font — a typeface designed to reduce letter confusion and improve reading flow
• Larger base text — increases the app's base font size for easier reading when fatigued
• Five colour palettes plus light and dark modes, so you can pick the contrast that suits you
• Auto sensory mode — the palette shifts to a calmer scheme automatically after a check-in shows you're overwhelmed, scattered, or frozen

Motion and sensory load
• Reduce motion — disables non-essential animation and transitions, for vestibular sensitivity, migraine, or sensory overload

Voice
• Read Aloud — hear the current page read to you, with a choice of device voices or richer premium voices
• Dictation — speak into any text field instead of typing
• Command Mode — navigate the app by voice ("go to tasks", "set my focus mode to hyperfocus")

Structure
• Every page is reachable by keyboard, with a visible focus outline
• Interactive controls are labelled for screen readers, and icons are paired with text
• Layouts reflow for mobile and tablet, and respect safe areas on notched devices`,
          },
          {
            icon: Keyboard,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
            title: 'Conformance status',
            content: `NeuroAligned aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. We treat this as a target we are actively working towards, not a finished claim.

We have not yet completed an independent third-party accessibility audit. Until we do, we describe our status as partially conformant: some parts of the app meet Level AA, and some do not yet. The known gaps we're aware of are listed below.

We review accessibility as part of building each new feature, and we prioritise fixes that block someone from using the app at all over fixes that are inconvenient.`,
          },
          {
            icon: Volume2,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
            title: 'Compatibility',
            content: `NeuroAligned is a web application and runs in current versions of Chrome, Safari, Firefox, and Edge, and as an installed app on iOS and Android.

Voice features depend on your browser and device. Dictation and Command Mode use your browser's speech recognition, which is not available in every browser — when it isn't, the app tells you rather than failing silently. Read Aloud falls back to your device's built-in voices if premium voices can't load.

Screen reader support is provided through standard semantic HTML and ARIA labelling. We test primarily with VoiceOver on macOS and iOS, and NVDA on Windows.`,
          },
          {
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
            title: 'Known limitations',
            content: `We'd rather tell you what we know is imperfect than let you discover it alone.

• Drag-and-drop task ordering is difficult to operate without a mouse. A keyboard-accessible alternative is in progress.
• Some AI-generated content — check-in insights, task breakdowns, and journal analysis — is produced as plain text and may not always read cleanly with a screen reader.
• A small number of decorative animations still play when "Reduce motion" is on.
• The Command Mode microphone listens for a fixed set of phrases; unusual phrasing may not be recognised, and it falls back to an AI interpretation rather than a clear error.
• Colour palettes are designed for sensory comfort rather than maximum contrast. If you need higher contrast than our palettes provide, please tell us — it's a gap we want to close.

If something on this list is blocking you, it moves to the top of our queue.`,
          },
          {
            icon: MessageSquare,
            color: 'text-foreground',
            bg: 'bg-card border-border/50',
            title: 'Tell us about a barrier',
            content: `If you hit an accessibility barrier anywhere in NeuroAligned, we want to hear about it — including if you're not sure whether it counts.

Email us at accessibility@neuroaligned.app, or use the Feedback page inside the app.

It helps enormously if you can tell us what you were trying to do, what happened instead, and which device, browser, or assistive technology you were using. You don't need to diagnose the cause — just describe the experience.

We aim to acknowledge every accessibility report within 5 business days and to tell you honestly whether and when we can fix it.`,
          },
        ].map(item => (
          <section key={item.title} className={`border rounded-2xl p-6 space-y-3 ${item.bg}`}>
            <div className="flex items-start gap-3">
              <item.icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
              <h2 className="font-display font-semibold text-lg text-foreground">{item.title}</h2>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-8">{item.content}</div>
          </section>
        ))}

        <p className="text-xs text-muted-foreground text-center">
          Accessibility questions or requests? Contact us at{' '}
          <a href="mailto:accessibility@neuroaligned.app" className="text-primary hover:underline">accessibility@neuroaligned.app</a>
        </p>
      </main>
    </div>
  );
}