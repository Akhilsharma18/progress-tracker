import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ContributionChart({ progress, members }) {
  // Count progress entries per user
  const counts = {};
  progress.forEach((p) => {
    const uid = p.userId?._id || p.userId;
    if (!uid) return;
    counts[uid] = (counts[uid] || 0) + 1;
  });

  const allUsers = members.map((m) => m.user).filter(Boolean);
  const data = allUsers
    .map((u) => ({
      name: u.name?.split(' ')[0] || 'User',
      contributions: counts[u._id] || 0,
    }))
    .sort((a, b) => b.contributions - a.contributions);

  const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="card p-5 col-span-1 lg:col-span-2">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">🎯 Contribution Heatmap</h3>
      {data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No activity yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              formatter={(v) => [v, 'Topics Tracked']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="contributions" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
