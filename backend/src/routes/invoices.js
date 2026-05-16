import { Router } from "express";
import { asyncWrapper }      from "../middleware/asyncWrapper.js";
import { validate }          from "../middleware/validate.js";
import { invoiceController } from "../controllers/invoiceController.js";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  querySchema,
} from "../schemas/invoiceSchemas.js";

const router = Router();

router.get(    "/",                    validate(querySchema, "query"), asyncWrapper(invoiceController.getAll));
router.get(    "/:id",                 asyncWrapper(invoiceController.getById));
router.post(   "/",                    validate(createInvoiceSchema), asyncWrapper(invoiceController.create));
router.patch(  "/:id",                 validate(updateInvoiceSchema), asyncWrapper(invoiceController.update));
router.patch(  "/:id/pay",             asyncWrapper(invoiceController.markPaid));
router.delete( "/:id",                 asyncWrapper(invoiceController.delete));
router.get(    "/:id/reminders",       asyncWrapper(invoiceController.getReminderHistory));
router.get(    "/:id/reminders/status",asyncWrapper(invoiceController.getReminderStatus));

export default router;