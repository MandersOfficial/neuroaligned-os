import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { Search, MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

function lastLoginLabel(ts) {
  if (!ts) return 'Never';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Never';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return 'Never'; }
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'text-primary bg-primary/10' },
  user: { label: 'User', color: 'text-muted-foreground bg-secondary' },
};

function UserRow({ user, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;

  return (
    <tr className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {user.full_name?.[0] || user.email?.[0] || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user.full_name || '—'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>{role.label}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.created_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {lastLoginLabel(user.last_login)}
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => { onDelete(user); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    base44.entities.User.list().then(u => { setUsers(u); setLoading(false); });
  }, []);

  const handleDelete = async (user) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    await base44.entities.User.delete(user.id);
    setUsers(users.filter(u => u.id !== user.id));
    showToast('User deleted.');
  };

  const q = debouncedSearch.toLowerCase();
  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(q) ||
    u.full_name?.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} total accounts</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No users found</td></tr>
                ) : (
                  filtered.map(user => (
                    <UserRow key={user.id} user={user} onDelete={handleDelete} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-full text-sm font-medium shadow-lg z-50">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}