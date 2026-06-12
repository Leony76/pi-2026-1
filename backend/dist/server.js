"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = require("./app");
const envPaths = [path_1.default.resolve(__dirname, "../../.env"), path_1.default.resolve(__dirname, "../.env")];
for (const envPath of envPaths) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        break;
    }
}
const port = Number(process.env.PORT ?? 3333);
app_1.app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`);
});
//# sourceMappingURL=server.js.map