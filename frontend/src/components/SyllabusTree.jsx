import React, { useState } from 'react';
import TopicNode from './TopicNode';
import api from '../utils/api';

export default function SyllabusTree({
  topics,
  subjectId,
  progress,
  setProgress,
  isAdmin,
  onRefetch,
  socket,
  depth = 0,
}) {
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return;
    setAdding(true);
    try {
      await api.post(`/api/subjects/${subjectId}/topics`, { title: newTopicTitle.trim() });
      setNewTopicTitle('');
      setShowAdd(false);
      onRefetch?.();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700' : ''}`}>
      {topics.map((topic) => (
        <TopicNode
          key={topic._id}
          topic={topic}
          subjectId={subjectId}
          progress={progress}
          setProgress={setProgress}
          isAdmin={isAdmin}
          onRefetch={onRefetch}
          depth={depth}
        />
      ))}

      {/* Add root topic button (admin or depth=0) */}
      {depth === 0 && (
        <div className="mt-4">
          {showAdd ? (
            <div className="flex gap-2 items-center">
              <input
                className="input flex-1"
                placeholder="New topic title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                autoFocus
              />
              <button className="btn-primary" onClick={handleAddTopic} disabled={adding}>
                {adding ? '...' : 'Add'}
              </button>
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
              onClick={() => setShowAdd(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}
