import { Floor, RoomCharacteristic } from "@prisma/client";

export type NewRoom = {
  enterpriseOwnerId: string;
  roomName: string;
  roomImage?: string | null;
  floor: Floor;
  area: number;
  characteristics: RoomCharacteristic;
  pricePerHour: number;
  priceWeek: number;
  pricePerMonth: number;
  customItems: string[];
  items: { 
    name: "SOFA_DIVA" | "CADEIRA" | "COMPUTADOR" | "MACA" | "ARMARIO" | "BANHEIRO" | "AR_CONDI" | "TV_MONITOR" | "EQUIP_MEDICO" | "ESPELHO" | "PLANTAS" | "ILUMI_ESPECIAL"; 
    quantity: number 
  }[];
}