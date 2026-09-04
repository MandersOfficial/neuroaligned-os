import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, Video, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const CALENDAR_CONNECTOR_ID = '69fd1ec20e0e670e38251275';

export default function ProjectSyncPanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(CALENDAR_CONNECTOR_ID);
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
    if (!selectedProject) return;
    setCreating(true);
    setResult(null);
    setError(null);
    setCopied(false);
    try {
      const res = await base44.functions.invoke('createProjectSyncMeet', { project_id: selectedProject });
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

  const handleCopy = () => {
    if (result?.meet_link) {
      navigator.clipboard.writeText(result.meet_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Project Sync Meet</p>
            <p className="text-xs text-muted-foreground">Generate an instant Google Meet link for a project sync</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect Google Calendar to generate instant Google Meet links for your project syncs.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Calendar
              </button>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No projects available. Create a project first.</p>
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
                    onClick={handleCreate}
                    disabled={!selectedProject || creating}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : <><Video className="w-3.5 h-3.5" /> Create Sync Link</>}
                  </button>
                </>
              )}

              {result && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-3 text-xs text-emerald-700 space-y-2">
                  <p className="font-semibold">✓ Meet link created for "{result.project_name}"</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate bg-white/60 px-2 py-1.5 rounded text-[11px] text-emerald-800">{result.meet_link}</code>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                      title="Copy link"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={result.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                    >
                      <Video className="w-3 h-3" /> Join Meeting
                    </a>
                    {result.event_link && (
                      <a
                        href={result.event_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Calendar Event
                      </a>
                    )}
                  </div>
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