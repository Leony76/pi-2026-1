import { z } from 'zod';

export const forgotPassowordEmailSchema = z.object({
  email: z
    .email('E-mail inválido')
    .max(255, 'O e-mail deve ter até 255 catacteres'),
});

export type ForgotPassowordEmailFormData = z.infer<typeof forgotPassowordEmailSchema>;