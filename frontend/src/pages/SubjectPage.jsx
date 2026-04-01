import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SyllabusTree from '../components/SyllabusTree';
import MembersPanel from '../components/MembersPanel';
import InviteLinkModal from '../components/InviteLinkModal';
import ExportPDFButton from '../components/ExportPDFButton';
import OverallProgressChart from '../components/charts/OverallProgressChart';
import TopicHeatmap from '../components/charts/TopicHeatmap';
import ContributionChart from '../components/charts/ContributionChart';
import { useSubject } from '../hooks/useSubject';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function SubjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { subject, progress, loading, error, setSubject, setProgress, refetch } = useSubject(id);
  const [showInvite, setShowInvite] = React.useState(false);
  const [activePanel, setActivePanel] = React.useState('syllabus');
  const socketRef = useRef(null);

  // Socket.IO real-time
  useEffect(() => {
    if (!id) return;
    socketRef.current = io('http://localhost:5000', { withCredentials: true });
    socketRef.current.emit('join-subject', id);

    socketRef.current.on('progress-update', ({ topicId, status, user: updater, record }) => {
      setProgress((prev) => {
        const exists = prev.find((p) => p.topicId === topicId && p.userId?._id === updater._id);
        if (exists) {
          return prev.map((p) =>
            p.topicId === topicId && p.userId?._id === updater._id ? { ...p, status } : p
          );
        }
        return [...prev, record || { topicId, status, userId: updater }];
      });
    });

    socketRef.current.on('member-joined', ({ user: newUser }) => {
      setSubject((prev) =>
        prev
          ? { ...prev, members: [...prev.members, { user: newUser, role: 'member' }] }
          : prev
      );
    });

    socketRef.current.on('member-removed', ({ userId }) => {
      setSubject((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.user._id !== userId) }
          : prev
      );
    });

    return () => {
      socketRef.current?.emit('leave-subject', id);
      socketRef.current?.disconnect();
    };
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{error}</h2>
            <Link to="/dashboard" className="btn-primary mt-4 inline-flex">← Back to Dashboard</Link>
          </div>
        </main>
      </div>
    );

  const isAdmin =
    subject?.createdBy?._id === user?._id ||
    subject?.members?.some((m) => m.user?._id === user?._id && m.role === 'admin');

  // Calculate completion
  const countTopics = (topics) => {
    let total = 0, done = 0;
    topics?.forEach((t) => {
      total++;
      const userProg = progress.find((p) => p.topicId === t._id && p.userId?._id === user?._id);
      if (userProg?.status === 'done' || t.status === 'done') done++;
      if (t.subtopics?.length) {
        const sub = countTopics(t.subtopics);
        total += sub.total;
        done += sub.done;
      }
    });
    return { total, done };
  };
  const { total, done } = countTopics(subject?.syllabus || []);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8" id="pdf-export-area">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-primary-500 mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{subject?.name}</h1>
            {subject?.description && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">{subject.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {subject?.isGroup && (
                <span className="badge-progress">👥 Group</span>
              )}
              {subject?.isPublic && (
                <span className="badge-done">🌐 Public</span>
              )}
              {subject?.tags?.map((tag) => (
                <span key={tag} className="badge-not-started">#{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {subject?.isGroup && isAdmin && (
              <button className="btn-secondary" onClick={() => setShowInvite(true)}>
                🔗 Invite
              </button>
            )}
            <ExportPDFButton subject={subject} progress={progress} pct={pct} />
          </div>
        </div>

        {/* Progress overview */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Overall Progress</span>
            <span className="text-2xl font-extrabold text-primary-500">{pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{done} / {total} topics completed</p>
        </div>

        {/* Panel tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {['syllabus', 'charts', 'members'].map((p) => (
            <button
              key={p}
              onClick={() => setActivePanel(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                activePanel === p
                  ? 'bg-white dark:bg-surface-card text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {p === 'syllabus' ? '📋 Syllabus' : p === 'charts' ? '📊 Charts' : '👥 Members'}
            </button>
          ))}
        </div>

        {/* Syllabus Panel */}
        {activePanel === 'syllabus' && (
          <div className="animate-fade-in">
            <SyllabusTree
              topics={subject?.syllabus || []}
              subjectId={id}
              progress={progress}
              setProgress={setProgress}
              isAdmin={isAdmin}
              onRefetch={refetch}
              socket={socketRef.current}
            />
          </div>
        )}

        {/* Charts Panel */}
        {activePanel === 'charts' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OverallProgressChart topics={subject?.syllabus || []} progress={progress} userId={user?._id} />
            <TopicHeatmap topics={subject?.syllabus || []} progress={progress} userId={user?._id} />
            <ContributionChart progress={progress} members={subject?.members || []} />
          </div>
        )}

        {/* Members Panel */}
        {activePanel === 'members' && (
          <div className="animate-fade-in">
            <MembersPanel
              subject={subject}
              isAdmin={isAdmin}
              currentUserId={user?._id}
              onRefetch={refetch}
            />
          </div>
        )}
      </main>

      {showInvite && (
        <InviteLinkModal inviteCode={subject?.inviteCode} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
