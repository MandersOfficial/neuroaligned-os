import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import FocusRoomCard from '../components/focusrooms/FocusRoomCard';
import CreateRoomModal from '../components/focusrooms/CreateRoomModal';
import JoinRoomModal from '../components/focusrooms/JoinRoomModal';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function FocusRooms() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(null);

  const loadRooms = useCallback(async (currentUser) => {
    const [open, active, allMine] = await Promise.all([
      base44.entities.FocusRoom.filter({ status: 'open' }, '-created_date', 30),
      base44.entities.FocusRoom.filter({ status: 'active' }, '-created_date', 30),
      currentUser ? base44.entities.FocusRoom.list('-created_date', 50) : Promise.resolve([]),
    ]);
    // Merge: open/active for everyone + closed rooms hosted by current user
    const seen = new Set();
    const merged = [...active, ...open];
    merged.forEach(r => seen.add(r.id));
    allMine.forEach(r => {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
    });
    setRooms(merged);
  }, []);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      await loadRooms(u);
      setLoading(false);
    });

    // Poll every 15s for real-time-ish feel
    const interval = setInterval(() => loadRooms(null), 15000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const handleCreateRoom = async (form) => {
    // Generate a Google Meet link for the room
    let meetLink = null;
    try {
      const res = await base44.functions.invoke('createGoogleMeetRoom', {
        roomName: form.name,
        durationMinutes: form.duration_minutes,
      });
      meetLink = res.data.meetLink || null;
    } catch {
      // Meet link is optional — room still works without it
    }

    const room = await base44.entities.FocusRoom.create({
      ...form,
      host_email: user.email,
      host_name: user.full_name || user.email.split('@')[0],
      status: 'open',
      participant_count: 1,
      participant_emails: [user.email],
      participant_names: [user.full_name || user.email.split('@')[0]],
      participant_tasks: ['(Host)'],
      started_at: new Date().toISOString(),
      meet_link: meetLink,
    });
    setRooms(prev => [room, ...prev]);
    setShowCreate(false);
  };

  const handleJoin = async (room, task) => {
    const updatedEmails = [...(room.participant_emails || []), user.email];
    const updatedNames = [...(room.participant_names || []), user.full_name || user.email.split('@')[0]];
    const updatedTasks = [...(room.participant_tasks || []), task || ''];
    const newCount = (room.participant_count || 1) + 1;
    const updated = await base44.entities.FocusRoom.update(room.id, {
      participant_emails: updatedEmails,
      participant_names: updatedNames,
      participant_tasks: updatedTasks,
      participant_count: newCount,
      status: newCount >= (room.max_participants || 6) ? 'active' : 'open',
    });
    setRooms(prev => prev.map(r => r.id === room.id ? updated : r));
    setJoiningRoom(null);
  };

  const handleLeave = async (room) => {
    const idx = (room.participant_emails || []).indexOf(user.email);
    if (idx === -1) return;
    const updatedEmails = room.participant_emails.filter((_, i) => i !== idx);
    const updatedNames = (room.participant_names || []).filter((_, i) => i !== idx);
    const updatedTasks = (room.participant_tasks || []).filter((_, i) => i !== idx);
    const newCount = Math.max(1, (room.participant_count || 1) - 1);
    const updated = await base44.entities.FocusRoom.update(room.id, {
      participant_emails: updatedEmails,
      participant_names: updatedNames,
      participant_tasks: updatedTasks,
      participant_count: newCount,
      status: 'open',
    });
    setRooms(prev => prev.map(r => r.id === room.id ? updated : r));
  };

  const handleCloseRoom = async (room) => {
    const updated = await base44.entities.FocusRoom.update(room.id, { status: 'closed' });
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, ...updated } : r));
  };

  const handleDeleteRoom = async (room) => {
    await base44.entities.FocusRoom.delete(room.id);
    setRooms(prev => prev.filter(r => r.id !== room.id));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Focus Rooms</h1>
              <p className="text-sm text-muted-foreground mt-1">Join a live body-doubling room and work alongside others. Presence creates accountability.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadRooms(user)} className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Create Room
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15">
            <span className="text-xl">👥</span>
            <div>
              <p className="text-sm font-semibold text-foreground">How Focus Rooms work</p>
              <p className="text-xs text-muted-foreground mt-0.5">Create or join a room, declare what you're working on, and focus alongside others. Rooms auto-refresh every 15 seconds.</p>
            </div>
          </div>

          {/* Rooms grid */}
          {rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-base font-semibold text-foreground">No open rooms right now</p>
              <p className="text-sm text-muted-foreground">Be the first — create a room and invite others to join.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create First Room
              </button>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {rooms.map(room => (
                  <FocusRoomCard
                    key={room.id}
                    room={room}
                    currentUser={user}
                    onJoin={(r) => setJoiningRoom(r)}
                    onLeave={handleLeave}
                    onClose={handleCloseRoom}
                    onDelete={handleDeleteRoom}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showCreate && <CreateRoomModal onSave={handleCreateRoom} onClose={() => setShowCreate(false)} />}
        {joiningRoom && <JoinRoomModal room={joiningRoom} onJoin={handleJoin} onClose={() => setJoiningRoom(null)} />}
      </AnimatePresence>
    </div>
  );
}