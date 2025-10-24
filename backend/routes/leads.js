import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLead,
  reorderLeads,
  getColumnById
} from '../services/leadsService.js';
import {
  leadCreateSchema,
  leadUpdateSchema,
  leadsReorderSchema
} from '../validators/leadsSchemas.js';
import { isValidationError, respondValidationError } from '../utils/validation.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ leads: getLeads() });
});

router.post('/', (req, res, next) => {
  try {
    const payload = leadCreateSchema.parse(req.body);

    if (!getColumnById(payload.columnId)) {
      return res.status(404).json({ message: 'Coluna não encontrada.' });
    }

    const lead = createLead(payload);
    res.status(201).json({ lead });
  } catch (error) {
    if (isValidationError(error)) {
      return respondValidationError(res, error);
    }
    next(error);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = leadUpdateSchema.parse(req.body);

    if (updates.columnId && !getColumnById(updates.columnId)) {
      return res.status(404).json({ message: 'Coluna não encontrada.' });
    }

    const lead = updateLead(id, updates);
    if (!lead) {
      return res.status(404).json({ message: 'Lead não encontrado.' });
    }

    res.json({ lead });
  } catch (error) {
    if (isValidationError(error)) {
      return respondValidationError(res, error);
    }
    next(error);
  }
});

router.post('/reorder', (req, res, next) => {
  try {
    const payload = leadsReorderSchema.parse(req.body);

    if (!getColumnById(payload.columnId)) {
      return res.status(404).json({ message: 'Coluna não encontrada.' });
    }

    reorderLeads(payload.columnId, payload.orderedLeadIds);
    res.json({ leads: getLeads() });
  } catch (error) {
    if (isValidationError(error)) {
      return respondValidationError(res, error);
    }
    next(error);
  }
});

export default router;
