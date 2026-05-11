import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpError } from "../src/lib/http-error";

vi.mock("../src/modules/auth/service", () => ({
  register: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
  requestEmailVerification: vi.fn(),
  verifyEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
  verifyResetCode: vi.fn(),
  resetPassword: vi.fn(),
}));

import { app } from "../src/app";
import {
  login,
  logout,
  refreshSession,
  register,
  requestEmailVerification,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  verifyResetCode,
} from "../src/modules/auth/service";

describe("auth controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Success responses ────────────────────────────────────────────────────

  it("POST /auth/register returns 201", async () => {
    vi.mocked(register).mockResolvedValueOnce({ token: "a", refreshToken: "b" } as never);

    const response = await request(app).post("/auth/register").send({ email: "ana@test.com" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ token: "a", refreshToken: "b" });
  });

  it("POST /auth/login returns 200", async () => {
    vi.mocked(login).mockResolvedValueOnce({ token: "a", refreshToken: "b" } as never);

    const response = await request(app).post("/auth/login").send({ email: "ana@test.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: "a", refreshToken: "b" });
  });

  it("POST /auth/refresh returns 200", async () => {
    vi.mocked(refreshSession).mockResolvedValueOnce({ token: "new", refreshToken: "new-r" } as never);

    const response = await request(app).post("/auth/refresh").send({ refreshToken: "r" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: "new", refreshToken: "new-r" });
  });

  it("POST /auth/logout returns 200", async () => {
    vi.mocked(logout).mockResolvedValueOnce({ message: "ok" } as never);

    const response = await request(app).post("/auth/logout").send({ refreshToken: "r" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "ok" });
  });

  it("POST /auth/request-email-verification returns 200", async () => {
    vi.mocked(requestEmailVerification).mockResolvedValueOnce(
      { message: "sent", verificationToken: "v" } as never
    );

    const response = await request(app)
      .post("/auth/request-email-verification")
      .send({ email: "ana@test.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "sent", verificationToken: "v" });
  });

  it("POST /auth/verify-email returns 200", async () => {
    vi.mocked(verifyEmail).mockResolvedValueOnce({ message: "verified" } as never);

    const response = await request(app).post("/auth/verify-email").send({ token: "v" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "verified" });
  });

  it("POST /auth/request-password-reset returns 200", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValueOnce({ message: "sent" } as never);

    const response = await request(app)
      .post("/auth/request-password-reset")
      .send({ email: "ana@test.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "sent" });
  });

  it("POST /auth/verify-reset-code returns 200", async () => {
    vi.mocked(verifyResetCode).mockResolvedValueOnce(
      { message: "ok", sessionToken: "session" } as never
    );

    const response = await request(app)
      .post("/auth/verify-reset-code")
      .send({ email: "ana@test.com", code: "123456" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "ok", sessionToken: "session" });
  });

  it("POST /auth/reset-password returns 200", async () => {
    vi.mocked(resetPassword).mockResolvedValueOnce({ message: "done" } as never);

    const response = await request(app)
      .post("/auth/reset-password")
      .send({ sessionToken: "session", password: "12345678", repeatPassword: "12345678" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "done" });
  });

  // ── Error handling ───────────────────────────────────────────────────────

  it("returns standardized error when service throws HttpError", async () => {
    vi.mocked(login).mockRejectedValueOnce(
      createHttpError(401, "unauthorized", "invalid credentials")
    );

    const response = await request(app).post("/auth/login").send({ email: "ana@test.com" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      code: "unauthorized",
      message: "invalid credentials",
    });
  });
});
