import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { setupHandlebars } from "./config/handlebars.js";

import refreshRoutes from "./routes/refresh.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import boardOriginRoutes from "./routes/board-origin.routes.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setupHandlebars(app, __dirname);

app.use(express.static(path.join(__dirname, "public")));

// app.use(indexRoutes);
app.use(refreshRoutes);
app.use(jobsRoutes);
app.use(boardOriginRoutes);
// app.use(electionsRoutes);
// app.use(exportRoutes);
// app.use(budgetsRoutes);

export default app;
