import { Router } from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  removeColumn
} from '../services/leadsService.js';
import { columnCreateSchema, columnUpdateSchema } from '../validators/columnsSchemas.js';
import { isValidationError, respondValidationError } from '../utils/validation.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ columns: getColumns() });
});

router.post('/', (req, res, next) => {
  try {
    const payload = columnCreateSchema.parse(req.body);
    const column = createColumn({ name: payload.name, color: payload.color ?? '#6366f1' });
    res.status(201).json({ column });
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
    const updates = columnUpdateSchema.parse(req.body);

    const column = updateColumn(id, updates);
    if (!column) {
      return res.status(404).json({ message: 'Coluna não encontrada.' });
    }

    res.json({ column });
  } catch (error) {
    if (isValidationError(error)) {
      return respondValidationError(res, error);
    }
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    removeColumn(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
