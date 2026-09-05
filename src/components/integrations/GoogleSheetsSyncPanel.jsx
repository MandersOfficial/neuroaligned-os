import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileSelect from '@/components/ui/MobileSelect';
import { Loader2, RefreshCw, Upload, Link2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Table } from 'lucide-react';

const SHEETS_CONNECTOR_ID = '6a58b955a3acbfb32bf0271c';

export default function GoogleSheetsSyncPanel({ onSynced }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [sheetId, setSheetId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listGoogleSheets', {});
      if (res.data.spreadsheets) {
        setConnected(true);
        setSpreadsheets(res.data.spreadsheets);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
    setChecking(false);
  };

  useEffect(() => {
    if (expanded && !checking && connected === false && spreadsheets.length === 0) {
      checkConnection();
    }
  }, [expanded]);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(SHEETS_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        checkConnection();
      }
    }, 500);
  };

  const handleSync = async () => {
    if (!sheetId) return;
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('syncProjectsToSheets', { spreadsheet_id: sheetId });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
        if (onSynced) onSynced();
      }
    } catch (e) {
      setError(e.message);
    }
    setSyncing(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <Table className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sync to Google Sheets</p>
            <p className="text-xs text-muted-foreground">Export project data to a spreadsheet</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {checking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Google Sheets connection…
            </div>
          ) : !connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect your Google account to sync project data to a spreadsheet.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Sheets
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                  <span className="text-xs text-muted-foreground">· {spreadsheets.length} spreadsheet{spreadsheets.length !== 1 ? 's' : ''}</span>
                </div>
                <button onClick={checkConnection} className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {spreadsheets.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No spreadsheets found. Create a Google Sheet in your Drive, then refresh.
                </p>
              ) : (
                <>
                  <MobileSelect
                    value={sheetId}
                    onChange={v => { setSheetId(v); setResult(null); setError(null); }}
                    options={spreadsheets.map(s => ({ value: s.id, label: s.name }))}
                    placeholder="Select a spreadsheet…"
                    label="Spreadsheet"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                  />

                  <button
                    onClick={handleSync}
                    disabled={!sheetId || syncing}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : <><Upload className="w-3.5 h-3.5" /> Sync Projects</>}
                  </button>

                  {result && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-700">
                      <p className="font-semibold">{result.synced} project{result.synced !== 1 ? 's' : ''} synced to the spreadsheet.</p>
                      <p className="text-[10px] mt-0.5 text-green-600">Click "Sync Projects" again anytime to re-sync.</p>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}