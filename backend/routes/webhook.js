import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readDb, writeDb, getFirstColumnId } from '../data/store.js';

const router = Router();

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const columnId = await getFirstColumnId();

  if (!columnId) {
    return res.status(400).json({ message: 'Nenhuma coluna configurada para receber leads.' });
  }

  const data = await readDb();
  const lead = {
    id: `lead-${nanoid(8)}`,
    name: payload.nome || payload.name || 'Lead sem nome',
    email: payload.email || '',
    phone: payload.telefone || payload.phone || '',
    company: payload.empresa || payload.company || '',
    value: payload.valor || payload.value || '',
    notes: payload.mensagem || payload.notes || '',
    tags: [],
    columnId,
    createdAt: new Date().toISOString()
  };

  await writeDb({
    ...data,
    leads: [...data.leads, lead]
  });

  res.status(201).json({ lead });
});

export default router;
