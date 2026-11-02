import request from "supertest";
import express from "express";
import healthRoutes from "../src/routes/health.routes.js";

const app = express();
app.use("/api", healthRoutes);

describe("Health Check Endpoint", () => {
  it("should return status ok and service name", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "jobtrack-api"
    });
  });
});