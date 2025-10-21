import PropTypes from 'prop-types';
import { ViewToggle } from '@/components/ViewToggle.jsx';

export function Topbar({ viewMode, onViewChange, onCreateColumn, theme, onToggleTheme }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Light CRM Convertoo</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">Gerencie seus leads com eficiência e estilo.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCreateColumn}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary/90"
        >
          Nova coluna
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
        >
          Modo {theme === 'dark' ? 'claro' : 'escuro'}
        </button>
        <ViewToggle value={viewMode} onChange={onViewChange} />
      </div>
    </header>
  );
}

Topbar.propTypes = {
  viewMode: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onCreateColumn: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  onToggleTheme: PropTypes.func.isRequired
};
