import { describe, expect, it } from "vitest";

import { normalizeSpecialty } from '../src/utils/normalizeSpecialty.util';

describe("normalizeSpecialty", () => {
  it("keeps portuguese specialties as-is", () => {
    expect(normalizeSpecialty("Psicologia")).toBe("Psicologia");
  });

  it("converts known english specialty values to portuguese", () => {
    expect(normalizeSpecialty("psychology")).toBe("Psicologia");
    expect(normalizeSpecialty("dermatology")).toBe("Dermatologia");
  });
});
