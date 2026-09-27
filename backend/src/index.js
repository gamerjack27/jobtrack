import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", healthRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred."
    }
  });
});

app.listen(PORT, () => {
  console.log(`JobTrack API listening on port ${PORT}`);
});