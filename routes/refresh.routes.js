import { Router } from "express";
import { getRefreshCron, getDetalle, compare } from "../controllers/refresh.controller.js";

const router = Router();

router.get("/refresh_cron", getRefreshCron);
router.get("/detalle/:id", getDetalle);
router.get("/compare", compare);

export default router;
