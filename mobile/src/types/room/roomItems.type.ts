import { IconName } from "root/assets/icons";

export const ITEMS_NAMES = [
  'Sofa / Divã',
  'Cadeira',
  'Computador',
  'Maca',
  'Armário',
  'Banheiro',
  'Ar-condi.',
  'TV / Monitor.',
  'Equip. médico',
  'Espelho',
  'Plantas',
  'Ilumi. especial',
] as const;

export const ROOM_ITEMS_LIMIT_MAP: Record<NewRoomItem, number> = {
  "Ar-condi."       : 1,
  "Equip. médico"   : 5,
  "Armário"         : 2,
  "Ilumi. especial" : 6,
  "Sofa / Divã"     : 2,
  "TV / Monitor."   : 3,
  "Banheiro"        : 1,
  "Cadeira"         : 10,
  "Computador"      : 5,
  "Maca"            : 2,
  "Espelho"         : 4,
  "Plantas"         : 6,
};

export type NewRoomItem = typeof ITEMS_NAMES[number];

export type RoomItem = {
  name: NewRoomItem;
  icon: IconName;
};