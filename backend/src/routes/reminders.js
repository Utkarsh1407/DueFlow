import { Router }             from "express";
import { asyncWrapper }       from "../middleware/asyncWrapper.js";
import { requireAuth }        from "../middleware/requireAuth.js"; // 👈
import { reminderController } from "../controllers/reminderController.js";

const router = Router();

router.post("/:invoiceId/send",     requireAuth, asyncWrapper(reminderController.send));
router.get( "/:invoiceId/history",  requireAuth, asyncWrapper(reminderController.getHistory));
router.get( "/:invoiceId/cooldown", requireAuth, asyncWrapper(reminderController.getCooldownStatus));

export default router;