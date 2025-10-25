import React, { useEffect, useMemo, useState } from 'react';
import LeadCard from '../components/LeadCard';
import LeadModal from '../components/LeadModal';
import { fetchBoardLeads } from '../api/board'; // tua função de API
import useToast from '../hooks/useToast';
import useDebouncedValue from '../hooks/useDebouncedValue';

type Lead = {
  id: string;
  name: string;
  company?: string;
  value?: number | null;
  tags?: string[];
  columnId?: string;
  columnName?: string;
};

type Column = {
  id: string;
  name: string;
  leads: Lead[];
};

export default function BoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const toast = useToast();

  // Fetch inicial dos leads
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchBoardLeads();
        setLeads(data);
        setColumns(groupLeadsByColumn(data));
      } catch (err) {
        console.error('❌ Erro ao carregar leads:', err);
        toast.error('Falha ao carregar leads.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Abrir modal de edição
  function openModal(leadId: string) {
    setSelectedLeadId(leadId);
    setIsModalOpen(true);
  }

  // Fechar modal
  function closeModal() {
    setIsModalOpen(false);
    setSelectedLeadId(null);
  }

  // Atualiza lead local após salvar
  function handleLeadSaved(updatedLead: Lead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );

    // Atualiza as colunas dinamicamente (mantemos a estrutura principal)
    setColumns((prevCols) => {
      const newCols = prevCols.map((c) => ({ ...c, leads: c.leads.filter((l) => l.id !== updatedLead.id) }));

      const colId = updatedLead.columnId || 'default';
      let targetCol = newCols.find((c) => c.id === colId);
      if (!targetCol) {
        targetCol = {
          id: colId,
          name: updatedLead.columnName || 'Coluna',
          leads: [],
        };
        newCols.push(targetCol);
      }
      // ensure we don't duplicate if it was already present
      if (!targetCol.leads.find((l) => l.id === updatedLead.id)) {
        targetCol.leads.push(updatedLead);
      }
      return newCols;
    });
  }

  // Filtering logic: nome, empresa, valor
  const filteredLeads = useMemo(() => {
    const q = (debouncedQuery || '').trim().toLowerCase();
    if (!q) return leads;

    // If query is a number parse it
    const maybeNumber = Number(q.replace(/[^
\d.,-]/g, '').replace(',', '.'));
    const isNumberQuery = !Number.isNaN(maybeNumber);

    return leads.filter((l) => {
      // name or company match
      const name = (l.name || '').toLowerCase();
      const company = (l.company || '').toLowerCase();
      if (name.includes(q) || company.includes(q)) return true;

      // value match (if numeric query)
      if (isNumberQuery && typeof l.value === 'number' && l.value === maybeNumber) return true;

      // also check stringified value contains the query
      if (l.value != null && String(l.value).toLowerCase().includes(q)) return true;

      return false;
    });
  }, [leads, debouncedQuery]);

  // Derive visible columns from filtered leads
  const visibleColumns = useMemo(() => groupLeadsByColumn(filteredLeads), [filteredLeads]);

  // Compute totals per column (only visible leads)
  const columnTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const col of visibleColumns) {
      let sum = 0;
      for (const l of col.leads) {
        if (typeof l.value === 'number' && !Number.isNaN(l.value)) sum += l.value;
      }
      totals.set(col.id, sum);
    }
    return totals;
  }, [visibleColumns]);

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Painel de Leads</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            aria-label="Buscar leads por nome, empresa ou valor"
            placeholder="Buscar por nome, empresa ou valor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 border rounded shadow-sm"
          />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 animate-pulse mb-4">Carregando leads...</div>
      )}

      {/* Render colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleColumns.map((col) => (
          <div
            key={col.id}
            className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-semibold text-gray-700">{col.name}</div>
              <div className="text-sm text-gray-600">
                {/* Show total formatted as BRL */}
                {columnTotals.has(col.id)
                  ? Number(columnTotals.get(col.id)).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  : 'R$ 0,00'}
              </div>
            </div>

            {col.leads.length > 0 ? (
              <div className="space-y-2">
                {col.leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={openModal} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">Nenhum lead nesta coluna.</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      <LeadModal
        leadId={selectedLeadId}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSaved={handleLeadSaved}
      />
    </div>
  );
}

/**
 * Agrupa os leads em colunas para exibir no board.
 */
function groupLeadsByColumn(leads: Lead[]): Column[] {
  const map = new Map<string, Column>();

  for (const lead of leads) {
    const colId = lead.columnId || 'default';
    const colName = lead.columnName || 'Geral';
    if (!map.has(colId)) {
      map.set(colId, { id: colId, name: colName, leads: [] });
    }
    map.get(colId)!.leads.push(lead);
  }

  return Array.from(map.values());
}