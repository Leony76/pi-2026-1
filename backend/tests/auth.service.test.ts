import bcrypt from "bcrypt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../src/lib/prisma", () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../src/lib/token", () => ({
  generateAccessToken: vi.fn(() => "access-token"),
  generateOpaqueToken: vi.fn(() => "opaque-token"),
  hashToken: vi.fn((token: string) => `hash:${token}`),
}));

vi.mock("../src/lib/mailer", () => ({
  sendPasswordResetCodeEmail: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

// ─── Imports ────────────────────────────────────────────────────

import prisma from "../src/lib/prisma";
import { generateOpaqueToken } from "../src/lib/token";
import { sendPasswordResetCodeEmail } from "../src/lib/mailer";
import {
  login,
  refreshSession,
  register,
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from "../src/modules/auth/service";

// ─── Factories ───────────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  id: "user-1",
  name: "Ana",
  specialty: "Psicologia",
  crmCrp: "CRM12345",
  email: "ana@teste.com",
  passwordHash: "hashed-password",
  emailVerifiedAt: new Date("2026-04-08T00:00:00.000Z"),
  refreshTokenHash: null,
  refreshTokenExpiresAt: null,
  passwordResetTokenHash: null,
  passwordResetTokenExpiresAt: null,
  passwordResetAttempts: 0,
  passwordResetSessionTokenHash: null,
  passwordResetSessionExpiresAt: null,
  createdAt: new Date("2026-04-08T00:00:00.000Z"),
  updatedAt: new Date("2026-04-08T00:00:00.000Z"),
  ...overrides,
});

const REGISTER_PAYLOAD = {
  name: "Ana",
  specialty: "psychology",
  crmCrp: "crm12345",
  email: "ana@teste.com",
  password: "12345678",
  repeatPassword: "12345678",
};

const LOGIN_PAYLOAD = {
  email: "ana@teste.com",
  password: "12345678",
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("auth service", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe("register", () => {
    it("returns access token, refresh token and email verification token on success", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockResolvedValue(makeUser({ emailVerifiedAt: null }) as never);

      const response = await register(REGISTER_PAYLOAD);

      expect(response.token).toBe("access-token");
      expect(response.refreshToken).toBe("opaque-token");
      expect(response.emailVerificationToken).toBe("opaque-token");
    });

    it("translates English specialty to Portuguese before persisting", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockResolvedValue(makeUser({ emailVerifiedAt: null }) as never);

      await register(REGISTER_PAYLOAD);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            specialty: "Psicologia",
          }),
        })
      );
    });

    it("hashes the password before creating the user", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockResolvedValue(makeUser({ emailVerifiedAt: null }) as never);

      await register(REGISTER_PAYLOAD);

      expect(bcrypt.hash).toHaveBeenCalledWith("12345678", expect.any(Number));
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("returns access token and a new refresh token on valid credentials", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await login(LOGIN_PAYLOAD);

      expect(response.token).toBe("access-token");
      expect(response.refreshToken).toBe("opaque-token");
    });

    it("persists the hashed refresh token after login", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      await login(LOGIN_PAYLOAD);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ refreshTokenHash: "hash:opaque-token" }),
        })
      );
    });
  });

  // ── refreshSession ────────────────────────────────────────────────────────

  describe("refreshSession", () => {
    it("returns a new access token and a rotated refresh token", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({
          refreshTokenHash: "hash:opaque-token",
          refreshTokenExpiresAt: new Date("2026-04-09T00:00:00.000Z"),
        }) as never
      );
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await refreshSession({ refreshToken: "opaque-token" });

      expect(response.token).toBe("access-token");
      expect(response.refreshToken).toBe("opaque-token");
    });

    it("rotates the stored refresh token hash on every refresh", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({
          refreshTokenHash: "hash:opaque-token",
          refreshTokenExpiresAt: new Date("2026-04-09T00:00:00.000Z"),
        }) as never
      );
      vi.mocked(generateOpaqueToken).mockReturnValueOnce("opaque-token-2");
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await refreshSession({ refreshToken: "opaque-token" });

      expect(response.refreshToken).toBe("opaque-token-2");

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ refreshTokenHash: "hash:opaque-token-2" }),
        })
      );
    });
  });

  // ── requestPasswordReset ──────────────────────────────────────────────────

  describe("requestPasswordReset", () => {
    it("returns generic success message and sends a 6-digit code by email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await requestPasswordReset({ email: "ana@teste.com" });

      expect(response.message).toBe("Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.");
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetTokenHash: expect.any(String),
            passwordResetAttempts: 0,
          }),
        })
      );
      expect(sendPasswordResetCodeEmail).toHaveBeenCalledWith("ana@teste.com", expect.stringMatching(/^\d{6}$/));
    });

    it("does not reveal if the email exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

      const response = await requestPasswordReset({ email: "inexistente@teste.com" });

      expect(response).toEqual({
        message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(sendPasswordResetCodeEmail).not.toHaveBeenCalled();
    });
  });

  // ── verifyResetCode ──────────────────────────────────────────────────────

  describe("verifyResetCode", () => {
    it("returns a temporary session token when code is valid", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(
        makeUser({
          passwordResetTokenHash: "hash:123456",
          passwordResetTokenExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
        }) as never
      );
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await verifyResetCode({ email: "ana@teste.com", code: "123456" });

      expect(response).toEqual({
        message: "Código de redefinição validado!",
        sessionToken: "opaque-token",
      });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetTokenHash: null,
            passwordResetSessionTokenHash: "hash:opaque-token",
          }),
        })
      );
    });

    it("increments attempts when code is invalid", async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce(null as never)
        .mockResolvedValueOnce(
          makeUser({
            passwordResetTokenHash: "hash:654321",
            passwordResetTokenExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
            passwordResetAttempts: 1,
          }) as never
        );
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      await expect(verifyResetCode({ email: "ana@teste.com", code: "123456" })).rejects.toMatchObject({
        statusCode: 401,
        code: "unauthorized",
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordResetAttempts: 2 }),
        })
      );
    });

    it("invalidates the code after the third invalid attempt", async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce(null as never)
        .mockResolvedValueOnce(
          makeUser({
            passwordResetTokenHash: "hash:654321",
            passwordResetTokenExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
            passwordResetAttempts: 2,
          }) as never
        );
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      await expect(verifyResetCode({ email: "ana@teste.com", code: "123456" })).rejects.toMatchObject({
        statusCode: 401,
        code: "unauthorized",
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetAttempts: 3,
            passwordResetTokenHash: null,
            passwordResetTokenExpiresAt: null,
          }),
        })
      );
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────

  describe("resetPassword", () => {
    it("updates the password hash and returns a success message", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({
          passwordResetSessionTokenHash: "hash:opaque-token",
          passwordResetSessionExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
        }) as never
      );
      vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      const response = await resetPassword({
        sessionToken: "opaque-token",
        password: "87654321",
        repeatPassword: "87654321",
      });

      expect(response.message).toBe("Senha redefinida!");
    });

    it("hashes the new password before saving", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(
        makeUser({
          passwordResetSessionTokenHash: "hash:opaque-token",
          passwordResetSessionExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
        }) as never
      );
      vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as never);

      await resetPassword({
        sessionToken: "opaque-token",
        password: "87654321",
        repeatPassword: "87654321",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("87654321", expect.any(Number));
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: "new-hash",
            passwordResetSessionTokenHash: null,
            passwordResetSessionExpiresAt: null,
          }),
        })
      );
    });
  });
});