import { z } from 'zod';

export const newRoomSchema = z.object({
  roomName: z
    .string()
    .min(3,   'O nome da sala deve ter 3 caracteres no mínimo')
    .max(255, 'O nome da sala deve ter até 255 catacteres'),
  floor: z
    .string()
    .min(1, 'Selecione um andar'),
  area: z
    .string()
    .min(1, 'A área deve ser maior ou igual a 1m²')
    .max(30, 'A área deve ter até 30m²'),
  characteristics: z
    .string()
    .min(1, 'Selecione uma característica'),
  pricePerHour: z
    .string()
    .min(1,   'O preço por hora deve ser maior ou igual a R$1,00')
    .max(250, 'O preço por hora deve ser até R$250,00'),
  price_3xWeek: z
    .string()
    .min(1,   'O preço por hora deve ser maior ou igual a R$1,00')
    .max(750, 'O preço por hora deve ser até R$750,00'),
  pricePerMonth: z
    .string()
    .min(1,    'O preço por hora deve ser maior ou igual a R$1,00')
    .max(1500, 'O preço por hora deve ser até R$1500,00'),
});

export type NewRoomFormData = z.infer<typeof newRoomSchema>;