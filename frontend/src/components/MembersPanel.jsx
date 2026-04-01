import React from 'react';
import api from '../utils/api';

export default function MembersPanel({ subject, isAdmin, currentUserId, onRefetch }) {
  const [removing, setRemoving] = React.useState(null);

  const handleRemove = async (uid) => {
    if (!window.confirm('Remove this member?')) return;
    setRemoving(uid);
    try {
      await api.delete(`/api/groups/${subject._id}/members/${uid}`);
      onRefetch?.();
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(null);
    }
  };

  const handleRoleChange = async (uid, role) => {
    try {
      await api.patch(`/api/groups/${subject._id}/members/${uid}/role`, { role });
      onRefetch?.();
    } catch (e) {
      console.error(e);
    }
  };

  const allMembers = [
    ...(subject?.members || []),
  ];

  return (
    <div className="card p-4">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">
        👥 Members ({allMembers.length})
      </h3>
      <div className="space-y-3">
        {allMembers.map((m) => {
          const u = m.user;
          const isSelf = u?._id === currentUserId;
          const isCreator = subject?.createdBy?._id === u?._id;
          return (
            <div
              key={u?._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <img
                src={u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&size=40&background=0ea5e9&color=fff`}
                alt={u?.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{u?.name}</p>
                  {isSelf && <span className="text-xs text-primary-500 font-medium">(you)</span>}
                  {isCreator && <span className="badge-done text-xs">Creator</span>}
                </div>
                <p className="text-xs text-slate-400 truncate">{u?.email}</p>
              </div>

              {/* Role badge / selector */}
              {isAdmin && !isCreator && !isSelf ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  className="text-xs rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span className={m.role === 'admin' || isCreator ? 'badge-progress' : 'badge-not-started'}>
                  {isCreator ? 'Admin' : m.role}
                </span>
              )}

              {/* Remove */}
              {isAdmin && !isCreator && !isSelf && (
                <button
                  onClick={() => handleRemove(u._id)}
                  disabled={removing === u._id}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  title="Remove member"
                >
                  {removing === u._id ? '...' : '✕'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
