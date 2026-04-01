import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SubjectCard from '../components/SubjectCard';
import CreateSubjectForm from '../components/CreateSubjectForm';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const TABS = ['My Subjects', 'Joined Groups', 'Create Subject', 'Explore Public'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('My Subjects');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Create Subject') return;
    fetchSubjects();
  }, [activeTab, sort]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Explore Public') {
        const res = await api.get(`/api/subjects/public?sort=${sort}`);
        setSubjects(res.data);
      } else {
        const res = await api.get('/api/subjects');
        if (activeTab === 'My Subjects') {
          setSubjects(res.data.filter((s) => s.createdBy._id === user._id));
        } else {
          setSubjects(
            res.data.filter(
              (s) => s.isGroup && s.createdBy._id !== user._id
            )
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoinLoading(true);
    setJoinMsg('');
    try {
      const res = await api.post('/api/groups/join', { inviteCode: joinCode.trim().toUpperCase() });
      setJoinMsg('✅ Joined! Redirecting...');
      setTimeout(() => (window.location.href = `/subject/${res.data.subjectId}`), 1200);
    } catch (err) {
      setJoinMsg('❌ ' + (err.response?.data?.error || 'Invalid invite code'));
    } finally {
      setJoinLoading(false);
    }
  };

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Dashboard 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-primary-500">{user?.name}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearch(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white dark:bg-surface-card text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create Subject Tab */}
        {activeTab === 'Create Subject' && (
          <CreateSubjectForm onCreated={() => setActiveTab('My Subjects')} />
        )}

        {/* Joined Groups — join via code */}
        {activeTab === 'Joined Groups' && (
          <div className="mb-6 card p-4 flex gap-3 items-center">
            <input
              className="input flex-1"
              placeholder="Enter invite code (e.g. AB12CD34)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button className="btn-primary" onClick={handleJoinGroup} disabled={joinLoading}>
              {joinLoading ? 'Joining...' : 'Join Group'}
            </button>
            {joinMsg && <span className="text-sm">{joinMsg}</span>}
          </div>
        )}

        {/* Search + Sort bar (not on Create tab) */}
        {activeTab !== 'Create Subject' && (
          <div className="flex items-center gap-3 mb-6">
            <SearchBar value={search} onChange={setSearch} />
            <select
              className="input w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Sort: Recent</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        )}

        {/* Subjects Grid */}
        {activeTab !== 'Create Subject' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-5 h-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No subjects found</h3>
                <p className="text-slate-500 mt-2">
                  {activeTab === 'My Subjects'
                    ? 'Create your first subject to get started!'
                    : 'Try a different search or join a group using an invite code.'}
                </p>
                {activeTab === 'My Subjects' && (
                  <button className="btn-primary mt-4" onClick={() => setActiveTab('Create Subject')}>
                    + Create Subject
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
                {filtered.map((s) => (
                  <SubjectCard key={s._id} subject={s} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
