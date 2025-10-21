import { z } from 'zod';

const colorHexRegex = /^#([0-9a-fA-F]{3}){1,2}$/;

const tagSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, 'O nome da etiqueta é obrigatório.'),
  color: z.string().regex(colorHexRegex, 'Cor inválida. Utilize um hexadecimal.')
});

export const leadCreateSchema = z.object({
  name: z.string().min(2, 'Informe um nome com ao menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  phone: z.string().optional(),
  company: z.string().optional(),
  value: z.coerce.number().nonnegative('Valor deve ser positivo.').nullable().optional(),
  notes: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  columnId: z.string().min(1, 'columnId é obrigatório.')
});

export const leadUpdateSchema = leadCreateSchema
  .partial()
  .extend({
    value: z.union([
      z.coerce.number().nonnegative('Valor deve ser positivo.'),
      z.null()
    ]).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.'
  });

export const leadsReorderSchema = z.object({
  columnId: z.string().min(1, 'columnId é obrigatório.'),
  orderedLeadIds: z.array(z.string().min(1))
});
