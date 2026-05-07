import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Mail, ExternalLink, Loader2 } from 'lucide-react';

const GOOGLE_CALENDAR_CONNECTOR_ID = '69fd1ec20e0e670e38251275';
const GMAIL_CONNECTOR_ID = '69fd1ff7759e80cf1cc1e1e9';

function ConnectorRow({ icon: Icon, name, connectorId, color, bg }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const url = await base44.connectors.connectAppUser(connectorId);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnected(true);
        setLoading(false);
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await base44.connectors.disconnectAppUser(connectorId);
    setConnected(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{name}</p>
          <p className={`text-[10px] font-medium ${connected ? 'text-green-600' : 'text-muted-foreground'}`}>
            {connected ? '● Connected' : '○ Not connected'}
          </p>
        </div>
      </div>
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
      ) : connected ? (
        <button
          onClick={handleDisconnect}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline transition-colors"
        >
          Connect <ExternalLink className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

export default function GoogleConnectWidget() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="font-display font-semibold text-sm text-foreground">Connected Apps</h4>
        <p className="text-[10px] text-muted-foreground mt-0.5">Sync your Google tools for smarter scheduling</p>
      </div>
      <div className="space-y-3">
        <ConnectorRow
          icon={Calendar}
          name="Google Calendar"
          connectorId={GOOGLE_CALENDAR_CONNECTOR_ID}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <ConnectorRow
          icon={Mail}
          name="Gmail"
          connectorId={GMAIL_CONNECTOR_ID}
          color="text-red-500"
          bg="bg-red-50"
        />
      </div>
    </div>
  );
}