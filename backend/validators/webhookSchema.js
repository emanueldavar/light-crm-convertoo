import { z } from 'zod';

export const webhookLeadSchema = z.object({
  nome: z.string().min(2, 'nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  mensagem: z.string().optional(),
  valorPotencial: z.coerce.number().nonnegative().optional(),
  tags: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/)
      })
    )
    .optional()
});
