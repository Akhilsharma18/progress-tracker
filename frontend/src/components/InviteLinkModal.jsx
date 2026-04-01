import React, { useState } from 'react';

export default function InviteLinkModal({ inviteCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/dashboard`; // Users join from dashboard
  const displayCode = inviteCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">🔗 Invite Members</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">✕</button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Share this invite code with your classmates. They can join from the Dashboard → Joined Groups tab.
        </p>

        {/* Invite code */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
          <p className="flex-1 text-center text-2xl font-mono font-extrabold text-primary-500 tracking-widest">
            {displayCode}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`btn-primary flex-1 ${copied ? 'bg-emerald-500' : ''}`}
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
