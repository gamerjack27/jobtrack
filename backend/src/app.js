import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";

const app = express();

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", applicationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred."
    }
  });
});

export default app;