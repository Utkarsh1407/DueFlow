import { Router }            from "express";
import { asyncWrapper }      from "../middleware/asyncWrapper.js";
import { reminderController } from "../controllers/reminderController.js";

const router = Router();

router.post("/:invoiceId/send",     asyncWrapper(reminderController.send));
router.get( "/:invoiceId/history",  asyncWrapper(reminderController.getHistory));
router.get( "/:invoiceId/cooldown", asyncWrapper(reminderController.getCooldownStatus));

export default router;