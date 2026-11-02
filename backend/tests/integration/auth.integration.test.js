import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/client.js";

describe("Auth Integration Tests", () => {
  beforeEach(async () => {
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("test")) {
      throw new Error("Tests must be run against a test database! Check your DATABASE_URL.");
    }
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    email: "integration@example.com",
    displayName: "Integration User",
    password: "securepassword123"
  };

  it("should successfully register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should fail registration with an existing email", async () => {
    // Register first
    await request(app).post("/api/auth/register").send(testUser);

    // Try registering again with the same email
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("should successfully log in an existing user", async () => {
    // Register first
    await request(app).post("/api/auth/register").send(testUser);

    // Try logging in
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user.email).toBe(testUser.email);
  });
});