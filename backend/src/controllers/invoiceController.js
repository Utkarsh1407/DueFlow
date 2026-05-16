import { invoiceService }  from "../services/invoiceService.js";
import { reminderService } from "../services/reminderService.js";
import { successResponse } from "../lib/utils.js";

export const invoiceController = {

  async getAll(req, res) {
    const invoices = await invoiceService.getAll(req.query);
    return successResponse(res, { invoices });
  },

  async getById(req, res) {
    const invoice = await invoiceService.getById(req.params.id);
    return successResponse(res, { invoice });
  },

  async create(req, res) {
    const invoice = await invoiceService.create(req.body);
    return successResponse(res, { invoice }, 201);
  },

  async update(req, res) {
    const invoice = await invoiceService.update(req.params.id, req.body);
    return successResponse(res, { invoice });
  },

  async markPaid(req, res) {
    const invoice = await invoiceService.markPaid(req.params.id);
    return successResponse(res, { invoice });
  },

  async delete(req, res) {
    const result = await invoiceService.delete(req.params.id);
    return successResponse(res, result);
  },

  async getReminderHistory(req, res) {
    const reminders = await reminderService.getHistory(req.params.id);
    return successResponse(res, { reminders });
  },

  async getReminderStatus(req, res) {
    const status = await reminderService.getCooldownStatus(req.params.id);
    return successResponse(res, status);
  },

};