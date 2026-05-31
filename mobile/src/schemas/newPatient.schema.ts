import { z } from 'zod';

export const newPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter 3 caracteres no mínimo')
    .max(255, 'O nome deve ter até 255 caracteres'),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4}-\d{4}$/, "Telefone deve ter 9 números"),
  email: z
    .email('E-mail inválido')
    .trim()  
    .max(255, 'O e-mail deve ter até 255 caracteres')
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .min(1, 'A data deve ser fornecida'),
  startHour: z
    .string()
    .min(1, 'O horário deve ser selecionado'),
  endHour: z
    .string()
    .min(1, "O horário final deve ser selecionado"),
  observations: z
    .string()
    .min(3, 'A observação deve ter 3 caracteres no mínimo')
    .max(255, 'A observação deve ter até 255 caracteres')
    .optional()
    .or(z.literal('')),
});

export type NewPatientFormData = z.infer<typeof newPatientSchema>;