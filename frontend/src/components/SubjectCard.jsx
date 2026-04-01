import React from 'react';
import { Link } from 'react-router-dom';

function countProgress(topics) {
  let total = 0, done = 0;
  topics?.forEach((t) => {
    total++;
    if (t.status === 'done') done++;
    if (t.subtopics?.length) {
      const s = countProgress(t.subtopics);
      total += s.total;
      done += s.done;
    }
  });
  return { total, done };
}

export default function SubjectCard({ subject }) {
  const { total, done } = countProgress(subject.syllabus || []);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      to={`/subject/${subject._id}`}
      className="card p-5 block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">
          {subject.name}
        </h3>
        <div className="flex gap-1.5 flex-shrink-0">
          {subject.isGroup && <span className="badge-progress">👥</span>}
          {subject.isPublic && <span className="badge-done">🌐</span>}
        </div>
      </div>

      {subject.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {subject.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{done}/{total} topics</span>
          <span className="font-semibold text-primary-500">{pct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={
              subject.createdBy?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.createdBy?.name || 'U')}&size=32&background=0ea5e9&color=fff`
            }
            alt={subject.createdBy?.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs text-slate-400 truncate max-w-[100px]">{subject.createdBy?.name}</span>
        </div>
        {subject.isGroup && (
          <span className="text-xs text-slate-400">
            👤 {subject.members?.length || 0} members
          </span>
        )}
      </div>
    </Link>
  );
}
