import { Floor, RoomCharacteristic, RoomItemName } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ROOM_ITEMS_LABEL_MAP } from "../../../consts/room/service.consts";

type MapperRequest = {
  title: string;
  displayImage: string | null;
  floor: Floor;
  area: Decimal;
  characteristic: RoomCharacteristic;
  prices: {
      pricePerHour: Decimal;
      priceWeek: Decimal;
      pricePerMonth: Decimal;
  } | null;
  items: {
      name: RoomItemName;
      quantity: number;
  }[];
  customItems: {
      name: string;
  }[];
}

export const roomDetailsMapper = (
  room: MapperRequest
) => {
  return {
    floor: room.floor,
    roomName: room.title,
    area: room.area.toNumber(),
    characteristics: room.characteristic,
    image: room.displayImage,
    pricePerHour: room.prices?.pricePerHour.toNumber() ?? 0,
    pricePerMonth: room.prices?.pricePerMonth.toNumber() ?? 0,
    priceWeek: room.prices?.priceWeek.toNumber() ?? 0,
    customItems: room.customItems.map((item) => item.name),
    items: room.items.map((item) => ({
      quantity: item.quantity,
      name: ROOM_ITEMS_LABEL_MAP[item.name]
    }))
  }
}