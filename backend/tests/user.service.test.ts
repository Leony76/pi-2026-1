import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      count: vi.fn(),
    },
    patient: {
      count: vi.fn(),
    },
    roomRental: {
      aggregate: vi.fn(),
    },
    paymentHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import prisma from "../src/lib/prisma";
import { UserService } from "../src/modules/user/service";

const makeDbUser = (overrides = {}) => ({
  id: "prof-1",
  displayImage: "https://img.test/pic.png",
  name: "Ana Silva",
  specialty: "psychology",
  accountType: "PROFESSIONAL",
  crmCrp: "12345-SP",
  email: "ana@test.com",
  phone: "(11) 99999-9999",
  passwordHash: "hashed-password",
  createdAt: new Date("2026-04-10T10:00:00.000Z"),
  updatedAt: new Date("2026-04-11T10:00:00.000Z"),
  ...overrides,
});

describe("user service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Profile ───────────────────────────────────────────────────────────────

  describe("getProfileById", () => {
    it("returns null when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

      const profile = await UserService.getProfileById("missing-user");

      expect(profile).toBeNull();
      expect(prisma.session.count).not.toHaveBeenCalled();
      expect(prisma.patient.count).not.toHaveBeenCalled();
      expect(prisma.roomRental.aggregate).not.toHaveBeenCalled();
    });

    it("maps user and stats to profile contract", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(makeDbUser() as never);
      vi.mocked(prisma.session.count).mockResolvedValueOnce(7 as never);
      vi.mocked(prisma.patient.count).mockResolvedValueOnce(11 as never);
      vi.mocked(prisma.roomRental.aggregate).mockResolvedValueOnce(
        {
          _sum: {
            totalPrice: "320.50",
          },
        } as never
      );

      const profile = await UserService.getProfileById("prof-1");

      expect(profile).toEqual(
        expect.objectContaining({
          id: "prof-1",
          name: "Ana Silva",
          specialty: "psychology",
          specialtyLabel: "Psicologia",
          accountType: "PROFESSIONAL",
          crmCrp: "12345-SP",
          email: "ana@test.com",
          phone: "(11) 99999-9999",
          stats: {
            sessions: 7,
            patients: 11,
            totalSpent: 320.5,
          },
        })
      );
    });
  });

  describe("updateProfileImageById", () => {
    it("updates display image and returns rebuilt profile", async () => {
      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(
        makeDbUser({ displayImage: null }) as never
      );
      vi.mocked(prisma.session.count).mockResolvedValueOnce(0 as never);
      vi.mocked(prisma.patient.count).mockResolvedValueOnce(0 as never);
      vi.mocked(prisma.roomRental.aggregate).mockResolvedValueOnce(
        { _sum: { totalPrice: null } } as never
      );

      const profile = await UserService.updateProfileImageById("prof-1", null);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "prof-1" },
        data: { displayImage: null },
      });
      expect(profile?.displayImage).toBeNull();
    });
  });

  // ── Payments ──────────────────────────────────────────────────────────────

  describe("storePaymentHistory", () => {
    it("persists payment history entry", async () => {
      vi.mocked(prisma.paymentHistory.create).mockResolvedValueOnce(
        { id: "payment-1" } as never
      );

      await UserService.storePaymentHistory({
        from: "ROOM_RENTAL",
        paymentMethod: "PIX",
        professionalId: "prof-1",
        paid: 220,
      });

      expect(prisma.paymentHistory.create).toHaveBeenCalledWith({
        data: {
          from: "ROOM_RENTAL",
          paymentMethod: "PIX",
          professionalId: "prof-1",
          paid: 220,
        },
      });
    });
  });

  describe("getProfessionalPaymentsHistory", () => {
    it("queries payment history by professional id omitting updatedAt", async () => {
      vi.mocked(prisma.paymentHistory.findMany).mockResolvedValueOnce([] as never);

      const history = await UserService.getProfessionalPaymentsHistory("prof-1");

      expect(history).toEqual([]);
      expect(prisma.paymentHistory.findMany).toHaveBeenCalledWith({
        where: { professionalId: "prof-1" },
        omit: {
          updatedAt: true,
        },
      });
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe("verifyCurrentPasswordMatchById", () => {
    it("throws unauthorized when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

      await expect(
        UserService.verifyCurrentPasswordMatchById("missing-user", "12345678")
      ).rejects.toMatchObject({
        statusCode: 401,
        code: "unauthorized",
        message: "Usuário não existe!",
      });
    });

    it("returns false when password does not match", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(makeDbUser() as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      const isValid = await UserService.verifyCurrentPasswordMatchById("prof-1", "wrong-password");

      expect(isValid).toBe(false);
    });

    it("returns true when password matches", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(makeDbUser() as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const isValid = await UserService.verifyCurrentPasswordMatchById("prof-1", "correct-password");

      expect(isValid).toBe(true);
    });
  });

  describe("changeProfessionalPasswordById", () => {
    it("throws unauthorized when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

      await expect(
        UserService.changeProfessionalPasswordById("missing-user", "new-pass")
      ).rejects.toMatchObject({
        statusCode: 401,
        code: "unauthorized",
      });
    });

    it("hashes and updates password", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(makeDbUser() as never);
      vi.mocked(bcrypt.hash).mockResolvedValueOnce("new-hash" as never);
      vi.mocked(prisma.user.update).mockResolvedValueOnce(
        makeDbUser({ passwordHash: "new-hash" }) as never
      );

      await UserService.changeProfessionalPasswordById("prof-1", "new-pass");

      expect(bcrypt.hash).toHaveBeenCalledWith("new-pass", 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "prof-1" },
        data: {
          passwordHash: "new-hash",
        },
      });
    });
  });

  // ── Profile validation ────────────────────────────────────────────────────

  describe("updateProfileById", () => {
    it("validates name minimum length", async () => {
      await expect(
        UserService.updateProfileById("prof-1", {
          name: "An",
          specialty: "Psicologia",
          crmCrp: "12345-SP",
          email: "ana@test.com",
          phone: "(11) 99999-9999",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "Nome invalido.",
      });
    });

    it("validates empty specialty", async () => {
      await expect(
        UserService.updateProfileById("prof-1", {
          name: "Ana Silva",
          specialty: " ",
          crmCrp: "12345-SP",
          email: "ana@test.com",
          phone: "(11) 99999-9999",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "Especialidade invalida.",
      });
    });

    it("validates crm format", async () => {
      await expect(
        UserService.updateProfileById("prof-1", {
          name: "Ana Silva",
          specialty: "Psicologia",
          crmCrp: "1234-SP",
          email: "ana@test.com",
          phone: "(11) 99999-9999",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "Formato de CRM/CRP invalido.",
      });
    });

    it("validates empty email", async () => {
      await expect(
        UserService.updateProfileById("prof-1", {
          name: "Ana Silva",
          specialty: "Psicologia",
          crmCrp: "12345-SP",
          email: " ",
          phone: "(11) 99999-9999",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "E-mail invalido.",
      });
    });

    it("validates phone format when non-empty", async () => {
      await expect(
        UserService.updateProfileById("prof-1", {
          name: "Ana Silva",
          specialty: "Psicologia",
          crmCrp: "12345-SP",
          email: "ana@test.com",
          phone: "11999999999",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "Formato de telefone invalido.",
      });
    });

    it("normalizes and persists profile without profileImage when undefined", async () => {
      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(
        makeDbUser({
          name: "Ana Clara",
          specialty: "Psicologia",
          crmCrp: "12345-SP",
          email: "ana@new.com",
          phone: "(11) 98888-7777",
        }) as never
      );
      vi.mocked(prisma.session.count).mockResolvedValueOnce(2 as never);
      vi.mocked(prisma.patient.count).mockResolvedValueOnce(5 as never);
      vi.mocked(prisma.roomRental.aggregate).mockResolvedValueOnce(
        { _sum: { totalPrice: "90.00" } } as never
      );

      const profile = await UserService.updateProfileById("prof-1", {
        name: "  Ana Clara  ",
        specialty: "  Psicologia  ",
        crmCrp: " 12345-sp ",
        email: " ANA@NEW.COM ",
        phone: " (11) 98888-7777 ",
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "prof-1" },
        data: {
          name: "Ana Clara",
          specialty: "Psicologia",
          crmCrp: "12345-SP",
          email: "ana@new.com",
          phone: "(11) 98888-7777",
        },
      });
      expect(profile?.stats.totalSpent).toBe(90);
    });

    it("persists profileImage when explicitly provided", async () => {
      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(
        makeDbUser({ displayImage: null }) as never
      );
      vi.mocked(prisma.session.count).mockResolvedValueOnce(0 as never);
      vi.mocked(prisma.patient.count).mockResolvedValueOnce(0 as never);
      vi.mocked(prisma.roomRental.aggregate).mockResolvedValueOnce(
        { _sum: { totalPrice: null } } as never
      );

      await UserService.updateProfileById("prof-1", {
        name: "Ana Silva",
        specialty: "Psicologia",
        crmCrp: "12345-SP",
        email: "ana@test.com",
        phone: "(11) 99999-9999",
        profileImage: null,
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            displayImage: null,
          }),
        })
      );
    });
  });
});
