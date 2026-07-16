import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, Video, ExternalLink, RefreshCw, Calendar, AlertCircle, Users } from 'lucide-react';

const CALENDAR_CONNECTOR_ID = '69fd1ec20e0e670e38251275';

export default function UpcomingMeetingsPanel() {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState(null);
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

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listUpcomingMeetings', {});
      if (res.data.error) {
        setError(res.data.error);
        if (res.data.error.toLowerCase().includes('connection') || res.data.error.toLowerCase().includes('connector')) {
          setConnected(false);
        }
      } else {
        setMeetings(res.data.meetings);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setError(msg);
      if (msg.toLowerCase().includes('connection') || msg.toLowerCase().includes('connector')) {
        setConnected(false);
      }
    }
    setLoading(false);
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Upcoming Virtual Meetings</p>
            <p className="text-xs text-muted-foreground">View all upcoming Google Meet calls from your calendar</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect Google Calendar to view your upcoming Google Meet video calls.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Calendar
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleLoad}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</> : <><RefreshCw className="w-3.5 h-3.5" /> Load Upcoming Meetings</>}
              </button>

              {meetings && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">{meetings.length} upcoming meeting{meetings.length !== 1 ? 's' : ''}</p>

                  {meetings.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      <Video className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      No upcoming virtual meetings with Google Meet links.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {meetings.map(m => (
                        <div key={m.id} className="rounded-xl border border-border/50 p-3 bg-secondary/20 space-y-1.5">
                          <p className="text-sm font-semibold text-foreground leading-snug">{m.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(m.start)}
                          </p>
                          {m.attendees?.length > 0 && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" /> {m.attendees.join(', ')}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pt-0.5">
                            {m.meet_link && (
                              <a
                                href={m.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium"
                              >
                                <Video className="w-3 h-3" /> Join
                              </a>
                            )}
                            {m.event_link && (
                              <a
                                href={m.event_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                              >
                                <ExternalLink className="w-3 h-3" /> Event
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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