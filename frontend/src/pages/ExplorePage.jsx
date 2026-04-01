import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SubjectCard from '../components/SubjectCard';
import SearchBar from '../components/SearchBar';
import api from '../utils/api';

export default function ExplorePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/subjects/public?sort=${sort}`)
      .then((res) => setSubjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort]);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Explore 🌐</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Discover public subjects shared by the community
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search public subjects..." />
          <select
            className="input w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card p-5 h-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No public subjects found</h3>
            <p className="text-slate-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {filtered.map((s) => (
              <SubjectCard key={s._id} subject={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
