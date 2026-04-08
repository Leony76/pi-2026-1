import "dotenv/config";
import cors from "cors";
import express from "express";

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/user/routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
	response.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
	const message = error.message || "Internal server error";
	const status = (error as Error & { statusCode?: number }).statusCode ?? 500;

	response.status(status).json({ message });
});

const port = Number(process.env.PORT ?? 3333);

app.listen(port, () => {
	console.log(`HTTP server running on port ${port}`);
});
