import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome de ter 3 caracteres no minimo')
    .max(255, 'O nome deve ter até 255 caracteres'),
  specialty: z
    .string()
    .min(1, 'Selecione uma especialidade'),
  crmCrp: z
    .string()
    .regex(/^\d{5}-[A-Z]{2}$/, 'Formato inválido.'),
  email: z
    .email('E-mail inválido')
    .max(255, 'O E-mail deve ter até 255 caracteres'),
  password: z
    .string()
    .min(8,  'A senha deve haver 8 caracteres no mínimo')
    .max(50, 'A senha deve haver até 50'),
  repeatPassword: z
    .string()
    .min(8,  'A senha repetida deve haver 8 caracteres no mínimo')
    .max(50, 'A senha repetida deve haver até 50'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;