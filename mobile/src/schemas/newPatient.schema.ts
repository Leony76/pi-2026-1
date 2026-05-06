import { z } from 'zod';

export const newPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter 3 caracteres no mínimo')
    .max(255, 'O nome deve ter até 255 caracteres'),
  phone: z
    .string()
    .regex(/^\([1-9]{2}\) 9?[0-9]{4}-[0-9]{4}$/, "Formato inválido"),
  email: z
    .email('E-mail inválido')
    .trim()  
    .max(255, 'O e-mail deve ter até 255 caracteres')
    .optional()
    .or(z.literal('')),
  initialDate: z
    .string()
    .min(1, 'A data de início deve ser fornecida'),
  initialHour: z
    .string()
    .min(1, 'O horário deve ser selecionado'),
  observations: z
    .string()
    .min(3, 'A observação deve ter 3 caracteres no mínimo')
    .max(255, 'A observação deve ter até 255 caracteres')
    .optional()
    .or(z.literal('')),
});

export type NewPatientFormData = z.infer<typeof newPatientSchema>;