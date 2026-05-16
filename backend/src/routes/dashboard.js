import { Router } from "express";
import { asyncWrapper }       from "../middleware/asyncWrapper.js";
import { dashboardController } from "../controllers/dashboardController.js";

const router = Router();

router.get("/stats",           asyncWrapper(dashboardController.getStats));
router.get("/chart",           asyncWrapper(dashboardController.getChart));
router.get("/recent-activity", asyncWrapper(dashboardController.getRecentActivity));
router.get("/",                asyncWrapper(dashboardController.getDashboard));

export default router;