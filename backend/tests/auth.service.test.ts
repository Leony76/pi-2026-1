import bcrypt from "bcrypt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => {
  const user = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  return {
    default: { user },
  };
});

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

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import prisma from "../src/lib/prisma";
import { register, login, refreshSession, requestPasswordReset, resetPassword } from "../src/modules/auth/service";

describe("auth service", () => {
  const previousJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.JWT_SECRET = previousJwtSecret;
  });

  it("registers users with Portuguese specialty and returns auth tokens", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-1",
      name: "Ana",
      specialty: "Psicologia",
      crmCrp: "CRM12345",
      email: "ana@teste.com",
      emailVerifiedAt: null,
      createdAt: new Date("2026-04-08T00:00:00.000Z"),
    } as never);

    const response = await register({
      name: "Ana",
      specialty: "psychology",
      crmCrp: "crm12345",
      email: "ana@teste.com",
      password: "12345678",
      repeatPassword: "12345678",
    });

    expect(response.user.specialty).toBe("Psicologia");
    expect(response.token).toBe("access-token");
    expect(response.refreshToken).toBe("opaque-token");
    expect(response.emailVerificationToken).toBe("opaque-token");
  });

  it("logs in and issues a new refresh token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Ana",
      specialty: "Psicologia",
      crmCrp: "CRM12345",
      email: "ana@teste.com",
      passwordHash: "hashed-password",
      emailVerifiedAt: new Date(),
      createdAt: new Date("2026-04-08T00:00:00.000Z"),
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const response = await login({
      email: "ana@teste.com",
      password: "12345678",
    });

    expect(response.token).toBe("access-token");
    expect(response.refreshToken).toBe("opaque-token");
  });

  it("refreshes the session using the refresh token", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "user-1",
      name: "Ana",
      specialty: "Psicologia",
      crmCrp: "CRM12345",
      email: "ana@teste.com",
      passwordHash: "hashed-password",
      emailVerifiedAt: new Date(),
      refreshTokenHash: "hash:opaque-token",
      refreshTokenExpiresAt: new Date("2026-04-09T00:00:00.000Z"),
      createdAt: new Date("2026-04-08T00:00:00.000Z"),
      updatedAt: new Date("2026-04-08T00:00:00.000Z"),
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const response = await refreshSession({ refreshToken: "opaque-token" });

    expect(response.token).toBe("access-token");
    expect(response.refreshToken).toBe("opaque-token");
  });

  it("generates a password reset token and updates the user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Ana",
      specialty: "Psicologia",
      crmCrp: "CRM12345",
      email: "ana@teste.com",
      passwordHash: "hashed-password",
      emailVerifiedAt: new Date(),
      createdAt: new Date("2026-04-08T00:00:00.000Z"),
      updatedAt: new Date("2026-04-08T00:00:00.000Z"),
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const resetRequest = await requestPasswordReset({ email: "ana@teste.com" });
    expect(resetRequest.resetToken).toBe("opaque-token");

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "user-1",
      name: "Ana",
      specialty: "Psicologia",
      crmCrp: "CRM12345",
      email: "ana@teste.com",
      passwordHash: "hashed-password",
      emailVerifiedAt: new Date(),
      passwordResetTokenHash: "hash:opaque-token",
      passwordResetTokenExpiresAt: new Date("2026-04-08T01:00:00.000Z"),
      createdAt: new Date("2026-04-08T00:00:00.000Z"),
      updatedAt: new Date("2026-04-08T00:00:00.000Z"),
    } as never);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);

    const resetResponse = await resetPassword({
      token: "opaque-token",
      password: "87654321",
      repeatPassword: "87654321",
    });

    expect(resetResponse.message).toBe("Password updated");
  });
});
