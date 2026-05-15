// server/src/middleware/asyncWrapper.js
// Wraps async route handlers so you never need try/catch in controllers.
// Any thrown error or rejected promise is forwarded to errorHandler.js.
//
// Usage:
//   router.get("/", asyncWrapper(myAsyncController))
//
// Or wrap at the router level with a helper:
//   export const wrap = (fn) => asyncWrapper(fn)

export function asyncWrapper(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}