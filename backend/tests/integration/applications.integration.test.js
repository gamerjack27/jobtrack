import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/client.js";

describe("Application Routes Integration Tests", () => {
  let accessToken;

  beforeEach(async () => {
    await prisma.application.deleteMany({});
    await prisma.user.deleteMany({});

    // Register and login a user to get a valid token for requests
    const userPayload = {
      email: "apptest@example.com",
      displayName: "App Tester",
      password: "securepassword123"
    };

    const regRes = await request(app).post("/api/auth/register").send(userPayload);
    accessToken = regRes.body.accessToken;
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
        salary: "$100,000"
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
        jobTitle: "Software Engineer"
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should retrieve user applications", async () => {
    // Create one first
    await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        company: "Tech Co",
        jobTitle: "Backend Developer"
      });

    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].company).toBe("Tech Co");
  });
});