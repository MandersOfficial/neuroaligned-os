import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, Presentation, ExternalLink, AlertCircle, Info } from 'lucide-react';

const SLIDES_CONNECTOR_ID = '6a58c008c3935ea2b4e8de42';

const PLACEHOLDERS = [
  '{{project_name}}', '{{client_name}}', '{{due_date}}',
  '{{priority}}', '{{status}}', '{{notes}}', '{{description}}',
];

export default function PitchDeckPanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(SLIDES_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        setConnected(true);
      }
    }, 500);
  };

  const handleCreate = async () => {
    if (!selectedProject || !templateUrl.trim()) return;
    setCreating(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('createPitchDeck', {
        project_id: selectedProject,
        template_url: templateUrl.trim(),
      });
      if (res.data.error) {
        setError(res.data.error);
        if (res.data.error.toLowerCase().includes('connection') || res.data.error.toLowerCase().includes('connector')) {
          setConnected(false);
        }
      } else {
        setResult(res.data);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setError(msg);
      if (msg.toLowerCase().includes('connection') || msg.toLowerCase().includes('connector')) {
        setConnected(false);
      }
    }
    setCreating(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <Presentation className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Create Pitch Deck</p>
            <p className="text-xs text-muted-foreground">Generate a Google Slides deck from a template</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect Google Slides to create pitch decks from your templates.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Slides
              </button>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No projects available. Create a project first.</p>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Select Project</label>
                    <select
                      value={selectedProject}
                      onChange={e => { setSelectedProject(e.target.value); setResult(null); setError(null); }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="">Choose a project…</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Template URL</label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/presentation/d/…"
                      value={templateUrl}
                      onChange={e => { setTemplateUrl(e.target.value); setResult(null); setError(null); }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    />
                  </div>

                  {/* Placeholder reference */}
                  <div className="rounded-lg bg-secondary/40 border border-border/40 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Info className="w-3 h-3" /> Use these placeholders in your template:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {PLACEHOLDERS.map(ph => (
                        <code key={ph} className="text-[10px] bg-card border border-border/50 rounded px-1.5 py-0.5 text-foreground">{ph}</code>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={!selectedProject || !templateUrl.trim() || creating}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : <><Presentation className="w-3.5 h-3.5" /> Create Pitch Deck</>}
                  </button>
                </>
              )}

              {result && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2.5 text-xs text-orange-700 space-y-1.5">
                  <p className="font-semibold">✓ Pitch deck created for "{result.project_name}"</p>
                  <p className="text-[10px] text-orange-600">{result.replacements_made} placeholders filled from project data.</p>
                  <a
                    href={result.presentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-700 hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Open Presentation
                  </a>
                </div>
              )}

              {error && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}