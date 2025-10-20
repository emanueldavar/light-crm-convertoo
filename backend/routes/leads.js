import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../data/store.js';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await readDb();
  res.json({ leads: data.leads });
});

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const data = await readDb();
  const lead = {
    id: payload.id || `lead-${nanoid(8)}`,
    name: payload.name || 'Lead sem nome',
    email: payload.email || '',
    phone: payload.phone || '',
    company: payload.company || '',
    value: payload.value ?? '',
    notes: payload.notes || '',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    columnId: payload.columnId || data.columns.sort((a, b) => a.order - b.order)[0]?.id,
    createdAt: new Date().toISOString()
  };

  const updated = {
    ...data,
    leads: [...data.leads, lead]
  };

  await writeDb(updated);
  res.status(201).json({ lead });
});

router.patch('/:leadId', async (req, res) => {
  const { leadId } = req.params;
  const data = await readDb();
  const index = data.leads.findIndex((lead) => lead.id === leadId);

  if (index === -1) {
    return res.status(404).json({ message: 'Lead não encontrado' });
  }

  const lead = data.leads[index];
  const payload = req.body || {};

  const updatedLead = {
    ...lead,
    ...payload,
    tags: Array.isArray(payload.tags) ? payload.tags : lead.tags
  };

  data.leads[index] = updatedLead;
  await writeDb(data);

  res.json({ lead: updatedLead });
});

router.delete('/:leadId', async (req, res) => {
  const { leadId } = req.params;
  const data = await readDb();

  const exists = data.leads.some((lead) => lead.id === leadId);
  if (!exists) {
    return res.status(404).json({ message: 'Lead não encontrado' });
  }

  const filtered = data.leads.filter((lead) => lead.id !== leadId);
  await writeDb({ ...data, leads: filtered });

  res.status(204).send();
});

export default router;
