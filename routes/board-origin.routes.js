import { Router } from "express";
import { getBoardOrigin, getInfoEleccion, getCardData } from "../controllers/board-origin.controller.js";

const router = Router();

router.get("/board-origin", getBoardOrigin);
router.get("/api/board-origin/:id", getInfoEleccion);
router.get("/api/board-origin/:id/card/:cardName", getCardData);

export default router;
