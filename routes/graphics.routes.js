import { Router } from "express";
import { getCron, getCronsDetails } from "../controllers/jobs.controller.js";

const router = Router();

router.get("/graphics", getGraphics);

export default router;
