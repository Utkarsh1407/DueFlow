// server/src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;

  // Prisma known request errors (e.g. record not found, unique constraint)
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error:   "Record not found.",
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error:   "A record with this value already exists.",
    });
  }

  // Validation errors (thrown manually with a 400)
  if (status === 400) {
    return res.status(400).json({
      success: false,
      error:   err.message ?? "Bad request.",
    });
  }

  // Log unexpected server errors
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}`, err);
  }

  return res.status(status).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message ?? "Internal server error.",
  });
}