"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./modules/auth/routes"));
const routes_2 = __importDefault(require("./modules/user/routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
});
app.use("/auth", routes_1.default);
app.use("/users", routes_2.default);
app.use((error, _request, response, _next) => {
    const message = error.message || "Internal server error";
    const status = error.statusCode ?? 500;
    response.status(status).json({ message });
});
const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
});
//# sourceMappingURL=server.js.map