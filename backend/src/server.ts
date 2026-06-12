import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { app } from "./app";

const envPaths = [path.resolve(__dirname, "../.env"), path.resolve(__dirname, "../../.env")];
let loadedEnvPath: string | null = null;

for (const envPath of envPaths) {
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
		loadedEnvPath = envPath;
		break;
	}
}

if (!loadedEnvPath) {
	console.warn("Nenhum arquivo .env foi encontrado para o backend.");
}

const port = Number(process.env.PORT ?? 3333);

app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}!`);
});
