import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Pin } from 'lucide-react';

const SETTING_KEY = 'notion_tasks_database_id';

export default function NotionAutoSyncPin({ dbId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinned, setPinned] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') return;
      setIsAdmin(true);
      return base44.entities.AppSettings.filter({ key: SETTING_KEY }).then(recs => {
        if (recs && recs.length) setPinned(recs[0]);
      });
    }).catch(() => {});
  }, []);

  if (!isAdmin) return null;

  const isPinned = !!pinned?.value;

  const handlePin = async () => {
    if (!dbId) return;
    setBusy(true);
    setMsg(null);
    try {
      if (isPinned) {
        await base44.entities.AppSettings.delete(pinned.id);
        setPinned(null);
        setMsg('Unpinned — automated sync paused.');
      } else {
        const rec = await base44.entities.AppSettings.create({
          key: SETTING_KEY,
          value: dbId,
          label: 'Notion task database (auto-sync)',
          category: 'general',
          type: 'text',
        });
        setPinned(rec);
        setMsg('Pinned — the 30-minute sync will pull from this database.');
      }
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <Pin className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Automated 30-min sync</p>
          <p className="text-xs text-muted-foreground">Pin the selected database as the source for the scheduled task sync.</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          onClick={handlePin}
          disabled={!dbId || busy}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            isPinned
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
          } disabled:opacity-50`}
        >
          {busy ? '…' : isPinned ? 'Pinned · Unpin' : 'Pin this database'}
        </button>
        {isPinned && <span className="text-[11px] text-amber-600">● Auto-sync active</span>}
        {msg && <span className="text-[11px] text-muted-foreground text-right max-w-[240px]">{msg}</span>}
      </div>
    </div>
  );
}