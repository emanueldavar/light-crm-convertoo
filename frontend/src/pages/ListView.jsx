import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const sortOptions = [
  { key: 'createdAt', label: 'Data' },
  { key: 'name', label: 'Nome' },
  { key: 'value', label: 'Valor potencial' }
];

export function ListView({ leads, columns }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');

  const leadsWithColumn = useMemo(() => {
    const map = new Map(columns.map((column) => [column.id, column.name]));
    return leads.map((lead) => ({
      ...lead,
      columnName: map.get(lead.columnId) ?? '—'
    }));
  }, [columns, leads]);

  const filtered = useMemo(() => {
    return leadsWithColumn
      .filter((lead) => {
        const query = search.toLowerCase();
        return (
          lead.name.toLowerCase().includes(query) ||
          (lead.email ?? '').toLowerCase().includes(query) ||
          (lead.company ?? '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortKey === 'value') {
          return (b.value ?? 0) - (a.value ?? 0);
        }
        if (sortKey === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'pt-BR');
      });
  }, [leadsWithColumn, search, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar lead"
          className="w-full max-w-xs rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          Ordenar por
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Etapa</th>
              <th className="px-6 py-4">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{lead.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-300">{lead.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{lead.company || '—'}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{lead.phone || '—'}</td>
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                  {lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {lead.columnName}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 dark:text-slate-400">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-300">Nenhum lead encontrado.</p>
        ) : null}
      </div>
    </div>
  );
}

ListView.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired
};
