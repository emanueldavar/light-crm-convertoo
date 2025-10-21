import { z } from 'zod';

const colorHexRegex = /^#([0-9a-fA-F]{3}){1,2}$/;

export const columnCreateSchema = z.object({
  name: z.string().min(2, 'Informe um nome com ao menos 2 caracteres.'),
  color: z.string().regex(colorHexRegex, 'Informe uma cor em hexadecimal.').optional()
});

export const columnUpdateSchema = z
  .object({
    name: z.string().min(2, 'Informe um nome com ao menos 2 caracteres.').optional(),
    color: z.string().regex(colorHexRegex, 'Informe uma cor em hexadecimal.').optional(),
    order: z.number().int().nonnegative().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.'
  });
