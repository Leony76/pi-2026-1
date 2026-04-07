import { z } from "zod";

export const loginSchema = z.object({
  email    : z
    .email('E-mail inválido'),
  password : z
    .string()
    .min(8, 'A senha deve haver 8 caracteres no mínimo')
    .max(16, 'A senha deve haver até 16'),
});

export type LoginFormData = z.infer<typeof loginSchema>;