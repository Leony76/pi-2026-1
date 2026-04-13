import { z } from 'zod';

export const newPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter 3 caracteres no mínimo')
    .max(255, 'O nome deve ter até 255 caracteres'),
  phone: z
    .string()
    .regex(/^\([1-9]{2}\) 9?[0-9]{5}-[0-9]{4}$/, "Formato inválido. Use (XX) XXXXX-XXXX"),
  email: z
    .email('E-mail inválido')
    .trim()  
    .max(255, 'O e-mail deve ter até 255 caracteres')
    .optional()
    .or(z.literal('')),
  initialDate: z
    .string()
    .min(1, 'A data de início deve ser fornecida'),
  observations: z
    .string()
    .min(3, 'A observação deve ter 3 caracteres no mínimo')
    .max(255, 'A observação deve ter até 255 caracteres')
    .optional(),
});

export type NewPatientFormData = z.infer<typeof newPatientSchema>;