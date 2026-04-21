import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app";

describe("app", () => {
  it("returns healthcheck ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns standardized 404 errors", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      code: "not_found",
      message: "Rota não encontrada!",
    });
  });
});
