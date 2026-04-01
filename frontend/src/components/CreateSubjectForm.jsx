import React, { useState } from 'react';
import api from '../utils/api';

function TopicInput({ topic, onChange, onRemove, depth = 0 }) {
  const [showAddSub, setShowAddSub] = useState(false);

  const addSubtopic = () => {
    onChange({
      ...topic,
      subtopics: [
        ...(topic.subtopics || []),
        { title: '', notes: '', subtopics: [], _tempId: Math.random() },
      ],
    });
    setShowAddSub(false);
  };

  const updateSubtopic = (index, updated) => {
    const subs = [...(topic.subtopics || [])];
    subs[index] = updated;
    onChange({ ...topic, subtopics: subs });
  };

  const removeSubtopic = (index) => {
    const subs = [...(topic.subtopics || [])];
    subs.splice(index, 1);
    onChange({ ...topic, subtopics: subs });
  };

  return (
    <div className={`${depth > 0 ? 'ml-5 pl-4 border-l-2 border-slate-200 dark:border-slate-700' : ''} space-y-2`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <input
          className="input flex-1"
          placeholder={depth === 0 ? 'Topic title...' : 'Subtopic title...'}
          value={topic.title}
          onChange={(e) => onChange({ ...topic, title: e.target.value })}
        />
        <input
          className="input w-40"
          placeholder="Notes (optional)"
          value={topic.notes || ''}
          onChange={(e) => onChange({ ...topic, notes: e.target.value })}
        />
        <button
          type="button"
          onClick={() => addSubtopic()}
          className="text-primary-500 hover:text-primary-600 text-xs font-medium flex-shrink-0"
          title="Add subtopic"
        >
          + Sub
        </button>
        {depth < 3 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            ✕
          </button>
        )}
        {depth >= 3 && (
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
        )}
      </div>
      {(topic.subtopics || []).map((sub, i) => (
        <TopicInput
          key={sub._id || sub._tempId || i}
          topic={sub}
          onChange={(u) => updateSubtopic(i, u)}
          onRemove={() => removeSubtopic(i)}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CreateSubjectForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    isGroup: false,
    isPublic: false,
    tags: '',
  });
  const [topics, setTopics] = useState([
    { title: '', notes: '', subtopics: [], _tempId: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTopic = () =>
    setTopics([...topics, { title: '', notes: '', subtopics: [], _tempId: Math.random() }]);

  const cleanTopics = (items) =>
    items
      .filter((t) => t.title.trim())
      .map(({ _tempId, ...rest }) => ({
        ...rest,
        status: 'not-started',
        subtopics: cleanTopics(rest.subtopics || []),
      }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Subject name is required');
    setLoading(true);
    setError('');
    try {
      await api.post('/api/subjects', {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        syllabus: cleanTopics(topics),
      });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-3xl animate-fade-in">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">📝 Create New Subject</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Subject Name *
          </label>
          <input
            className="input"
            placeholder="e.g. Mathematics, Physics..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Brief description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Tags (comma-separated)</label>
          <input
            className="input"
            placeholder="e.g. maths, calculus, jntu"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        {/* Options */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isGroup}
              onChange={(e) => setForm({ ...form, isGroup: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">👥 Group Subject</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">🌐 Public</span>
          </label>
        </div>

        {/* Topics */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">
            Syllabus Topics
          </label>
          <div className="space-y-3">
            {topics.map((t, i) => (
              <TopicInput
                key={t._id || t._tempId || i}
                topic={t}
                onChange={(u) => {
                  const updated = [...topics];
                  updated[i] = u;
                  setTopics(updated);
                }}
                onRemove={() => setTopics(topics.filter((_, idx) => idx !== i))}
              />
            ))}
            <button type="button" className="btn-secondary text-sm" onClick={addTopic}>
              + Add Topic
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : '🚀 Create Subject'}
          </button>
        </div>
      </form>
    </div>
  );
}
