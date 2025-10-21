import { create } from 'zustand';
import { api } from '@/lib/api.js';

const localStorageKey = 'light-crm-view-mode';

const getInitialViewMode = () => {
  if (typeof window === 'undefined') return 'kanban';
  return localStorage.getItem(localStorageKey) ?? 'kanban';
};

export const useLeadsStore = create((set, get) => ({
  columns: [],
  leads: [],
  viewMode: getInitialViewMode(),
  isLoading: false,
  selectedLead: null,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [columnsResponse, leadsResponse] = await Promise.all([
        api.getColumns(),
        api.getLeads()
      ]);
      set({
        columns: columnsResponse.columns,
        leads: leadsResponse.leads,
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, mode);
    }
  },

  openLead: (lead) => set({ selectedLead: lead }),
  closeLead: () => set({ selectedLead: null }),

  createLead: async (payload) => {
    const response = await api.createLead(payload);
    set({ leads: [...get().leads, response.lead] });
    return response.lead;
  },

  updateLead: async (id, updates) => {
    const response = await api.updateLead(id, updates);
    set({
      leads: get().leads.map((lead) => (lead.id === id ? response.lead : lead))
    });
    return response.lead;
  },

  moveLead: async (leadId, toColumnId, orderedLeadIds) => {
    await api.updateLead(leadId, { columnId: toColumnId });
    await api.reorderLeads({ columnId: toColumnId, orderedLeadIds });
    await get().fetchInitialData();
  },

  createColumn: async (payload) => {
    const response = await api.createColumn(payload);
    set({ columns: [...get().columns, response.column] });
    return response.column;
  },

  updateColumn: async (id, updates) => {
    const response = await api.updateColumn(id, updates);
    set({
      columns: get().columns.map((column) => (column.id === id ? response.column : column))
    });
    return response.column;
  },

  deleteColumn: async (id) => {
    await api.deleteColumn(id);
    const remaining = get()
      .columns
      .filter((column) => column.id !== id)
      .map((column, index) => ({ ...column, order: index }));
    set({ columns: remaining });
  },

  reorderColumns: async (orderedIds) => {
    const current = get().columns;
    const ordered = orderedIds
      .map((id) => current.find((item) => item.id === id))
      .filter(Boolean);
    const leftovers = current.filter((column) => !orderedIds.includes(column.id));
    const merged = [...ordered, ...leftovers].map((column, index) => ({
      ...column,
      order: index
    }));

    set({ columns: merged });

    await Promise.all(
      merged.map((column) => api.updateColumn(column.id, { order: column.order }))
    );
  },

  setColumns: (columns) => set({ columns }),
  setLeads: (leads) => set({ leads })
}));
