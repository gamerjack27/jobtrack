import request from "supertest";
import app from "../src/app.js";

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