import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, Calendar, CalendarPlus, ExternalLink, Video, AlertCircle, CheckCircle2 } from 'lucide-react';

const CALENDAR_CONNECTOR_ID = '69fd1ec20e0e670e38251275';

export default function CalendarSchedulePanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  const handleSchedule = async () => {
    setScheduling(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('scheduleProjectMeetings', {});
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
    setScheduling(false);
  };

  const activeCount = projects.filter(p => p.status === 'active').length;

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Schedule Project Meetings</p>
            <p className="text-xs text-muted-foreground">Auto-schedule focus sessions in Google Calendar</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect Google Calendar to find free slots and schedule work sessions for your active projects.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Calendar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
                <span className="text-xs text-muted-foreground">· {activeCount} active project{activeCount !== 1 ? 's' : ''}</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Finds free 60-minute slots in your calendar (weekdays 9am–5pm) and schedules focus sessions for your active projects, prioritized by urgency. Google Meet links are included.
              </p>

              <button
                onClick={handleSchedule}
                disabled={scheduling || activeCount === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {scheduling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling…</> : <><CalendarPlus className="w-3.5 h-3.5" /> Schedule Meetings</>}
              </button>

              {result && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs text-rose-700 space-y-2">
                  <p className="font-semibold">{result.scheduled_count} meeting{result.scheduled_count !== 1 ? 's' : ''} scheduled · {result.slots_found} free slots found</p>
                  {result.scheduled?.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      {s.error ? (
                        <span className="text-red-600">✗ {s.project}: {s.error}</span>
                      ) : (
                        <>
                          <span className="font-medium">{s.project}</span>
                          <span className="text-rose-500">{new Date(s.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          {s.meet_link && (
                            <a href={s.meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                              <Video className="w-3 h-3" /> Meet
                            </a>
                          )}
                          {s.link && (
                            <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Event
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  ))}
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