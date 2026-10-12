import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MessageBubble from '@/components/agents/MessageBubble';
import { Loader2, Send, Scissors } from 'lucide-react';

const AGENT_NAME = 'task_breakdown';
const SUGGESTIONS = [
  'Review my tasks and break down the heaviest one',
  "I'm stuck on one big task",
  'I have low energy today — help me pick tiny steps',
];

export default function TaskBreakdown() {
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin('/task-breakdown'); return; }
      setUser(u);
      let conv = null;
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (list && list.length) conv = list[0];
      } catch { /* ignore */ }
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: 'Task Breakdown', description: 'Break overwhelming tasks into sensory-friendly steps' },
        });
      }
      setConversation(conv);
      setMessages(conv.messages || []);
      setLoading(false);
      unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
    })();
    return () => unsub();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
    setSending(true);
    setInput('');
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } catch { /* ignore */ }
    setSending(false);
  };

  if (loading || !conversation) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 flex flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
        {/* Header */}
        <div className="px-5 lg:px-8 py-4 border-b border-border/40 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-foreground">Break It Down</h1>
            <p className="text-xs text-muted-foreground">Turn overwhelming tasks into small, sensory-friendly steps.</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <p className="font-display font-semibold text-foreground">What feels heaviest right now?</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Tell me what's overwhelming, or ask me to review your task list and break the big ones into tiny, doable steps.
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border/40 px-4 lg:px-8 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shrink-0">
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              placeholder="Describe what's overwhelming, or ‘review my tasks’…"
              className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary max-h-32 text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="shrink-0 w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-primary/90"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}