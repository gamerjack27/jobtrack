import { Router } from "express";
import {
  AuthService,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  WeakPasswordError
} from "../services/auth.service.js";

const router = Router();

router.post("/auth/register", async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return res.status(400).json({ error: { code: "EMAIL_EXISTS", message: err.message } });
    }
    if (err instanceof WeakPasswordError) {
      return res.status(400).json({ error: { code: "WEAK_PASSWORD", message: err.message } });
    }
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: err.message } });
    }
    next(err);
  }
});

router.post("/auth/refresh", (req, res, next) => {
  try {
    const tokens = AuthService.refreshToken(req.body.refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: err.message } });
  }
});

export default router;