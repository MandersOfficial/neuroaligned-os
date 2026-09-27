import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Additive notes log — adding a note appends to the list, so earlier notes are
 * never overwritten. Each note can be removed deliberately.
 */
export default function TaskNotesEditor({ notes = [], onChange }) {
  const [draft, setDraft] = useState('');

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...(notes || []), text]);
    setDraft('');
  };

  const removeNote = (index) => onChange((notes || []).filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Notes</label>

      {(notes || []).length > 0 && (
        <ul className="space-y-1.5">
          {notes.map((note, i) => (
            <li
              key={`${i}-${note.slice(0, 12)}`}
              className="flex items-start gap-2 text-sm text-foreground bg-secondary/40 border border-border/40 rounded-xl px-3 py-2"
            >
              <span className="flex-1 whitespace-pre-wrap break-words">{note}</span>
              <button
                type="button"
                onClick={() => removeNote(i)}
                title="Remove note"
                className="shrink-0 p-0.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          rows={2}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note — updates, context, anything you don't want to lose…"
          className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}