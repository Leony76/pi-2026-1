import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/user/routes";
import roomRoutes from "./modules/room/routes";
import patientRoutes from "./modules/patient/routes";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/patients", patientRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
