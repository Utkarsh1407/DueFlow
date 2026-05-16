import { Router }            from "express";
import { asyncWrapper }      from "../middleware/asyncWrapper.js";
import { requireAuth }       from "../middleware/requireAuth.js"; // 👈
import { validate }          from "../middleware/validate.js";
import { invoiceController } from "../controllers/invoiceController.js";
import { createInvoiceSchema, updateInvoiceSchema, querySchema } from "../schemas/invoiceSchemas.js";

const router = Router();

router.get(   "/",                     requireAuth, validate(querySchema, "query"), asyncWrapper(invoiceController.getAll));
router.get(   "/:id",                  requireAuth, asyncWrapper(invoiceController.getById));
router.post(  "/",                     requireAuth, validate(createInvoiceSchema),  asyncWrapper(invoiceController.create));
router.patch( "/:id",                  requireAuth, validate(updateInvoiceSchema),  asyncWrapper(invoiceController.update));
router.patch( "/:id/pay",              requireAuth, asyncWrapper(invoiceController.markPaid));
router.delete("/:id",                  requireAuth, asyncWrapper(invoiceController.delete));
router.get(   "/:id/reminders",        requireAuth, asyncWrapper(invoiceController.getReminderHistory));
router.get(   "/:id/reminders/status", requireAuth, asyncWrapper(invoiceController.getReminderStatus));

export default router;