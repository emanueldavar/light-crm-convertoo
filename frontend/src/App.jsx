import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, MoonStar, Plus, Columns3, Rows3, LayoutGrid } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import useCRMStore from './store/useCRMStore.js';
import { api } from './lib/api.js';
import KanbanView from './pages/KanbanView.jsx';
import ListView from './pages/ListView.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import LeadModal from './components/LeadModal.jsx';

const layoutOptions = [
  { id: 'kanban', icon: Columns3, label: 'Kamban' },
  { id: 'list', icon: Rows3, label: 'Lista' }
];

function App() {
  const {
    columns,
    leads,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    setTheme,
    setColumns,
    setLeads,
    addColumn,
    selectLead,
    selectedLeadId,
    clearSelection
  } = useCRMStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const latestLeadIds = useRef(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const board = await api.getBoard();
        setColumns(board.columns);
        setLeads(board.leads);
        latestLeadIds.current = new Set(board.leads.map((lead) => lead.id));
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
        toast.error('Não foi possível carregar o funil.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [setColumns, setLeads]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = localStorage.getItem('light-crm-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, [setTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('light-crm-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isLoading) return;

    if (typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      try {
        const { leads: serverLeads } = await api.getLeads();
        const serverIds = new Set(serverLeads.map((lead) => lead.id));
        const newLeads = serverLeads.filter((lead) => !latestLeadIds.current.has(lead.id));
        if (newLeads.length) {
          toast.success(newLeads.length === 1 ? 'Novo lead recebido!' : `${newLeads.length} novos leads recebidos!`);
          setLeads(serverLeads);
          latestLeadIds.current = serverIds;
        } else if (serverLeads.length !== latestLeadIds.current.size) {
          setLeads(serverLeads);
          latestLeadIds.current = serverIds;
        }
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoading, setLeads]);

  const orderedColumns = useMemo(() => [...columns].sort((a, b) => a.order - b.order), [columns]);

  const handleCreateColumn = async () => {
    setIsCreatingColumn(true);
    try {
      const columnName = prompt('Nome da nova etapa');
      if (!columnName) return;
      const { column } = await api.createColumn({ name: columnName });
      addColumn(column);
      toast.success('Coluna criada com sucesso!');
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      toast.error('Erro ao criar coluna');
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const selectedLead = selectedLeadId ? leads[selectedLeadId] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 shadow-soft"
            >
              <LayoutGrid className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Light CRM Convertoo</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Organize seu funil com fluidez e personalização total.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </button>
            <ViewToggle options={layoutOptions} value={viewMode} onChange={setViewMode} />
            <button
              type="button"
              onClick={handleCreateColumn}
              disabled={isCreatingColumn}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Nova coluna
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-6 py-6">
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <motion.div
              className="h-16 w-16 rounded-full border-4 border-primary-500/30 border-t-primary-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanView columns={orderedColumns} leads={leads} onSelectLead={selectLead} />
        ) : (
          <ListView columns={orderedColumns} leads={leads} onSelectLead={selectLead} />
        )}
      </main>
      <LeadModal open={Boolean(selectedLead)} lead={selectedLead} onClose={clearSelection} />
    </div>
  );
}

export default App;
