"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const port = Number(process.env.PORT ?? 3333);
app_1.app.listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
});
//# sourceMappingURL=server.js.map