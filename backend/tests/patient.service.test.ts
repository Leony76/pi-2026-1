import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../src/lib/prisma", () => ({
  default: {
    patient: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// ─── Imports ────────────────────────────────────────────────────────────────

import prisma from "../src/lib/prisma";
import {
  createPatient,
  getActivePatients,
  getPatientById,
  getPatientHistory,
} from "../src/modules/patient/service";

const FIXED_NOW = new Date("2026-04-25T12:00:00.000Z");

// ─── Factories ───────────────────────────────────────────────────────────────

const makeSession = (overrides = {}) => ({
  startsAt: new Date("2026-04-26T12:00:00.000Z"),
  endsAt: new Date("2026-04-26T13:00:00.000Z"),
  price: "120.00",
  room: {
    title: "Sala 101",
  },
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  id: "patient-1",
  professionalId: "prof-1",
  name: "Ana Souza",
  phone: "(11) 99999-9999",
  email: "ana@teste.com",
  observations: "Observações",
  status: "ACTIVE",
  nextSessionAt: new Date("2026-04-26T09:00:00.000Z"),
  initialDate: new Date("2026-04-20T09:00:00.000Z"),
  createdAt: new Date("2026-04-20T09:00:00.000Z"),
  updatedAt: new Date("2026-04-24T09:00:00.000Z"),
  sessions: [makeSession()],
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("patient service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getActivePatients ──────────────────────────────────────────────────────

  describe("getActivePatients", () => {
    it("maps active patients to the client contract", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([
        makePatient({
          id: "patient-1",
          name: "Ana Souza",
          status: "ACTIVE",
          nextSessionAt: new Date("2026-04-28T10:00:00.000Z"),
          sessions: [],
        }),
        makePatient({
          id: "patient-2",
          name: "Bruno Lima",
          status: "ACTIVE",
          nextSessionAt: null,
          sessions: [
            makeSession({
              startsAt: new Date("2026-04-27T09:00:00.000Z"),
              endsAt: new Date("2026-04-27T10:00:00.000Z"),
              price: "90.00",
              room: { title: "Sala 202" },
            }),
          ],
        }),
      ] as never);

      const patients = await getActivePatients("prof-1");

      expect(patients).toEqual([
        {
          id: "patient-1",
          name: "Ana Souza",
          status: "ACTIVE",
          nextSession: "2026-04-28T10:00:00.000Z",
        },
        {
          id: "patient-2",
          name: "Bruno Lima",
          status: "ACTIVE",
          nextSession: "2026-04-27T09:00:00.000Z",
        },
      ]);
    });

    it("returns null nextSession when patient has no nextSessionAt and no sessions", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([
        makePatient({
          id: "patient-3",
          name: "Carla Mendes",
          status: "ACTIVE",
          nextSessionAt: null,
          sessions: [],
        }),
      ] as never);

      const patients = await getActivePatients("prof-1");

      expect(patients[0]).toEqual(
        expect.objectContaining({
          id: "patient-3",
          nextSession: null,
        })
      );
    });

    it("returns an empty array when there are no active patients", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([] as never);

      const patients = await getActivePatients("prof-1");

      expect(patients).toEqual([]);
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.patient.findMany).mockRejectedValueOnce(new Error("DB error"));

      await expect(getActivePatients("prof-1")).rejects.toThrow("DB error");
    });
  });

  // ── getPatientHistory ──────────────────────────────────────────────────────

  describe("getPatientHistory", () => {
    it("maps closed patients to the history contract", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([
        makePatient({
          id: "patient-4",
          name: "Daniel Rocha",
          status: "CLOSED",
          updatedAt: new Date("2026-04-24T18:00:00.000Z"),
          sessions: [
            makeSession({
              startsAt: new Date("2026-04-24T09:00:00.000Z"),
              endsAt: new Date("2026-04-24T10:00:00.000Z"),
              price: "80.00",
              room: { title: "Sala 303" },
            }),
          ],
        }),
      ] as never);

      const history = await getPatientHistory("prof-1");

      expect(history).toEqual([
        {
          id: "patient-4",
          patientName: "Daniel Rocha",
          lastSession: "2026-04-24T09:00:00.000Z",
          status: "CLOSED",
        },
      ]);
    });

    it("uses updatedAt as lastSession when patient has no sessions", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([
        makePatient({
          id: "patient-5",
          name: "Eva Martins",
          status: "CLOSED",
          updatedAt: new Date("2026-04-23T18:00:00.000Z"),
          sessions: [],
        }),
      ] as never);

      const history = await getPatientHistory("prof-1");

      expect(history[0]).toEqual(
        expect.objectContaining({
          id: "patient-5",
          lastSession: "2026-04-23T18:00:00.000Z",
        })
      );
    });

    it("returns an empty array when there are no closed patients", async () => {
      vi.mocked(prisma.patient.findMany).mockResolvedValueOnce([] as never);

      const history = await getPatientHistory("prof-1");

      expect(history).toEqual([]);
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.patient.findMany).mockRejectedValueOnce(new Error("DB error"));

      await expect(getPatientHistory("prof-1")).rejects.toThrow("DB error");
    });
  });

  // ── getPatientById ─────────────────────────────────────────────────────────

  describe("getPatientById", () => {
    it("returns null when the patient does not exist", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValueOnce(null as never);

      const patient = await getPatientById("prof-1", "patient-404");

      expect(patient).toBeNull();
    });

    it("maps patient details, history and upcoming sessions", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValueOnce(
        makePatient({
          id: "patient-6",
          name: "Fernanda Alves",
          phone: "(11) 98888-7777",
          status: "ACTIVE",
          createdAt: new Date("2026-04-20T09:00:00.000Z"),
          sessions: [

            makeSession({
              startsAt: new Date("2026-04-23T09:00:00.000Z"),
              endsAt: new Date("2026-04-23T10:00:00.000Z"),
              price: "100.50",
              room: { title: "Sala 101" },
            }),
            makeSession({
              startsAt: new Date("2026-04-24T09:00:00.000Z"),
              endsAt: new Date("2026-04-24T10:00:00.000Z"),
              price: "80.00",
              room: { title: "Sala 202" },
            }),
            // futura
            makeSession({
              startsAt: new Date("2026-04-26T09:00:00.000Z"),
              endsAt: new Date("2026-04-26T10:00:00.000Z"),
              price: "150.00",
              room: { title: "Sala 303" },
            }),
          ],
        }) as never
      );

      const patient = await getPatientById("prof-1", "patient-6");

      expect(patient).toEqual({
        id: "patient-6",
        name: "Fernanda Alves",
        phone: "(11) 98888-7777",
        status: "ACTIVE",
        createdAt: "2026-04-20T09:00:00.000Z",
        sessionHistory: {
          totalMade: 2,
          session: {
            lastOneDate: "2026-04-24T09:00:00.000Z",
            valueByEach: 80,
            totalGenerated: 180.5,
          },
        },
        sessions: [
          {
            date: "2026-04-26T09:00:00.000Z",
            room: "Sala 303",
            hour: {
              start: "2026-04-26T09:00:00.000Z",
              end: "2026-04-26T10:00:00.000Z",
            },
          },
        ],
      });
    });

    it("returns zeroed session history when patient has no sessions", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValueOnce(
        makePatient({
          id: "patient-7",
          name: "Gustavo Pires",
          status: "ACTIVE",
          createdAt: new Date("2026-04-20T09:00:00.000Z"),
          sessions: [],
        }) as never
      );

      const patient = await getPatientById("prof-1", "patient-7");

      expect(patient).toEqual(
        expect.objectContaining({
          id: "patient-7",
          sessions: [],
          sessionHistory: {
            totalMade: 0,
            session: null,
          },
        })
      );
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.patient.findFirst).mockRejectedValueOnce(new Error("DB error"));

      await expect(getPatientById("prof-1", "patient-1")).rejects.toThrow("DB error");
    });
  });

  // ── createPatient ──────────────────────────────────────────────────────────

  describe("createPatient", () => {
    it("normalizes input before persisting and returns the created patient", async () => {
      vi.mocked(prisma.patient.create).mockResolvedValueOnce(
        makePatient({
          id: "patient-8",
          name: "Ana Souza",
          phone: "(11) 99999-8888",
          email: "ana@teste.com",
          observations: "Primeira consulta",
          status: "ACTIVE",
          initialDate: new Date("2026-04-30T09:00:00.000Z"),
          createdAt: new Date("2026-04-25T09:00:00.000Z"),
          updatedAt: new Date("2026-04-25T09:00:00.000Z"),
          sessions: [],
        }) as never
      );

      const patient = await createPatient("prof-1", {
        name: "  Ana Souza  ",
        phone: "  (11) 99999-8888  ",
        email: "  ana@teste.com  ",
        observations: "  Primeira consulta  ",
        initialDate: "2026-04-30T09:00:00.000Z",
      });

      expect(prisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            professionalId: "prof-1",
            name: "Ana Souza",
            phone: "(11) 99999-8888",
            email: "ana@teste.com",
            observations: "Primeira consulta",
            initialDate: new Date("2026-04-30T09:00:00.000Z"),
            status: "ACTIVE",
          }),
        })
      );

      expect(patient).toEqual(
        expect.objectContaining({
          id: "patient-8",
          name: "Ana Souza",
          phone: "(11) 99999-8888",
          email: "ana@teste.com",
          observations: "Primeira consulta",
          status: "ACTIVE",
          initialDate: "2026-04-30T09:00:00.000Z",
          createdAt: "2026-04-25T09:00:00.000Z",
        })
      );
    });

    it("rejects invalid initial dates", async () => {
      await expect(
        createPatient("prof-1", {
          name: "Ana Souza",
          phone: "(11) 99999-8888",
          initialDate: "invalid-date",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "bad_request",
        message: "Campo initialDate invalido.",
      });
    });

    it("propagates Prisma failures", async () => {
      vi.mocked(prisma.patient.create).mockRejectedValueOnce(new Error("DB error"));

      await expect(
        createPatient("prof-1", {
          name: "Ana Souza",
          phone: "(11) 99999-8888",
          initialDate: "2026-04-30T09:00:00.000Z",
        })
      ).rejects.toThrow("DB error");
    });
  });
});