import { PatientStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { toNumber } from "../../../utils/toNumber.util";

type Session = {
  startsAt: Date;
  endsAt: Date;
  price: Decimal;
  room: {
      title: string;
  };
}

type MapperRequest = {
  id: string;
  name: string;
  phone: string;
  status: PatientStatus;
  createdAt: Date;
  completedSessions: Session[];
  upcomingSessions: Session[];
  lastSession: Session | undefined
  totalGenerated: number;
}

export const getPatientMapper = (
  patient: MapperRequest,
) => {
  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    status: patient.status,
    createdAt: patient.createdAt.toISOString(),
    sessionHistory: {
      totalMade: patient.completedSessions.length,
      session:
        patient.completedSessions.length === 0
          ? null
          : {
              lastOneDate: (patient.lastSession!.startsAt).toISOString(),
              valueByEach: patient.lastSession ? toNumber(patient.lastSession.price) : 0,
              totalGenerated: patient.totalGenerated,
            },
    },
    sessions: patient.upcomingSessions.map((session) => ({
      date: session.startsAt.toISOString(),
      room: session.room.title,
      hour: {
        start: session.startsAt.toISOString(),
        end: session.endsAt.toISOString(),
      },
    })),
  };
}