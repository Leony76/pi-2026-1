import { z } from 'zod';

export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
    .max(50, 'A nova senha deve ter até 50 caracteres'),
  repeatNewPassword: z
    .string()
    .min(8, 'A nova senha repetida deve ter no mínimo 8 caracteres')
    .max(50, 'A nova senha repetida deve ter até 50 caracteres'),
}).refine((data) => data.newPassword === data.repeatNewPassword, {
  message: "As senhas não coincidem",
  path: ["repeatNewPassword"],
});

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;