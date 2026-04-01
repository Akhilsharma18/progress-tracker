import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`card p-6 flex items-center gap-4`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ branch: user?.branch || '', year: user?.year || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/api/users/me')
      .then((res) => {
        setStats(res.data.stats);
        setForm({ branch: res.data.branch || '', year: res.data.year || '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/users/me', form);
      updateUser(res.data);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">My Profile</h1>

        {/* Profile card */}
        <div className="card p-6 mb-8 flex items-center gap-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random&size=80`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/20"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
            {!editing ? (
              <div className="flex gap-3 mt-2">
                {user?.branch && (
                  <span className="badge-not-started">🏫 {user.branch}</span>
                )}
                {user?.year && (
                  <span className="badge-progress">📅 Year {user.year}</span>
                )}
                <button
                  className="text-xs text-primary-500 hover:underline font-medium"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-2 items-end flex-wrap">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Branch</label>
                  <input
                    className="input w-40"
                    placeholder="e.g. CSE"
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Year</label>
                  <select
                    className="input w-28"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    <option value="">Select</option>
                    {['1st', '2nd', '3rd', '4th'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 h-24 animate-pulse bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
            <StatCard icon="📚" label="Total Subjects" value={stats?.totalSubjects ?? 0} color="bg-primary-50 dark:bg-primary-900/20" />
            <StatCard icon="✅" label="Topics Completed" value={stats?.completedTopics ?? 0} color="bg-emerald-50 dark:bg-emerald-900/20" />
            <StatCard icon="👥" label="Groups Joined" value={stats?.groupsJoined ?? 0} color="bg-violet-50 dark:bg-violet-900/20" />
            <StatCard icon="🎯" label="Contributions" value={stats?.contributionCount ?? 0} color="bg-amber-50 dark:bg-amber-900/20" />
          </div>
        )}
      </main>
    </div>
  );
}
