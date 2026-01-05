import { Router } from "express";
import { getBoardOrigin, getInfoEleccion } from "../controllers/board-origin.controller.js";

const router = Router();

router.get("/board-origin", getBoardOrigin);
router.get("/api/board-origin/:id", getInfoEleccion);

export default router;
