import z from "zod";

  export const changePasswordSchema = z.object({
    currentPassword: z
      .string()
      .min(8, 'A senha atual deve ter no mínimo 8 caracteres')
      .max(50, 'A senha atual deve ter até 50 caracteres'),
  });

  export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;