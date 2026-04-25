import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../src/lib/prisma", () => ({
  default: {
    room: {
      findMany: vi.fn(),
    },
    roomRental: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// ─── Imports ────────────────────────────────────────────────────────────────

import prisma from "../src/lib/prisma";
import { createRoomRental, getRoomsList, getUserRentals } from "../src/modules/room/service";

const FIXED_NOW = new Date("2026-04-25T12:00:00.000Z");

// ─── Factories ───────────────────────────────────────────────────────────────

const makeRoomListItem = (overrides = {}) => ({
  id: "room-1",
  title: "Sala 101",
  displayImage: "image.png",
  floor: "GROUND_FLOOR",
  area: "42.5",
  characteristic: "AIR_CONDITIONER_PLUS_SOUNDPROOFED",
  isAvailable: true,
  items: [], // 
  prices: {
    pricePerHour: "80.00",
    price3xWeek: "220.00",
    pricePerMonth: "700.00",
  },
  ...overrides,
});

const makeRentalRecord = (overrides = {}) => ({
  id: "rental-1",
  room: {
    title: "Sala 101",
    floor: "GROUND_FLOOR",
    characteristic: "DEFAULT",
  },
  allocationType: "THREE_X_WEEK",
  startDate: new Date("2026-04-25T08:00:00.000Z"),
  endDate: new Date("2026-05-02T08:00:00.000Z"),
  totalPrice: "220.00",
  selectedHours: null,
  selectedWeekDay: ["MONDAY", "WEDNESDAY", "FRIDAY"],
  ...overrides,
});

const makeRentalListItem = (overrides = {}) => ({
  id: "active-rental",
  room: {
    id: "room-1",
    title: "Sala 101",
    floor: "FIRST_FLOOR",
    area: "42.5",
    characteristic: "AIR_CONDITIONER",
    prices: {
      pricePerHour: "80.00",
      price3xWeek: "220.00",
      pricePerMonth: "700.00",
    },
  },
  allocationType: "THREE_X_WEEK",
  startDate: new Date("2026-04-25T10:00:00.000Z"),
  endDate: new Date("2026-04-25T14:00:00.000Z"),
  totalPrice: "220.00",
  selectedHours: null,
  selectedWeekDay: ["MONDAY", "WEDNESDAY", "FRIDAY"],
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("room service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getRoomsList ────────────────────────────────────────────────────────────

  describe("getRoomsList", () => {
    it("maps room list response to the client contract", async () => {
      vi.mocked(prisma.room.findMany).mockResolvedValueOnce([makeRoomListItem()] as never);

      const rooms = await getRoomsList();

      expect(rooms).toEqual([
        {
          id: "room-1",
          displayImage: "image.png",
          isAvailable: true,
          title: "Sala 101",
          complementaryData: {
            area: 42.5,
            additional: "Climatizado e Isonorizado",
            floor: "Térreo",
          },
          prices: {
            perHour: 80,
            _3xWeek: 220,
            month: 700,
          },
        },
      ]);
    });

    it("preserves the order of multiple rooms and maps each one", async () => {
      vi.mocked(prisma.room.findMany).mockResolvedValueOnce([
        makeRoomListItem({
          title: "Sala 101",
          displayImage: "one.png",
          floor: "GROUND_FLOOR",
          area: "40.0",
          characteristic: "DEFAULT",
          isAvailable: true,
          prices: {
            pricePerHour: "50.00",
            price3xWeek: "120.00",
            pricePerMonth: "300.00",
          },
        }),
        makeRoomListItem({
          id: "room-2",
          title: "Sala 202",
          displayImage: "two.png",
          floor: "THIRD_FLOOR",
          area: "55.5",
          characteristic: "SOUNDPROOFED",
          isAvailable: false,
          prices: {
            pricePerHour: "75.00",
            price3xWeek: "180.00",
            pricePerMonth: "450.00",
          },
        }),
      ] as never);

      const rooms = await getRoomsList();

      expect(rooms).toHaveLength(2);
      expect(rooms[0]).toEqual(
        expect.objectContaining({
          id: "room-1",
          title: "Sala 101",
          isAvailable: true,
          complementaryData: expect.objectContaining({
            floor: "Térreo",
            area: 40,
            additional: "Padrão",
          }),
        })
      );
      expect(rooms[1]).toEqual(
        expect.objectContaining({
          id: "room-2",
          title: "Sala 202",
          isAvailable: false,
          complementaryData: expect.objectContaining({
            floor: "3º Andar",
            area: 55.5,
            additional: "Isonorizado",
          }),
        })
      );
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.room.findMany).mockRejectedValueOnce(new Error("DB error"));

      await expect(getRoomsList()).rejects.toThrow("DB error");
    });
  });

  // ── createRoomRental ────────────────────────────────────────────────────────

  describe("createRoomRental", () => {
    it("normalizes allocation type and selected weekdays before persisting", async () => {
      vi.mocked(prisma.roomRental.create).mockResolvedValueOnce(makeRentalRecord() as never);

      const rental = await createRoomRental({
        professionalId: "prof-1",
        roomId: "room-1",
        allocationType: "3X_WEEK",
        paymentMethod: "PIX",
        startDate: new Date("2026-04-25T08:00:00.000Z"),
        endDate: new Date("2026-05-02T08:00:00.000Z"),
        totalPrice: 220,
        selectedWeekDays: ["MONDAY", "WEDNESDAY", "FRIDAY", "INVALID_DAY"],
      });

      expect(prisma.roomRental.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            professionalId: "prof-1",
            roomId: "room-1",
            allocationType: "THREE_X_WEEK",
            paymentMethod: "PIX",
            totalPrice: "220",
            selectedWeekDay: ["MONDAY", "WEDNESDAY", "FRIDAY"],
          }),
        })
      );

      expect(rental).toEqual(
        expect.objectContaining({
          id: "rental-1",
          roomTitle: "Sala 101",
          roomFloor: "Térreo",
          roomCharacteristic: "Padrão",
          allocationType: "3X_WEEK",
          totalPrice: 220,
          selectedWeekDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
          selectedHours: null,
          isActive: true,
        })
      );
    });

    it("persists PER_HOUR rentals with selected hours and client allocation type", async () => {
      vi.mocked(prisma.roomRental.create).mockResolvedValueOnce(
        makeRentalRecord({
          id: "rental-hour",
          room: {
            title: "Sala 303",
            floor: "SECOND_FLOOR",
            characteristic: "AIR_CONDITIONER",
          },
          allocationType: "PER_HOUR",
          startDate: new Date("2026-04-25T09:00:00.000Z"),
          endDate: new Date("2026-04-25T10:00:00.000Z"),
          totalPrice: "90.00",
          selectedHours: { startHour: "09:00", endHour: "10:00" },
          selectedWeekDay: [],
        }) as never
      );

      const rental = await createRoomRental({
        professionalId: "prof-1",
        roomId: "room-3",
        allocationType: "PER_HOUR",
        paymentMethod: "BANK_SLIP",
        startDate: new Date("2026-04-25T09:00:00.000Z"),
        endDate: new Date("2026-04-25T10:00:00.000Z"),
        totalPrice: 90,
        selectedHours: { startHour: "09:00", endHour: "10:00" },
      });

      expect(prisma.roomRental.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allocationType: "PER_HOUR",
            paymentMethod: "BANK_SLIP",
            totalPrice: "90",
            selectedWeekDay: [],
            selectedHours: { startHour: "09:00", endHour: "10:00" },
          }),
        })
      );

      expect(rental).toEqual(
        expect.objectContaining({
          id: "rental-hour",
          allocationType: "PER_HOUR",
          selectedHours: { startHour: "09:00", endHour: "10:00" },
          selectedWeekDays: [],
          isActive: false, // 09:00–10:00 já passou (FIXED_NOW = 12:00)
        })
      );
    });

    it("persists MONTH rentals without weekday or hour selections", async () => {
      vi.mocked(prisma.roomRental.create).mockResolvedValueOnce(
        makeRentalRecord({
          id: "rental-month",
          room: {
            title: "Sala 404",
            floor: "FOURTH_FLOOR",
            characteristic: "DEFAULT",
          },
          allocationType: "MONTH",
          startDate: new Date("2026-04-25T12:00:00.000Z"),
          endDate: new Date("2026-05-25T12:00:00.000Z"),
          totalPrice: "800.00",
          selectedHours: null,
          selectedWeekDay: [],
        }) as never
      );

      const rental = await createRoomRental({
        professionalId: "prof-1",
        roomId: "room-4",
        allocationType: "MONTH",
        paymentMethod: "PIX", // [fix] campo ausente na versão anterior — inconsistente com os demais testes
        startDate: new Date("2026-04-25T12:00:00.000Z"),
        endDate: new Date("2026-05-25T12:00:00.000Z"),
        totalPrice: 800,
      });

      expect(prisma.roomRental.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allocationType: "MONTH",
            totalPrice: "800",
            selectedWeekDay: [],
          }),
        })
      );

      expect(rental).toEqual(
        expect.objectContaining({
          id: "rental-month",
          allocationType: "MONTH",
          selectedHours: null,
          selectedWeekDays: [],
          isActive: true,
        })
      );
    });
  });

  // ── getUserRentals ──────────────────────────────────────────────────────────

  describe("getUserRentals", () => {
    it("returns an empty array when there are no rentals", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals).toEqual([]);
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.roomRental.findMany).mockRejectedValueOnce(new Error("DB error"));

      await expect(getUserRentals("prof-1")).rejects.toThrow("DB error");
    });

    it("marks rentals as active when now is between startDate and endDate", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([makeRentalListItem()] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals).toEqual([
        expect.objectContaining({
          id: "active-rental",
          roomTitle: "Sala 101",
          roomFloor: "1º Andar",
          roomCharacteristic: "Climatizado",
          allocationType: "3X_WEEK",
          totalPrice: 220,
          selectedWeekDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
          isActive: true,
        }),
      ]);
    });

    it("marks rentals as active when startDate equals now", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([
        makeRentalListItem({
          id: "start-boundary",
          room: {
            id: "room-3",
            title: "Sala 303",
            floor: "SECOND_FLOOR",
            area: "33.0",
            characteristic: "DEFAULT",
            prices: {
              pricePerHour: "60.00",
              price3xWeek: "150.00",
              pricePerMonth: "500.00",
            },
          },
          allocationType: "MONTH",
          startDate: FIXED_NOW,
          endDate: new Date("2026-04-26T12:00:00.000Z"),
          totalPrice: "500.00",
          selectedHours: null,
          selectedWeekDay: [],
        }),
      ] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals[0]).toEqual(
        expect.objectContaining({
          id: "start-boundary",
          isActive: true,
        })
      );
    });

    it("marks rentals as active when endDate equals now", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([
        makeRentalListItem({
          id: "end-boundary",
          room: {
            id: "room-4",
            title: "Sala 404",
            floor: "FOURTH_FLOOR",
            area: "44.0",
            characteristic: "DEFAULT",
            prices: {
              pricePerHour: "70.00",
              price3xWeek: "170.00",
              pricePerMonth: "600.00",
            },
          },
          allocationType: "PER_HOUR",
          startDate: new Date("2026-04-25T11:00:00.000Z"),
          endDate: FIXED_NOW,
          totalPrice: "70.00",
          selectedHours: { startHour: "11:00", endHour: "12:00" },
          selectedWeekDay: [],
        }),
      ] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals[0]).toEqual(
        expect.objectContaining({
          id: "end-boundary",
          isActive: true,
        })
      );
    });

    it("marks rentals as inactive when now is outside the interval", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([
        makeRentalListItem({
          id: "past-rental",
          room: {
            id: "room-2",
            title: "Sala 202",
            floor: "SECOND_FLOOR",
            area: "31.0",
            characteristic: "DEFAULT",
            prices: {
              pricePerHour: "70.00",
              price3xWeek: "180.00",
              pricePerMonth: "600.00",
            },
          },
          allocationType: "PER_HOUR",
          startDate: new Date("2026-04-24T10:00:00.000Z"),
          endDate: new Date("2026-04-24T11:00:00.000Z"),
          totalPrice: "70.00",
          selectedHours: { startHour: "10:00", endHour: "11:00" },
          selectedWeekDay: [],
        }),
      ] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals[0]).toEqual(
        expect.objectContaining({
          id: "past-rental",
          allocationType: "PER_HOUR",
          totalPrice: 70,
          selectedHours: { startHour: "10:00", endHour: "11:00" },
          selectedWeekDays: [],
          isActive: false,
        })
      );
    });

    it("marks rentals as inactive when startDate is in the future", async () => {
      vi.mocked(prisma.roomRental.findMany).mockResolvedValueOnce([
        makeRentalListItem({
          id: "future-rental",
          room: {
            id: "room-5",
            title: "Sala 505",
            floor: "GROUND_FLOOR",
            area: "38.0",
            characteristic: "DEFAULT",
            prices: {
              pricePerHour: "60.00",
              price3xWeek: "140.00",
              pricePerMonth: "480.00",
            },
          },
          allocationType: "MONTH",
          startDate: new Date("2026-04-26T12:00:00.000Z"), // amanhã
          endDate: new Date("2026-05-26T12:00:00.000Z"),
          totalPrice: "480.00",
          selectedHours: null,
          selectedWeekDay: [],
        }),
      ] as never);

      const rentals = await getUserRentals("prof-1");

      expect(rentals[0]).toEqual(
        expect.objectContaining({
          id: "future-rental",
          isActive: false,
        })
      );
    });
  });
});