import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, FileText, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const DOCS_CONNECTOR_ID = '6a58bb594a5a09e519c6c4a1';

export default function MeetingSummaryPanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(DOCS_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        setConnected(true);
      }
    }, 500);
  };

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateMeetingSummary', { project_id: selectedProject });
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
    setGenerating(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Meeting Summary</p>
            <p className="text-xs text-muted-foreground">Generate a Google Doc from project notes</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect your Google account to generate meeting summaries as Google Docs.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Docs
              </button>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No projects available. Create a project with notes first.</p>
              ) : (
                <>
                  <MobileSelect
                    value={selectedProject}
                    onChange={v => { setSelectedProject(v); setResult(null); setError(null); }}
                    options={projects.map(p => ({ value: p.id, label: `${p.emoji} ${p.name}` }))}
                    placeholder="Select a project…"
                    label="Project"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                  />

                  <button
                    onClick={handleGenerate}
                    disabled={!selectedProject || generating}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Summary</>}
                  </button>
                </>
              )}

              {result && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">✓ Summary created for "{result.project_name}"</p>
                  <a
                    href={result.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in Google Docs
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