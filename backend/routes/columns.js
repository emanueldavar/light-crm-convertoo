import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../data/store.js';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await readDb();
  const payload = data.columns
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      ...column,
      leads: data.leads.filter((lead) => lead.columnId === column.id)
    }));

  res.json({ columns: payload });
});

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const data = await readDb();

  const nextOrder = data.columns.length
    ? Math.max(...data.columns.map((column) => column.order)) + 1
    : 0;

  const column = {
    id: payload.id || `column-${nanoid(6)}`,
    name: payload.name || 'Nova etapa',
    color: payload.color || '#94A3B8',
    order: payload.order ?? nextOrder
  };

  const updated = {
    ...data,
    columns: [...data.columns, column]
  };

  await writeDb(updated);
  res.status(201).json({ column });
});

router.patch('/:columnId', async (req, res) => {
  const { columnId } = req.params;
  const payload = req.body || {};
  const data = await readDb();

  const index = data.columns.findIndex((column) => column.id === columnId);
  if (index === -1) {
    return res.status(404).json({ message: 'Coluna não encontrada' });
  }

  const updatedColumn = {
    ...data.columns[index],
    ...payload
  };

  delete updatedColumn.orderMap;

  data.columns[index] = updatedColumn;

  if (Array.isArray(payload.orderMap)) {
    data.columns = data.columns.map((column) => {
      const item = payload.orderMap.find((entry) => entry.id === column.id);
      return item ? { ...column, order: item.order } : column;
    });
  }

  await writeDb(data);
  res.json({ column: updatedColumn });
});

router.delete('/:columnId', async (req, res) => {
  const { columnId } = req.params;
  const data = await readDb();

  if (!data.columns.some((column) => column.id === columnId)) {
    return res.status(404).json({ message: 'Coluna não encontrada' });
  }

  const remainingColumns = data.columns.filter((column) => column.id !== columnId);
  const normalizedColumns = remainingColumns
    .sort((a, b) => a.order - b.order)
    .map((column, index) => ({ ...column, order: index }));
  const updatedLeads = data.leads.filter((lead) => lead.columnId !== columnId);

  await writeDb({
    ...data,
    columns: normalizedColumns,
    leads: updatedLeads
  });

  res.status(204).send();
});

export default router;
