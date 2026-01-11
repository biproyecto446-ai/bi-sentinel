import { Router } from "express";
import { 
  getCron, 
  getCronsDetails, 
  getJobById,
  updateJobSchedule,
  toggleJobActive,
  updateJob
} from "../controllers/jobs.controller.js";

const router = Router();

// Páginas
router.get("/jobs", getCron);
router.get("/jobs/details/:id", getCronsDetails);

// API endpoints
router.get("/api/jobs/:id", getJobById);
router.put("/api/jobs/:id", updateJob);
router.patch("/api/jobs/:id/schedule", updateJobSchedule);
router.patch("/api/jobs/:id/toggle", toggleJobActive);

export default router;
