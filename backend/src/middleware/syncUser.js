import prisma from "../lib/prisma.js";

export async function syncUser(req, res, next) {
  try {
    const userId = req.userId;
    if (userId) {
      await prisma.user.upsert({
        where:  { id: userId },
        update: {},
        create: { id: userId },
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}