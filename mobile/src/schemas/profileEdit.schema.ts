import { z } from 'zod';

export const profileEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter 3 caracteres no mínimo')
    .max(255, 'O nome deve ter até 255 caracteres'),
  specialty: z
    .string()
    .min(1, 'Selecione uma especialidade'),
  crmCrp: z
    .string()
    .regex(/^\d{5}-[A-Z]{2}$/, 'Formato de CRM/CRP inválido.'),
  email: z
    .email('Formato de e-mail inválido')
    .max(255, 'O E-mail deve ter até 255 caracteres'),
  phone: z
    .string()
    .regex(
      /^\([1-9]{2}\) 9?[0-9]{4}-[0-9]{4}$/,
      'Formato de telefone inválido'
    )
    .or(z.literal('')),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;