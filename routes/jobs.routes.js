import { Router } from "express";
import { getCron, getCronsDetails } from "../controllers/jobs.controller.js";

const router = Router();

router.get("/jobs", getCron);
router.get("/jobs/details/:id", getCronsDetails);

export default router;
