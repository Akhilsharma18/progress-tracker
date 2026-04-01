import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['not-started', 'in-progress', 'done'];
const STATUS_COLORS = {
  done: 'badge-done',
  'in-progress': 'badge-progress',
  'not-started': 'badge-not-started',
};
const STATUS_LABELS = { done: '✅ Done', 'in-progress': '🔄 In Progress', 'not-started': '⬜ Not Started' };

export default function TopicNode({ topic, subjectId, progress, setProgress, isAdmin, onRefetch, depth }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(depth < 1);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const myProgress = progress.find(
    (p) => p.topicId === topic._id && p.userId?._id === user?._id
  );
  const currentStatus = myProgress?.status || topic.status || 'not-started';

  const handleStatusChange = async (newStatus) => {
    if (topic.locked) return;
    setLoading(true);
    try {
      await api.post('/api/progress', {
        subjectId,
        topicId: topic._id,
        status: newStatus,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    try {
      await api.patch(`/api/subjects/${subjectId}/topics/${topic._id}/lock`);
      onRefetch?.();
    } catch (e) {
      console.error(e);
    }
  };

  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-3 flex items-center gap-3">
        {/* Expand/collapse */}
        {hasSubtopics ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* Checkbox */}
        <button
          onClick={() => handleStatusChange(currentStatus === 'done' ? 'not-started' : 'done')}
          disabled={loading || topic.locked}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
            currentStatus === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
          } ${topic.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {currentStatus === 'done' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={`flex-1 text-sm font-medium transition-all duration-200 ${
            currentStatus === 'done'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {topic.title}
        </span>

        {/* Status select */}
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={topic.locked || loading}
          className={`text-xs rounded-full px-2 py-0.5 border-0 font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[currentStatus]} bg-transparent`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {/* Notes toggle */}
        {topic.notes && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-slate-400 hover:text-primary-500 transition-colors"
            title="Toggle notes"
          >
            📝
          </button>
        )}

        {/* Lock (admin) */}
        {isAdmin && (
          <button
            onClick={handleLock}
            title={topic.locked ? 'Unlock topic' : 'Lock topic'}
            className={`transition-colors ${topic.locked ? 'text-red-500' : 'text-slate-300 dark:text-slate-600 hover:text-red-400'}`}
          >
            {topic.locked ? '🔒' : '🔓'}
          </button>
        )}

        {loading && (
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Notes */}
      {showNotes && topic.notes && (
        <div className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          📝 {topic.notes}
        </div>
      )}

      {/* Marker info */}
      {topic.markedBy && currentStatus === 'done' && (
        <div className="px-4 pb-2 text-xs text-slate-400">
          Marked by {topic.markedBy?.name || 'someone'} · {topic.timestamp ? new Date(topic.timestamp).toLocaleDateString() : ''}
        </div>
      )}

      {/* Subtopics (recursive) */}
      {hasSubtopics && expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700">
          {topic.subtopics.map((sub) => (
            <TopicNode
              key={sub._id}
              topic={sub}
              subjectId={subjectId}
              progress={progress}
              setProgress={setProgress}
              isAdmin={isAdmin}
              onRefetch={onRefetch}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
