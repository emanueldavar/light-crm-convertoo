import { randomUUID } from 'crypto';

const seedColumns = () => [
  {
    id: randomUUID(),
    name: 'Novo Lead',
    color: '#6366f1',
    order: 0
  },
  {
    id: randomUUID(),
    name: 'Qualificando',
    color: '#f97316',
    order: 1
  },
  {
    id: randomUUID(),
    name: 'Proposta',
    color: '#22c55e',
    order: 2
  },
  {
    id: randomUUID(),
    name: 'Ganho/Perdido',
    color: '#64748b',
    order: 3
  }
];

const seedLeads = (columns) => {
  const [novoLead, qualificando, proposta] = columns;
  return [
    {
      id: randomUUID(),
      name: 'João Pereira',
      email: 'joao@email.com',
      phone: '(48) 99999-9999',
      company: 'Construtora Alpha',
      value: 35000,
      notes: 'Solicitou apresentação inicial.',
      tags: [
        { id: randomUUID(), name: 'Urgente', color: '#ef4444' }
      ],
      columnId: novoLead.id,
      createdAt: new Date().toISOString(),
      order: 0
    },
    {
      id: randomUUID(),
      name: 'Mariana Lopes',
      email: 'mariana@techspark.io',
      phone: '(11) 98888-1122',
      company: 'TechSpark',
      value: 52000,
      notes: 'Aguardando retorno do time financeiro.',
      tags: [
        { id: randomUUID(), name: 'Financeiro', color: '#10b981' }
      ],
      columnId: qualificando.id,
      createdAt: new Date().toISOString(),
      order: 0
    },
    {
      id: randomUUID(),
      name: 'Carlos Mendes',
      email: 'carlos@visionar.com',
      phone: '(21) 97777-6655',
      company: 'Visionar',
      value: 120000,
      notes: 'Apresentação enviada, aguardando feedback.',
      tags: [
        { id: randomUUID(), name: 'Enterprise', color: '#6366f1' }
      ],
      columnId: proposta.id,
      createdAt: new Date().toISOString(),
      order: 0
    }
  ];
};

class MemoryStore {
  constructor() {
    this.columns = seedColumns();
    this.leads = seedLeads(this.columns);
    this.preferences = {
      viewMode: 'kanban',
      tagPalette: []
    };
  }

  getColumns() {
    return [...this.columns].sort((a, b) => a.order - b.order);
  }

  getColumnById(id) {
    return this.columns.find((column) => column.id === id);
  }

  addColumn({ name, color }) {
    const order = this.columns.length;
    const column = { id: randomUUID(), name, color, order };
    this.columns.push(column);
    return column;
  }

  updateColumn(id, updates) {
    const column = this.getColumnById(id);
    if (!column) {
      return null;
    }

    if (typeof updates.name === 'string') {
      column.name = updates.name;
    }

    if (typeof updates.color === 'string') {
      column.color = updates.color;
    }

    if (typeof updates.order === 'number' && updates.order !== column.order) {
      this.reorderColumn(id, updates.order);
    }

    return column;
  }

  reorderColumn(id, newOrder) {
    const column = this.getColumnById(id);
    if (!column) return null;
    this.columns = this.getColumns().filter((col) => col.id !== id);
    this.columns.splice(newOrder, 0, column);
    this.columns = this.columns.map((col, index) => ({ ...col, order: index }));
    return column;
  }

  removeColumn(id) {
    this.columns = this.columns.filter((column) => column.id !== id);
    this.columns = this.columns.map((column, index) => ({ ...column, order: index }));
    this.leads = this.leads.filter((lead) => lead.columnId !== id);
  }

  getLeads() {
    return this.leads
      .slice()
      .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }

  getLeadById(id) {
    return this.leads.find((lead) => lead.id === id);
  }

  addLead(payload) {
    const lead = {
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      value: payload.value ?? null,
      notes: payload.notes ?? '',
      tags: payload.tags ?? [],
      columnId: payload.columnId,
      createdAt: new Date().toISOString(),
      order: this.getNextOrderForColumn(payload.columnId)
    };
    this.leads.push(lead);
    return lead;
  }

  updateLead(id, updates) {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    Object.assign(lead, {
      name: updates.name ?? lead.name,
      email: updates.email ?? lead.email,
      phone: updates.phone ?? lead.phone,
      company: updates.company ?? lead.company,
      value: updates.value ?? lead.value,
      notes: updates.notes ?? lead.notes,
      tags: updates.tags ?? lead.tags
    });

    if (updates.columnId && updates.columnId !== lead.columnId) {
      lead.columnId = updates.columnId;
    }

    if (typeof updates.order === 'number') {
      lead.order = updates.order;
    }

    return lead;
  }

  getNextOrderForColumn(columnId) {
    const columnLeads = this.leads.filter((lead) => lead.columnId === columnId);
    if (columnLeads.length === 0) return 0;
    return Math.max(...columnLeads.map((lead) => lead.order ?? 0)) + 1;
  }

  reorderLeads(columnId, orderedLeadIds) {
    orderedLeadIds.forEach((leadId, index) => {
      const lead = this.getLeadById(leadId);
      if (lead) {
        lead.columnId = columnId;
        lead.order = index;
      }
    });
  }
}

export const memoryStore = new MemoryStore();
