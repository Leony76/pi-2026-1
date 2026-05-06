import { ITEMS_NAMES } from '@/types/roomItems.type';
import { z } from 'zod';

export const newRoomSchema = z.object({
  roomName: z
    .string()
    .min(3,   'O nome da sala deve ter 3 caracteres no mínimo')
    .max(255, 'O nome da sala deve ter até 255 catacteres'),
  floor: z
    .string()
    .min(1, 'Selecione um andar'),
  area: z.coerce
    .number()
    .min(1, 'A área deve ser maior ou igual a 1 m²')
    .max(30, 'A área deve ter até 30 m²'),
  characteristics: z
    .string()
    .min(1, 'Selecione uma característica'),
  pricePerHour: z.coerce
    .number()
    .min(1, 'O preço por dia deve ser maior ou igual a R$ 1,00')
    .max(250, 'O preço por dia deve ser até R$ 250,00'),
  priceWeek: z.coerce
    .number()
    .min(1,   'O preço por semana deve ser maior ou igual a R$ 1,00')
    .max(750, 'O preço por semana deve ser até R$ 750,00'),
  pricePerMonth: z.coerce
    .number()
    .min(1,    'O preço por mês deve ser maior ou igual a R$ 1,00')
    .max(1500, 'O preço por mês deve ser até R$ 1500,00'),
  items: z.array(
    z.object({
      name: z
        .enum(ITEMS_NAMES),
      quantity: z
        .number()
        .min(1),   
    })
  ).min(1, 'Selecione ao menos um item'),
});

export type NewRoomFormInput = z.input<typeof newRoomSchema>;
export type NewRoomFormData  = z.output<typeof newRoomSchema>;