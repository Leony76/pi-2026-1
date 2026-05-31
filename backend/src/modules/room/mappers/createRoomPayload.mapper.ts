import { ROOM_ITEM_MAP } from "../../../consts/room/service.consts";
import { AuthPayload } from "../../../types/auth/authPayload.type";
import { NewRoom } from "../../../types/room/newRoom.type";

export const createRoomPayloadMapper = (
  roomName: string,
  data: NewRoom,
  mappedCharacteristic: string | undefined,
  mappedFloor: string | undefined,
) => {
  return {
    title: roomName,
    displayImage: data.roomImage ?? null,
    floor: mappedFloor as "GROUND_FLOOR" | "FIRST_FLOOR" | "SECOND_FLOOR" | "THIRD_FLOOR" | "FOURTH_FLOOR" | "FIFTH_FLOOR",
    area: data.area,
    characteristic: mappedCharacteristic as "AIR_CONDITIONER" | "SOUNDPROOFED" | "AIR_CONDITIONER_PLUS_SOUNDPROOFED" | "DEFAULT",
    enterpriseOwner: { connect: { id: data.enterpriseOwnerId }},
    customItems: { create: data.customItems.map((name) => ({ name }))},
    prices: {
      create: {
        pricePerHour: data.pricePerHour,
        priceWeek: data.priceWeek,
        pricePerMonth: data.pricePerMonth,
      },
    },
    items: {
      create: data.items.filter((item) => Boolean(ROOM_ITEM_MAP[item.name])).map((item) => ({
        name: ROOM_ITEM_MAP[item.name] as "SOFA_DIVA" | "CADEIRA" | "COMPUTADOR" | "MACA" | "ARMARIO" | "BANHEIRO" | "AR_CONDI" | "TV_MONITOR" | "EQUIP_MEDICO" | "ESPELHO" | "PLANTAS" | "ILUMI_ESPECIAL",
        quantity: item.quantity,
      })),
    },
  };
}



export const requestCreateRoomPayloadMapper = (
  request: any,
  payload: AuthPayload,
) => {
  return {
    enterpriseOwnerId: payload.sub,
    roomName: request.body.roomName,
    roomImage: request.body.roomImage,
    floor: request.body.floor,
    area: request.body.area,
    characteristics: request.body.characteristics,
    pricePerHour: request.body.pricePerHour,
    priceWeek: request.body.priceWeek,
    pricePerMonth: request.body.pricePerMonth,
    items: Array.isArray(request.body.items) ? request.body.items : [],
    customItems: Array.isArray(request.body.customItems) ? request.body.customItems : [],
  }
}