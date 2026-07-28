import { Users, Clock, Lock, X, Trash2, Video, Loader2, Plus, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const CALENDAR_CONNECTOR_ID = '6a68111b02df29e55f1a16d1';

function GenerateMeetButton({ room, onGenerate }) {
  const [generating, setGenerating] = useState(false);
  const [errorType, setErrorType] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorType(null);
    try {
      await onGenerate(room);
    } catch (e) {
      setErrorType(e.message === 'no_connection' ? 'no_connection' : 'error');
    }
    setGenerating(false);
  };

  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CALENDAR_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setErrorType(null);
        handleGenerate();
      }
    }, 500);
  };

  if (errorType === 'no_connection') {
    return (
      <div className="space-y-1.5">
        <p className="text-xs text-amber-600 text-center">Connect Google Calendar to generate a Meet link.</p>
        <button onClick={handleConnect} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
          <Link2 className="w-3.5 h-3.5" /> Connect Google Calendar
        </button>
      </div>
    );
  }

  if (errorType === 'error') {
    return (
      <div className="space-y-1.5">
        <p className="text-xs text-amber-600 text-center">Couldn't generate Meet link. Please try again.</p>
        <button onClick={handleGenerate} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 disabled:opacity-50 transition-colors"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      {generating ? 'Generating Meet link…' : 'Generate Google Meet Link'}
    </button>
  );
}

const STATUS_CONFIG = {
  open: { label: 'Open', dot: 'bg-green-500', text: 'text-green-600' },
  active: { label: 'In Session', dot: 'bg-blue-500 animate-pulse', text: 'text-blue-600' },
  closed: { label: 'Closed', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
};

export default function FocusRoomCard({ room, currentUser, onJoin, onLeave, onClose, onDelete, onGenerateMeet }) {
  const status = STATUS_CONFIG[room.status] || STATUS_CONFIG.open;
  const isFull = (room.participant_count || 1) >= (room.max_participants || 6);
  const isHost = room.host_email === currentUser?.email;
  const hasJoined = room.participant_emails?.includes(currentUser?.email);
  const spotsLeft = (room.max_participants || 6) - (room.participant_count || 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-card border border-border/60 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
            <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
            {isHost && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Host</span>}
          </div>
          <h3 className="font-display font-semibold text-base text-foreground truncate">{room.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Hosted by {room.host_name || room.host_email.split('@')[0]}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {room.duration_minutes || 25}m
          </div>
          {isHost && room.status !== 'closed' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onClose(room)}
                title="Close room"
                className="p-1 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(room)}
                title="Delete room"
                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focus topic */}
      {room.focus_topic && (
        <div className="bg-secondary/60 rounded-xl px-3 py-2">
          <p className="text-xs text-muted-foreground font-medium mb-0.5">Focus topic</p>
          <p className="text-sm text-foreground">{room.focus_topic}</p>
        </div>
      )}

      {/* Participants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{room.participant_count || 1} / {room.max_participants || 6} joined</span>
          </div>
          {isFull && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> Full
            </div>
          )}
        </div>

        {/* Participant task list */}
        {room.participant_names?.length > 0 && (
          <div className="space-y-1.5">
            {room.participant_names.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-[10px]">{name[0]?.toUpperCase()}</span>
                </div>
                <span className="font-medium text-foreground truncate">{name}</span>
                {room.participant_tasks?.[i] && (
                  <span className="text-muted-foreground truncate flex-1">— {room.participant_tasks[i]}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Meet link */}
      {room.meet_link && room.status !== 'closed' && (
        <a
          href={room.meet_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Video className="w-4 h-4" />
          Join Google Meet
        </a>
      )}

      {/* Generate Meet link — host only, when no link exists */}
      {!room.meet_link && isHost && room.status !== 'closed' && onGenerateMeet && (
        <GenerateMeetButton room={room} onGenerate={onGenerateMeet} />
      )}

      {/* Action */}
      {room.status !== 'closed' && (
        <div className="pt-1">
          {hasJoined && !isHost ? (
            <button
              onClick={() => onLeave(room)}
              className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors font-medium"
            >
              Leave Room
            </button>
          ) : !isHost && !isFull ? (
            <button
              onClick={() => onJoin(room)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Join Room
            </button>
          ) : isFull && !isHost ? (
            <p className="text-center text-xs text-muted-foreground py-2">Room is full</p>
          ) : null}
        </div>
      )}

      {/* Time info */}
      {room.started_at && (
        <p className="text-[10px] text-muted-foreground text-right">
          Started {formatDistanceToNow(new Date(room.started_at), { addSuffix: true })}
        </p>
      )}
    </motion.div>
  );
}