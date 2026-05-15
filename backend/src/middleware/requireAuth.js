// server/src/middleware/requireAuth.js

import { clerkMiddleware, getAuth } from "@clerk/express";

// Clerk's global middleware — verifies JWT on every request
export const clerkMiddlewareHandler = clerkMiddleware();

// Route-level guard — call after clerkMiddlewareHandler
export function requireAuth(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      error:   "Unauthorized. Please sign in.",
    });
  }

  // Attach userId to req for use in controllers if needed
  req.userId = userId;
  next();
}