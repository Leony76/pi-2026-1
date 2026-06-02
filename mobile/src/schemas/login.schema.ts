import { z } from "zod";

export const loginSchema = z.object({
  email    : z
    .email('E-mail inválido')
    .max(255, 'O E-mail deve ter até 255 caracteres'),
  password : z
    .string()
    .min(8, 'A senha deve haver 8 caracteres no mínimo')
    .max(50, 'A senha deve haver até 50'),
});

export type LoginFormData = z.infer<typeof loginSchema>;