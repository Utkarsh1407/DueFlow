import { Router } from "express";
import { asyncWrapper }        from "../middleware/asyncWrapper.js";
import { validate }            from "../middleware/validate.js";
import { activityController }  from "../controllers/activityController.js";
import { paginationSchema }    from "../schemas/activitySchemas.js"; // optional: move schema out

const router = Router();

router.get("/",           validate(paginationSchema, "query"), asyncWrapper(activityController.getAll));
router.get("/:invoiceId", asyncWrapper(activityController.getByInvoice));

export default router;