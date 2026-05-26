import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Database, Users, RefreshCw, ExternalLink, AlertCircle, ChevronDown } from 'lucide-react';

const NOTION_CONNECTOR_ID = 'notion'; // placeholder — user provides token manually

function StatusBadge({ status }) {
  if (status === 'success') return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Synced
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
      <AlertCircle className="w-3.5 h-3.5" /> Failed
    </span>
  );
  return null;
}

export default function NotionSync() {
  const [accessToken, setAccessToken] = useState('');
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [projectDbId, setProjectDbId] = useState('');
  const [profileDbId, setProfileDbId] = useState('');
  const [syncingProjects, setSyncingProjects] = useState(false);
  const [syncingProfiles, setSyncingProfiles] = useState(false);
  const [projectStatus, setProjectStatus] = useState(null); // null | 'success' | 'error'
  const [profileStatus, setProfileStatus] = useState(null);
  const [projectResult, setProjectResult] = useState(null);
  const [profileResult, setProfileResult] = useState(null);
  const [tokenSaved, setTokenSaved] = useState(false);

  const handleLoadDatabases = async () => {
    if (!accessToken.trim()) return;
    setLoadingDbs(true);
    setDatabases([]);
    const res = await base44.functions.invoke('notionListDatabases', { notion_access_token: accessToken.trim() });
    setDatabases(res.data.databases || []);
    setTokenSaved(true);
    setLoadingDbs(false);
  };

  const handleSyncProjects = async () => {
    if (!projectDbId || !accessToken) return;
    setSyncingProjects(true);
    setProjectStatus(null);
    setProjectResult(null);
    const res = await base44.functions.invoke('notionSyncProjects', {
      notion_database_id: projectDbId,
      notion_access_token: accessToken,
    });
    if (res.data.success) {
      setProjectStatus('success');
      setProjectResult(res.data);
    } else {
      setProjectStatus('error');
      setProjectResult(res.data);
    }
    setSyncingProjects(false);
  };

  const handleSyncProfiles = async () => {
    if (!profileDbId || !accessToken) return;
    setSyncingProfiles(true);
    setProfileStatus(null);
    setProfileResult(null);
    const res = await base44.functions.invoke('notionSyncProfiles', {
      notion_database_id: profileDbId,
      notion_access_token: accessToken,
    });
    if (res.data.success) {
      setProfileStatus('success');
      setProfileResult(res.data);
    } else {
      setProfileStatus('error');
      setProfileResult(res.data);
    }
    setSyncingProfiles(false);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">N</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Connect your Notion workspace</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Paste your Notion Internal Integration Token to sync project statuses and team profiles to your Notion databases.{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Get your token <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      </div>

      {/* Token Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">Notion Integration Token</label>
        <div className="flex gap-2">
          <input
            type="password"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="secret_xxxxxxxxxxxxxxxxxxxx"
            value={accessToken}
            onChange={e => { setAccessToken(e.target.value); setTokenSaved(false); setDatabases([]); }}
          />
          <button
            onClick={handleLoadDatabases}
            disabled={!accessToken.trim() || loadingDbs}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {loadingDbs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            Load Databases
          </button>
        </div>
        {tokenSaved && databases.length > 0 && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {databases.length} database{databases.length !== 1 ? 's' : ''} found
          </p>
        )}
        {tokenSaved && databases.length === 0 && !loadingDbs && (
          <p className="text-xs text-amber-600">No databases found. Make sure your integration has access to the databases.</p>
        )}
      </div>

      {databases.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Project Status Sync */}
          <div className="border border-border/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Project Status Sync</p>
                <p className="text-xs text-muted-foreground">Push project data to Notion</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target Database</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  value={projectDbId}
                  onChange={e => { setProjectDbId(e.target.value); setProjectStatus(null); }}
                >
                  <option value="">Select a database…</option>
                  {databases.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              {['Name', 'Status', 'Priority', 'Client', 'Due Date', 'NeuroAligned ID'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" /> {f}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleSyncProjects}
                disabled={!projectDbId || syncingProjects}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {syncingProjects
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Sync Projects</>
                }
              </button>
              <StatusBadge status={projectStatus} />
            </div>
            {projectResult && projectStatus === 'success' && (
              <p className="text-xs text-green-600">{projectResult.synced} project{projectResult.synced !== 1 ? 's' : ''} synced successfully.</p>
            )}
            {projectResult && projectStatus === 'error' && (
              <p className="text-xs text-destructive">{projectResult.error}</p>
            )}
          </div>

          {/* Team Profile Sync */}
          <div className="border border-border/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Team Profile Sync</p>
                <p className="text-xs text-muted-foreground">Sync member profiles to Notion</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target Database</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  value={profileDbId}
                  onChange={e => { setProfileDbId(e.target.value); setProfileStatus(null); }}
                >
                  <option value="">Select a database…</option>
                  {databases.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              {['Name', 'Email', 'Business Type', 'Work Style', 'Neurotypes'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-violet-400 shrink-0" /> {f}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleSyncProfiles}
                disabled={!profileDbId || syncingProfiles}
                className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {syncingProfiles
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Sync Profiles</>
                }
              </button>
              <StatusBadge status={profileStatus} />
            </div>
            {profileResult && profileStatus === 'success' && (
              <p className="text-xs text-green-600">{profileResult.synced} profile{profileResult.synced !== 1 ? 's' : ''} synced successfully.</p>
            )}
            {profileResult && profileStatus === 'error' && (
              <p className="text-xs text-destructive">{profileResult.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}