import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Loader2, X, AlertTriangle, ChevronDown } from 'lucide-react';

const STATUS = {
  pending: { icon: Loader2, cls: 'text-muted-foreground', label: 'pending', spin: true },
  running: { icon: Loader2, cls: 'text-blue-500', label: 'running', spin: true },
  in_progress: { icon: Loader2, cls: 'text-blue-500', label: 'working', spin: true },
  completed: { icon: Check, cls: 'text-green-500', label: 'done' },
  success: { icon: Check, cls: 'text-green-500', label: 'done' },
  failed: { icon: X, cls: 'text-destructive', label: 'failed' },
  error: { icon: AlertTriangle, cls: 'text-destructive', label: 'error' },
};

function ToolCall({ toolCall }) {
  const [open, setOpen] = useState(false);
  const status = STATUS[toolCall.status] || STATUS.pending;
  const Icon = status.icon;
  const failed = toolCall.status === 'failed' || toolCall.status === 'error';
  const dp = toolCall.display_projection || {};
  const hide = dp.hide_details && dp.details_redacted;
  const labelText = failed
    ? (dp.error_label || status.label)
    : (['pending', 'running', 'in_progress'].includes(toolCall.status) ? (dp.active_label || status.label) : (dp.label || status.label));
  const name = toolCall.name || 'tool';

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch { /* keep raw */ }
  let parsedResults = toolCall.results;
  if (typeof parsedResults === 'string') { try { parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ } }
  const isFailedResult =
    (parsedResults && typeof parsedResults === 'object' && parsedResults.success === false) ||
    (typeof parsedResults === 'string' && /error|failed/i.test(parsedResults));

  const fmt = (v) => (typeof v === 'string' ? v : JSON.stringify(v, null, 2));

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => !hide && setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-secondary/40 ${hide ? 'cursor-default' : 'hover:bg-secondary'}`}
      >
        <Icon className={`w-3.5 h-3.5 ${status.cls} ${status.spin ? 'animate-spin' : ''}`} />
        <span className="font-medium text-foreground">{name}</span>
        <span className={failed || isFailedResult ? 'text-destructive' : 'text-muted-foreground'}>· {labelText}</span>
        {!hide && <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {!hide && open && (
        <div className="mt-1.5 ml-1 space-y-1.5">
          {toolCall.arguments_string && (
            <div>
              <p className="font-semibold text-muted-foreground mb-0.5">Parameters</p>
              <pre className="bg-secondary/60 rounded-lg p-2 overflow-x-auto text-[11px] text-foreground whitespace-pre-wrap break-words">{fmt(parsedArgs)}</pre>
            </div>
          )}
          {toolCall.results != null && (
            <div>
              <p className="font-semibold text-muted-foreground mb-0.5">Result</p>
              <pre className={`bg-secondary/60 rounded-lg p-2 overflow-x-auto text-[11px] whitespace-pre-wrap break-words ${failed || isFailedResult ? 'text-destructive' : 'text-foreground'}`}>{fmt(parsedResults)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={`max-w-[85%] ${isUser ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5' : 'bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3'}`}>
        {message.content && (isUser
          ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          : (
            <div className="text-sm leading-relaxed text-foreground">
              <ReactMarkdown
                components={{
                  p: ({ node, ...p }) => <p className="my-1" {...p} />,
                  ul: ({ node, ...p }) => <ul className="list-disc pl-5 my-1 space-y-0.5" {...p} />,
                  ol: ({ node, ...p }) => <ol className="list-decimal pl-5 my-1 space-y-0.5" {...p} />,
                  li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
                  code: ({ node, ...p }) => <code className="bg-secondary/60 px-1 py-0.5 rounded text-[11px]" {...p} />,
                  strong: ({ node, ...p }) => <strong className="font-semibold text-foreground" {...p} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
        {message.tool_calls?.map((tc, i) => <ToolCall key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}