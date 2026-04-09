import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, FileText, Loader2, Copy, Tag, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SAMPLE_EMAILS = [
  {
    id: 1,
    from: 'Sarah @ Bloom Co',
    subject: 'Re: Website redesign proposal — feedback needed',
    preview: 'Hi! Love the direction. A few things: the timeline feels tight (we need it by March 15th), and can we add an e-commerce component? Budget is around $8k. Let me know if this works!',
  },
  {
    id: 2,
    from: 'Marcus T.',
    subject: 'Podcast collab — episode ideas',
    preview: "Hey, I'd love to do a crossover episode on neurodivergent entrepreneurship. I have ~5k listeners, mostly founders. Could we do a recording next week? Tues or Weds works for me.",
  },
  {
    id: 3,
    from: 'Internal — Team',
    subject: 'Q1 Wrap-up doc — needs your section by Friday',
    preview: "Reminder: everyone needs to add their Q1 highlights to the shared doc by EOD Friday. Link is in the Slack thread. Don't forget to include metrics if you have them!",
  },
];

export default function ContextCapture() {
  const [inputText, setInputText] = useState('');
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSample, setExpandedSample] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyze = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI assistant for neurodivergent entrepreneurs. Analyze the following email or note and extract structured context for task management.

Email/Note:
"${text}"

Return a JSON with:
- summary: 1-sentence plain-language summary (max 20 words)
- action_items: array of 2-4 specific, clear next actions (strings)
- key_people: array of names/roles mentioned
- deadline: string or null (e.g. "March 15th", "EOD Friday")
- estimated_energy: "low" | "medium" | "high" (how cognitively demanding is this?)
- suggested_task_title: concise task title (max 8 words)
- tags: array of 2-3 relevant tags (e.g. "client", "deadline", "creative")`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          action_items: { type: 'array', items: { type: 'string' } },
          key_people: { type: 'array', items: { type: 'string' } },
          deadline: { type: 'string' },
          estimated_energy: { type: 'string' },
          suggested_task_title: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    setResult(res);
    setLoading(false);
  };

  const handleSample = (email) => {
    setSelectedSample(email.id);
    setInputText(email.preview);
    setResult(null);
  };

  const copyTask = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Task: ${result.suggested_task_title}\n\nContext: ${result.summary}\n\nActions:\n${result.action_items?.map(a => `• ${a}`).join('\n')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ENERGY_COLORS = { low: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', high: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-3.5">
        <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
        <p className="text-xs text-violet-800 leading-relaxed">
          <strong>Manual mode active.</strong> Paste any email, note, or message below — the AI will extract context for your tasks. When Gmail is connected, this happens automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-5">
        {/* Input side */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Email / Note Input
          </h3>

          {/* Sample emails */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Try a sample:</p>
            {SAMPLE_EMAILS.map(email => (
              <button
                key={email.id}
                onClick={() => setExpandedSample(expandedSample === email.id ? null : email.id)}
                className={`w-full text-left border rounded-xl px-3 py-2.5 transition-colors ${
                  selectedSample === email.id ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card hover:border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{email.from}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                  {expandedSample === email.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </div>
                <AnimatePresence>
                  {expandedSample === email.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{email.preview}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSample(email); }}
                        className="mt-2 text-xs text-primary font-semibold hover:underline"
                      >
                        Use this →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={5}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground"
              placeholder="Or paste your own email, meeting notes, message..."
              value={inputText}
              onChange={e => { setInputText(e.target.value); setSelectedSample(null); }}
            />
          </div>

          <button
            onClick={() => analyze(inputText)}
            disabled={!inputText.trim() || loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Capture Context with AI'}
          </button>
        </div>

        {/* Output side */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Extracted Context
          </h3>

          {!result && !loading && (
            <div className="border border-dashed border-border rounded-xl p-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">AI context will appear here after analysis</p>
            </div>
          )}

          {loading && (
            <div className="border border-border rounded-xl p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Reading and extracting context…</p>
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Suggested task */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Suggested Task</p>
                  <p className="text-sm font-bold text-foreground">{result.suggested_task_title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  {result.estimated_energy && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ENERGY_COLORS[result.estimated_energy] || 'bg-secondary text-muted-foreground'}`}>
                      ⚡ {result.estimated_energy} energy
                    </span>
                  )}
                  {result.deadline && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-700">
                      📅 {result.deadline}
                    </span>
                  )}
                  {result.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-muted-foreground">
                      <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
                    </span>
                  ))}
                </div>

                {/* Action items */}
                {result.action_items?.length > 0 && (
                  <div className="border border-border/60 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Action Items</p>
                    {result.action_items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-center leading-4 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* People */}
                {result.key_people?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-muted-foreground">People:</p>
                    {result.key_people.map(p => (
                      <span key={p} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-foreground">{p}</span>
                    ))}
                  </div>
                )}

                <button
                  onClick={copyTask}
                  className="w-full py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy as Task'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}