import { useMemo, useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const sorters = [
  { id: 'name', label: 'Nome' },
  { id: 'value', label: 'Valor' },
  { id: 'createdAt', label: 'Data' }
];

function ListView({ columns, leads, onSelectLead }) {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [isAscending, setIsAscending] = useState(false);

  const columnLookup = useMemo(
    () => columns.reduce((acc, column) => ({ ...acc, [column.id]: column }), {}),
    [columns]
  );

  const filteredLeads = useMemo(() => {
    const entries = Object.values(leads);
    const searched = query
      ? entries.filter((lead) =>
          [lead.name, lead.email, lead.company]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query.toLowerCase()))
        )
      : entries;

    const sorted = [...searched].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      if (valueA === valueB) return 0;

      if (sortField === 'value') {
        const numA = Number(valueA) || 0;
        const numB = Number(valueB) || 0;
        return isAscending ? numA - numB : numB - numA;
      }

      if (sortField === 'createdAt') {
        const timeA = new Date(valueA).getTime();
        const timeB = new Date(valueB).getTime();
        return isAscending ? timeA - timeB : timeB - timeA;
      }

      return isAscending
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    return sorted;
  }, [leads, query, sortField, isAscending]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Visão em lista</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            {filteredLeads.length} leads
          </div>
          <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar lead"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="ml-2 w-48 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            {sorters.map((sorter) => (
              <button
                key={sorter.id}
                type="button"
                onClick={() =>
                  sortField === sorter.id ? setIsAscending((prev) => !prev) : setSortField(sorter.id)
                }
                className={`inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500/40 dark:hover:text-primary-300 ${sortField === sorter.id ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200' : ''}`}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sorter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Contato</th>
              <th className="px-6 py-3">Empresa</th>
              <th className="px-6 py-3">Valor</th>
              <th className="px-6 py-3">Etapa</th>
              <th className="px-6 py-3">Atualizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {filteredLeads.map((lead) => {
              const column = columnLookup[lead.columnId];
              return (
                <tr
                  key={lead.id}
                  className="cursor-pointer bg-white/60 transition hover:bg-primary-50/70 dark:bg-slate-900/40 dark:hover:bg-primary-500/10"
                  onClick={() => onSelectLead(lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-100">{lead.name}</div>
                    <div className="text-xs text-slate-400">{lead.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-500 dark:text-slate-300">{lead.email || '—'}</div>
                    <div className="text-xs text-slate-400">{lead.phone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{lead.company || '—'}</td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                    {formatCurrency(lead.value)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-slate-500"
                      style={{ backgroundColor: `${column?.color ?? '#CBD5F5'}20`, color: column?.color }}
                    >
                      {column?.name || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{formatDateTime(lead.createdAt)}</td>
                </tr>
              );
            })}
            {!filteredLeads.length && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  Nenhum lead encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListView;
