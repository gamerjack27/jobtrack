import { TokenService, InvalidTokenError } from "../services/token.service.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Authentication token is missing or malformed." }
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof InvalidTokenError) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: err.message }
      });
    }
    next(err);
  }
}