import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function getTopicCompletion(topics, progress, userId) {
  return (topics || []).map((t) => {
    let total = 1, done = 0;
    const p = progress.find((pr) => pr.topicId === t._id && pr.userId?._id === userId);
    if (p?.status === 'done' || t.status === 'done') done++;

    const countSubs = (subs) => {
      subs?.forEach((s) => {
        total++;
        const sp = progress.find((pr) => pr.topicId === s._id && pr.userId?._id === userId);
        if (sp?.status === 'done' || s.status === 'done') done++;
        countSubs(s.subtopics || []);
      });
    };
    countSubs(t.subtopics || []);

    return {
      name: t.title.length > 18 ? t.title.slice(0, 18) + '…' : t.title,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function TopicHeatmap({ topics, progress, userId }) {
  const data = getTopicCompletion(topics, progress, userId);

  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">🌡️ Topic Heatmap</h3>
      {data.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No topics yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Completion']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
