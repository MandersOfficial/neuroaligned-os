import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import JournalDictation from '@/components/journal/JournalDictation';

const MOOD_OPTIONS = [
  { value: 'overwhelmed', emoji: '🔴', label: 'Overwhelmed' },
  { value: 'low_energy', emoji: '🔵', label: 'Low Energy' },
  { value: 'scattered', emoji: '🟡', label: 'Scattered' },
  { value: 'neutral', emoji: '⚪', label: 'Neutral' },
  { value: 'focused', emoji: '🟢', label: 'Focused' },
];

const PROMPTS = [
  "What's taking up the most mental space right now?",
  "What's one thing you're avoiding and why?",
  "What did today feel like in your body?",
  "What do you wish someone understood about you today?",
  "What's one win, even a tiny one?",
];

export default function JournalEditor({ onSaved }) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [analyzing, setAnalyzing] = useState(false);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const stopDictationRef = useRef(null);

  // Appends dictated speech onto the end of the entry
  const appendDictated = (text) => {
    setContent(prev => prev.trim() ? prev.trimEnd() + ' ' + text : text);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    stopDictationRef.current?.();
    setAnalyzing(true);

    // Save entry first
    const today = new Date().toISOString().split('T')[0];
    const entry = await base44.entities.JournalEntry.create({
      content: content.trim(),
      mood,
      date: today,
      analyzed: false,
    });

    // AI analysis
    const analysisRes = await base44.functions.invoke('analyzeJournalEntry', { content: content.trim(), mood });
    const analysis = analysisRes.data;
    const updated = await base44.entities.JournalEntry.update(entry.id, {
      ai_themes: analysis.themes || [],
      ai_insights: analysis.insights || [],
      ai_action_steps: analysis.action_steps || [],
      analyzed: true,
    });

    setAnalyzing(false);
    setContent('');
    setMood('neutral');
    onSaved({ ...entry, ...updated });
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      {/* Mood picker */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">How are you feeling?</p>
        <div className="flex gap-2 flex-wrap">
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                mood === m.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground hover:border-primary/30'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <div className="px-5 pb-3">
        <p className="text-xs text-muted-foreground italic mb-2">✨ {prompt}</p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Just start typing — no filters, no judgment. This is your space..."
          rows={6}
          className="w-full text-sm text-foreground placeholder:text-muted-foreground bg-secondary/40 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{content.length} chars</p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI will extract insights &amp; action steps
        </div>
        <div className="flex items-center gap-2">
          <JournalDictation
            onText={appendDictated}
            registerStop={fn => { stopDictationRef.current = fn; }}
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Send className="w-4 h-4" /> Dump &amp; Analyze</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}