import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Topbar } from '@/components/Topbar.jsx';
import { LeadModal } from '@/components/LeadModal.jsx';
import { KambanView } from '@/pages/KambanView.jsx';
import { ListView } from '@/pages/ListView.jsx';
import { useLeadsStore } from '@/store/useLeadsStore.js';
import { api } from '@/lib/api.js';
import { useTheme } from '@/hooks/useTheme.js';
import { useToast } from '@/hooks/useToast.js';
import { ColumnDialog } from '@/components/dialogs/ColumnDialog.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { LoadingSkeleton } from '@/components/LoadingSkeleton.jsx';

const columnDialogInitialState = { open: false, mode: 'create', column: null };

function App() {
  const fetchInitialData = useLeadsStore((state) => state.fetchInitialData);
  const moveLead = useLeadsStore((state) => state.moveLead);
  const viewMode = useLeadsStore((state) => state.viewMode);
  const setViewMode = useLeadsStore((state) => state.setViewMode);
  const columns = useLeadsStore((state) => state.columns);
  const leads = useLeadsStore((state) => state.leads);
  const setLeads = useLeadsStore((state) => state.setLeads);
  const setColumns = useLeadsStore((state) => state.setColumns);
  const createColumn = useLeadsStore((state) => state.createColumn);
  const updateColumn = useLeadsStore((state) => state.updateColumn);
  const deleteColumn = useLeadsStore((state) => state.deleteColumn);
  const reorderColumns = useLeadsStore((state) => state.reorderColumns);
  const selectedLead = useLeadsStore((state) => state.selectedLead);
  const closeLead = useLeadsStore((state) => state.closeLead);
  const isLoading = useLeadsStore((state) => state.isLoading);

  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [columnDialog, setColumnDialog] = useState(() => ({ ...columnDialogInitialState }));
  const [columnToDelete, setColumnToDelete] = useState(null);
  const previousLeadCount = useRef(0);

  const orderedColumns = useMemo(
    () => [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [columns]
  );

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    previousLeadCount.current = leads.length;
  }, [leads.length]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [columnsResponse, leadsResponse] = await Promise.all([
          api.getColumns({ retry: 1 }),
          api.getLeads({ retry: 1 })
        ]);
        setColumns(columnsResponse.columns);
        if (leadsResponse.leads.length > previousLeadCount.current) {
          toast.success('Novo lead recebido!');
        }
        previousLeadCount.current = leadsResponse.leads.length;
        setLeads(leadsResponse.leads);
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [setColumns, setLeads, toast]);

  const openCreateColumnDialog = useCallback(() => {
    setColumnDialog({ open: true, mode: 'create', column: null });
  }, []);

  const openEditColumnDialog = useCallback((column) => {
    setColumnDialog({ open: true, mode: 'edit', column });
  }, []);

  const closeColumnDialog = useCallback(() => {
    setColumnDialog(() => ({ ...columnDialogInitialState }));
  }, []);

  const handleColumnSubmit = useCallback(
    async (values) => {
      try {
        const payload = {
          ...values,
          name: values.name.trim()
        };
        if (columnDialog.mode === 'create') {
          await createColumn(payload);
          toast.success('Coluna criada com sucesso!');
        } else if (columnDialog.column) {
          await updateColumn(columnDialog.column.id, payload);
          toast.success('Coluna atualizada.');
        }
        return true;
      } catch (error) {
        console.error('Erro ao salvar coluna:', error);
        toast.error('Não foi possível salvar a coluna.');
        return false;
      }
    },
    [columnDialog, createColumn, updateColumn, toast]
  );

  const requestDeleteColumn = useCallback((column) => {
    setColumnToDelete(column);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setColumnToDelete(null);
  }, []);

  const handleDeleteColumn = useCallback(async () => {
    if (!columnToDelete) {
      return false;
    }
    try {
      await deleteColumn(columnToDelete.id);
      toast.success('Coluna removida.');
      return true;
    } catch (error) {
      console.error('Erro ao remover coluna:', error);
      toast.error('Não foi possível remover a coluna.');
      return false;
    }
  }, [columnToDelete, deleteColumn, toast]);

  const handleDragEnd = useCallback(
    async (leadId, columnId, orderedIds) => {
      try {
        await moveLead(leadId, columnId, orderedIds);
        toast.success('Lead movido.');
      } catch (error) {
        console.error('Erro ao mover lead:', error);
        toast.error('Erro ao mover lead.');
      }
    },
    [moveLead, toast]
  );

  const handleMoveColumn = useCallback(
    async (column, targetIndex) => {
      const currentIndex = orderedColumns.findIndex((item) => item.id === column.id);
      if (currentIndex === targetIndex) {
        return;
      }
      const ids = orderedColumns.map((item) => item.id);
      ids.splice(currentIndex, 1);
      ids.splice(targetIndex, 0, column.id);
      try {
        await reorderColumns(ids);
        toast.success('Colunas reordenadas.');
      } catch (error) {
        console.error('Erro ao reordenar colunas:', error);
        toast.error('Não foi possível reordenar as colunas.');
        fetchInitialData();
      }
    },
    [orderedColumns, reorderColumns, toast, fetchInitialData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200 px-4 py-10 text-slate-900 transition dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Topbar
          viewMode={viewMode}
          onViewChange={setViewMode}
          onCreateColumn={openCreateColumnDialog}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <motion.section
          layout
          className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : viewMode === 'list' ? (
            <ListView leads={leads} columns={orderedColumns} />
          ) : (
            <KambanView
              columns={orderedColumns}
              leads={leads}
              onDragEnd={handleDragEnd}
              onEditColumn={openEditColumnDialog}
              onDeleteColumn={requestDeleteColumn}
              onMoveColumn={handleMoveColumn}
            />
          )}
        </motion.section>
      </div>
      <LeadModal lead={selectedLead} onClose={closeLead} />
      <ColumnDialog
        open={columnDialog.open}
        mode={columnDialog.mode}
        initialValues={columnDialog.column ?? undefined}
        onClose={closeColumnDialog}
        onSubmit={handleColumnSubmit}
      />
      <ConfirmDialog
        open={!!columnToDelete}
        title="Remover coluna"
        description="Essa ação removerá a coluna e todos os leads associados. Deseja continuar?"
        confirmLabel="Remover"
        onConfirm={handleDeleteColumn}
        onClose={closeDeleteDialog}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
