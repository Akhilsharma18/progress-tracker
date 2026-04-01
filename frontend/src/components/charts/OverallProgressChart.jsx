import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

function countByStatus(topics, progress, userId) {
  let done = 0, inProgress = 0, notStarted = 0;
  const walk = (nodes) => {
    nodes?.forEach((t) => {
      const p = progress.find((pr) => pr.topicId === t._id && pr.userId?._id === userId);
      const status = p?.status || t.status || 'not-started';
      if (status === 'done') done++;
      else if (status === 'in-progress') inProgress++;
      else notStarted++;
      walk(t.subtopics || []);
    });
  };
  walk(topics);
  return { done, inProgress, notStarted };
}

export default function OverallProgressChart({ topics, progress, userId }) {
  const { done, inProgress, notStarted } = countByStatus(topics, progress, userId);
  const total = done + inProgress + notStarted;

  const data = [
    { name: 'Done', value: done, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: notStarted, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">📊 Completion Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={3}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{pct}%</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { label: 'Done', value: done, color: 'bg-emerald-500' },
            { label: 'In Progress', value: inProgress, color: 'bg-amber-400' },
            { label: 'Not Started', value: notStarted, color: 'bg-slate-300 dark:bg-slate-600' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`} />
              <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{s.label}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.value}</span>
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-1">{total} total topics</p>
        </div>
      </div>
    </div>
  );
}
