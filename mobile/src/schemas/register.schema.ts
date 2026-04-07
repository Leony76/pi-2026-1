import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome de ter 3 caracteres no minimo')
    .max(50, 'O nome deve ter até 50 caracteres'),
  specialty: z
    .string()
    .min(1, 'Selecione uma especialidade'),
  crmCrp: z
    .string()
    .length(9, 'O CRM / CRP deve ter exatamente 8 caracteres'),
  email: z
    .email('E-mail inválido'),
  password: z
    .string()
    .min(8,  'A senha deve haver 8 caracteres no mínimo')
    .max(16, 'A senha deve haver até 16'),
  repeatPassword: z
    .string()
    .min(8,  'A senha repetida deve haver 8 caracteres no mínimo')
    .max(16, 'A senha repetida deve haver até 16'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;