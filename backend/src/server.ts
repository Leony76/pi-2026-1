import dotenv from "dotenv";
import path from "path";

import { app } from "./app";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const port = Number(process.env.PORT ?? 3333);

app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}!`);
});
