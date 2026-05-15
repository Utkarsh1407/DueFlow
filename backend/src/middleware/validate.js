// server/src/middleware/validate.js

import { ZodError } from "zod";

// server/src/middleware/validate.js
export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req.validated = parsed;   // ✅ always safe, never read-only
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field:   e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error:   "Validation failed.",
          errors,
        });
      }
      next(err);
    }
  };
}