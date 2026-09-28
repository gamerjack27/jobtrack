import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ApplicationService, NotFoundError, ForbiddenError } from "../services/application.service.js";

const router = Router();
router.use(requireAuth);

router.post("/applications", async (req, res, next) => {
  try {
    const app = await ApplicationService.createApplication(req.user.sub, req.body);
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
});

router.get("/applications", async (req, res, next) => {
  try {
    const apps = await ApplicationService.getUserApplications(req.user.sub);
    res.status(200).json(apps);
  } catch (err) {
    next(err);
  }
});

router.patch("/applications/:id", async (req, res, next) => {
  try {
    const updated = await ApplicationService.updateApplication(req.user.sub, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof ForbiddenError) return res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } });
    next(err);
  }
});

router.delete("/applications/:id", async (req, res, next) => {
  try {
    await ApplicationService.deleteApplication(req.user.sub, req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof ForbiddenError) return res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } });
    next(err);
  }
});

export default router;