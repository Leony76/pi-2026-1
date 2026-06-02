import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../src/modules/room/service", () => ({
  RoomService: {
    getRoomsList: vi.fn(),
    createRoom: vi.fn(),
    getEnterpriseDashboard: vi.fn(),
    getRoomOccupancy: vi.fn(),
    createRoomRental: vi.fn(),
    getUserRentals: vi.fn(),
    getEnterpriseValues: vi.fn(),
  },
}));

import jwt from "jsonwebtoken";
import prisma from "../src/lib/prisma";
import { app } from "../src/app";
import { RoomService } from "../src/modules/room/service";
import { createHttpError } from "../src/lib/http-error";

describe("room controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    vi.mocked(jwt.verify).mockReturnValue({
      sub: "prof-1",
      email: "ana@test.com",
      iat: 1,
      exp: 2,
    } as never);
  });

  // ── Public endpoints ─────────────────────────────────────────────────────

  it("GET /rooms returns 200", async () => {
    vi.mocked(RoomService.getRoomsList).mockResolvedValueOnce([{ id: "room-1" }] as never);

    const response = await request(app).get("/rooms");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: "room-1" }]);
  });

  it("POST /rooms creates a room for enterprise user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ accountType: "ENTERPRISE" } as never);
    vi.mocked(RoomService.createRoom).mockResolvedValueOnce({ id: "room-2" } as never);

    const payload = {
      roomName: "Sala 202",
      roomImage: "https://img.test/room.png",
      floor: "firstFloor",
      area: 40,
      characteristics: ["default"],
      pricePerHour: 100,
      priceWeek: 220,
      pricePerMonth: 700,
      items: ["Cadeira"],
    };

    const response = await request(app)
      .post("/rooms")
      .set("Authorization", "Bearer valid-token")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "room-2" });
    expect(RoomService.createRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "prof-1",
      }),
      expect.objectContaining({
        enterpriseOwnerId: "prof-1",
        roomName: "Sala 202",
      })
    );
  });

  // ── Enterprise endpoints ────────────────────────────────────────────────

  it("POST /rooms returns 403 when service rejects", async () => {
    vi.mocked(RoomService.createRoom).mockRejectedValueOnce(
      createHttpError(
        403,
        "forbidden",
        "Apenas contas enterprise podem criar salas."
      )
    );

    const response = await request(app)
      .post("/rooms")
      .set("Authorization", "Bearer valid-token")
      .send({ roomName: "Sala" });

    expect(response.status).toBe(403);
  });

  it("GET /rooms/dashboard returns 200", async () => {
    vi.mocked(RoomService.getEnterpriseDashboard).mockResolvedValueOnce(
      {
        stats: {
          totalRooms: 1,
          availableRooms: 1,
          occupiedRooms: 0,
          entriesToday: 0,
          exitsToday: 0,
        },
        roomOccupation: [],
        activeCustomers: [],
        historyCustomers: [],
        entryExitToday: null,
      } as never
    );

    const response = await request(app)
      .get("/rooms/dashboard")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.stats.totalRooms).toBe(1);
  });

  it("GET /rooms/values returns 200", async () => {
    vi.mocked(RoomService.getEnterpriseValues).mockResolvedValueOnce(
      {
        summary: { revenueThisMonth: 10, expensesThisMonth: 2, netIncome: 8 },
        roomRevenue: { totalRevenue: 10, roomsRevenue: [] },
        expenses: { maintenance: 1, eletricalEnergy: 1, cleaning: 0, totalValue: 2 },
        roomPrices: [],
      } as never
    );

    const response = await request(app)
      .get("/rooms/values")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.summary.netIncome).toBe(8);
  });

  // ── Rental endpoints ─────────────────────────────────────────────────────

  it("GET /rooms/:roomId/occupancy returns 200", async () => {
    vi.mocked(RoomService.getRoomOccupancy).mockResolvedValueOnce(
      {
        occupiedHours: [{ startHour: "08:00", endHour: "09:00" }],
        occupiedDays: ["2026-04-25"],
      } as never
    );

    const response = await request(app)
      .get("/rooms/room-1/occupancy")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.occupiedDays).toEqual(["2026-04-25"]);
  });

  it("POST /rooms/rentals returns 201", async () => {
    vi.mocked(RoomService.createRoomRental).mockResolvedValueOnce({ id: "rental-1" } as never);

    const response = await request(app)
      .post("/rooms/rentals")
      .set("Authorization", "Bearer valid-token")
      .send({ roomId: "room-1", allocationType: "WEEK" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "rental-1" });
    expect(RoomService.createRoomRental).toHaveBeenCalledWith(
      expect.objectContaining({
        professionalId: "prof-1",
        roomId: "room-1",
      })
    );
  });

  it("GET /rooms/rentals/me returns 200", async () => {
    vi.mocked(RoomService.getUserRentals).mockResolvedValueOnce([{ id: "rental-1" }] as never);

    const response = await request(app)
      .get("/rooms/rentals/me")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: "rental-1" }]);
  });

  // ── Authorization and config errors ─────────────────────────────────────

  it("returns 401 when authorization header is missing", async () => {
    const response = await request(app).get("/rooms/rentals/me");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      code: "unauthorized",
    });
  });

  it("returns 401 when authorization header scheme is invalid", async () => {
    const response = await request(app)
      .get("/rooms/rentals/me")
      .set("Authorization", "Token invalid");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      code: "unauthorized",
    });
  });

  it("returns 500 when JWT secret is not configured", async () => {
    delete process.env.JWT_SECRET;

    const response = await request(app)
      .get("/rooms/values")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      success: false,
      code: "internal_server_error",
    });
  });
});
