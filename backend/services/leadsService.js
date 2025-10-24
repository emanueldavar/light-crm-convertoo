import { memoryStore } from '../db/memoryStore.js';

export const getColumns = () => memoryStore.getColumns();

export const createColumn = ({ name, color }) => memoryStore.addColumn({ name, color });

export const updateColumn = (id, updates) => memoryStore.updateColumn(id, updates);

export const removeColumn = (id) => memoryStore.removeColumn(id);

export const getLeads = () => memoryStore.getLeads();

export const createLead = (payload) => memoryStore.addLead(payload);

export const updateLead = (id, updates) => memoryStore.updateLead(id, updates);

export const reorderLeads = (columnId, orderedLeadIds) => memoryStore.reorderLeads(columnId, orderedLeadIds);

export const getColumnById = (id) => memoryStore.getColumnById(id);
