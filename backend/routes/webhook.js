import { Router } from 'express';
import { createLead, getColumns } from '../services/leadsService.js';
import { webhookLeadSchema } from '../validators/webhookSchema.js';
import { isValidationError, respondValidationError } from '../utils/validation.js';

const router = Router();

router.post('/', (req, res, next) => {
  try {
    const payload = webhookLeadSchema.parse(req.body);
    const [firstColumn] = getColumns();

    if (!firstColumn) {
      return res.status(500).json({ message: 'Nenhuma coluna configurada.' });
    }

    const lead = createLead({
      name: payload.nome,
      email: payload.email,
      phone: payload.telefone ?? '',
      company: payload.empresa ?? '',
      value: payload.valorPotencial ?? null,
      notes: payload.mensagem ?? '',
      tags: payload.tags ?? [],
      columnId: firstColumn.id
    });

    res.status(201).json({ message: 'Lead criado a partir do webhook.', lead });
  } catch (error) {
    if (isValidationError(error)) {
      return respondValidationError(res, error);
    }
    next(error);
  }
});

export default router;
