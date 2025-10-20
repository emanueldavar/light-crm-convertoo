import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCRMStore = create(
  devtools((set, get) => ({
    columns: [],
    leads: {},
    tagsPalette: [
      { id: 'tag-prioridade-alta', label: 'Prioridade Alta', color: '#F97316' },
      { id: 'tag-follow-up', label: 'Follow-up', color: '#22D3EE' },
      { id: 'tag-negociacao', label: 'Negociação', color: '#A855F7' }
    ],
    viewMode: 'kanban',
    theme: 'light',
    selectedLeadId: null,
    setColumns: (columns) =>
      set({
        columns: [...columns].sort((a, b) => a.order - b.order)
      }),
    setLeads: (leads) =>
      set({
        leads: leads.reduce((acc, lead) => ({ ...acc, [lead.id]: lead }), {})
      }),
    upsertLead: (lead) =>
      set({
        leads: { ...get().leads, [lead.id]: lead }
      }),
    removeLead: (leadId) => {
      const { [leadId]: _removed, ...rest } = get().leads;
      set({ leads: rest });
    },
    moveLead: (leadId, columnId) => {
      const lead = get().leads[leadId];
      if (!lead) return;
      set({
        leads: { ...get().leads, [leadId]: { ...lead, columnId } }
      });
    },
    reorderColumns: (orderedIds) => {
      const columnsMap = get()
        .columns.reduce((acc, column) => ({ ...acc, [column.id]: column }), {});
      const nextColumns = orderedIds.map((id, index) => ({
        ...columnsMap[id],
        order: index
      }));
      set({ columns: nextColumns });
    },
    setViewMode: (viewMode) => set({ viewMode }),
    setTheme: (theme) => set({ theme }),
    toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    selectLead: (leadId) => set({ selectedLeadId: leadId }),
    clearSelection: () => set({ selectedLeadId: null }),
    updateColumn: (column) => {
      const columns = get().columns.map((current) =>
        current.id === column.id ? { ...current, ...column } : current
      );
      set({ columns });
    },
    addColumn: (column) => set({ columns: [...get().columns, column] }),
    removeColumn: (columnId) => {
      const nextColumns = get().columns.filter((column) => column.id !== columnId);
      const entries = Object.entries(get().leads).filter(([, lead]) => lead.columnId !== columnId);
      set({
        columns: nextColumns,
        leads: Object.fromEntries(entries)
      });
    }
  }))
);

export default useCRMStore;
