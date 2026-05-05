import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const QUADRANTS = [
  {
    id: 'do_first',
    label: 'Do First',
    sub: 'Urgent + Important',
    emoji: '🔥',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400',
    dot: 'bg-red-400',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    sub: 'Not Urgent + Important',
    emoji: '📅',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400',
    dot: 'bg-blue-400',
  },
  {
    id: 'delegate',
    label: 'Delegate',
    sub: 'Urgent + Not Important',
    emoji: '🤝',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-400',
    dot: 'bg-yellow-400',
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    sub: 'Not Urgent + Not Important',
    emoji: '🗑️',
    bg: 'bg-muted/50',
    border: 'border-border/50',
    badge: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
];

export default function EisenhowerMatrix({ tasks }) {
  const [matrix, setMatrix] = useState({ do_first: [], schedule: [], delegate: [], eliminate: [], unassigned: [] });
  const [saving, setSaving] = useState(false);

  // Initialise: tasks without a quadrant go to "unassigned"
  useEffect(() => {
    if (!tasks) return;
    const next = { do_first: [], schedule: [], delegate: [], eliminate: [], unassigned: [] };
    tasks.forEach(t => {
      const q = t.eisenhower_quadrant;
      if (q && next[q] !== undefined) next[q].push(t);
      else next.unassigned.push(t);
    });
    setMatrix(next);
  }, [tasks]);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcId = source.droppableId;
    const dstId = destination.droppableId;

    // Optimistic update
    setMatrix(prev => {
      const next = { ...prev };
      const srcList = [...prev[srcId]];
      const [moved] = srcList.splice(source.index, 1);
      next[srcId] = srcList;

      const dstList = srcId === dstId ? srcList : [...prev[dstId]];
      dstList.splice(destination.index, 0, { ...moved, eisenhower_quadrant: dstId === 'unassigned' ? null : dstId });
      next[dstId] = dstList;
      return next;
    });

    // Persist
    setSaving(true);
    const newQuadrant = dstId === 'unassigned' ? null : dstId;
    await base44.entities.Task.update(draggableId, { eisenhower_quadrant: newQuadrant });
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            ⚡ Eisenhower Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Drag tasks into quadrants to prioritize</p>
        </div>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Unassigned pool */}
        {matrix.unassigned.length > 0 && (
          <Droppable droppableId="unassigned" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex flex-wrap gap-2 p-3 rounded-xl border border-dashed border-border/60 min-h-[44px] transition-colors',
                  snapshot.isDraggingOver && 'bg-primary/5 border-primary/30'
                )}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground w-full mb-1">Unsorted tasks</p>
                {matrix.unassigned.map((task, index) => (
                  <TaskChip key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        {/* 2×2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {QUADRANTS.map(q => (
            <Droppable key={q.id} droppableId={q.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'rounded-xl border p-3 min-h-[120px] flex flex-col gap-2 transition-colors',
                    q.bg, q.border,
                    snapshot.isDraggingOver && 'ring-2 ring-primary/30 scale-[1.01]'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{q.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{q.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{q.sub}</p>
                    </div>
                    <span className={cn('ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full', q.badge)}>
                      {matrix[q.id]?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    {matrix[q.id]?.map((task, index) => (
                      <TaskChip key={task.id} task={task} index={index} dot={q.dot} />
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function TaskChip({ task, index, dot }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background/80 border border-border/50 text-xs text-foreground cursor-grab select-none transition-shadow',
            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/40 cursor-grabbing z-50'
          )}
        >
          {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
          <span className="truncate">{task.title}</span>
        </div>
      )}
    </Draggable>
  );
}