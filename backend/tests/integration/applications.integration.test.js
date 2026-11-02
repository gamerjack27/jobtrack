import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/client.js";
import { ApplicationService } from "../../src/services/application.service.js";
import {
  resetDatabase,
  createTestUser,
  tokenFor,
} from "../test-utils/fixtures.js";

describe("Application Routes Integration Tests", () => {
  let user;
  let accessToken;

  beforeEach(async () => {
    await resetDatabase();

    // Create a test user via fixtures and generate token
    user = await createTestUser({ email: "apptest@example.com" });
    accessToken = tokenFor(user);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new job application when authenticated", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        company: "Acme Corp",
        jobTitle: "Software Engineer",
        status: "WISHLIST",
        location: "Remote",
        salary: "$100,000",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.company).toBe("Acme Corp");
    expect(res.body.jobTitle).toBe("Software Engineer");
  });

  it("should reject application creation without authentication", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({
        company: "Acme Corp",
        jobTitle: "Software Engineer",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should retrieve user applications", async () => {
    // Create one first via route
    await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        company: "Tech Co",
        jobTitle: "Backend Developer",
      });

    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].company).toBe("Tech Co");
  });

  it("should return 404 when trying to update a non-existent application", async () => {
    const res = await request(app)
      .patch("/api/applications/99999999-9999-9999-9999-999999999999")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobTitle: "Ghost Job" });

    expect(res.status).toBe(404);
  });

  it("should return 404 when trying to delete a non-existent application", async () => {
    const res = await request(app)
      .delete("/api/applications/99999999-9999-9999-9999-999999999999")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("should handle custom NotFoundError in application routes", async () => {
    const res = await request(app)
      .patch("/api/applications/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobTitle: "Nonexistent" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("should handle unexpected service errors via next(err)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(ApplicationService, "getUserApplications").mockRejectedValue(new Error("Unexpected DB crash"));
  
    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(500);

    ApplicationService.getUserApplications.mockRestore();
    consoleSpy.mockRestore();
  });
});