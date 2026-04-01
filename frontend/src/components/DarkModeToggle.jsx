import React from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = React.useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-medium"
    >
      <span>{dark ? '☀️' : '🌙'}</span>
      <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
      <div className={`ml-auto w-9 h-5 rounded-full transition-colors duration-300 ${dark ? 'bg-primary-500' : 'bg-slate-200'} relative`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}
