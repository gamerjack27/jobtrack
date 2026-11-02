import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/client.js";
import { resetDatabase, createTestUser } from "../test-utils/fixtures.js";

describe("Auth Integration Tests", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    email: "integration@example.com",
    displayName: "Integration User",
    password: "securepassword123",
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
    // Pre-seed user via fixture helper
    await createTestUser({ email: testUser.email });

    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("should successfully log in an existing user", async () => {
    // Pre-seed user with known password
    await createTestUser({
      email: testUser.email,
      password: testUser.password,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail login with a non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "somepassword123",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should fail login with an incorrect password", async () => {
    await createTestUser({
      email: "wrongpass@example.com",
      password: "correctpassword123",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrongpass@example.com",
        password: "badpassword",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should fail registration if password is less than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "shortpass@example.com",
        displayName: "Short Pass",
        password: "123",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("WEAK_PASSWORD");
  });

  it("should successfully refresh tokens given a valid refresh token", async () => {
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: "refreshtest@example.com",
        displayName: "Refresh Test",
        password: "securepassword123",
      });

    const refreshToken = regRes.body.refreshToken;

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should return 401 when attempting to refresh with an invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "invalid.refresh.token" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });
});