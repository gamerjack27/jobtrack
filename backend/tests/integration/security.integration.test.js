import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/client.js";
import {
  resetDatabase,
  createTestUser,
  createTestApplication,
  tokenFor,
} from "../test-utils/fixtures.js";

describe("Security and Authorization Integration Tests", () => {
  let userA;
  let userB;
  let tokenUserA;
  let tokenUserB;
  let userApp;

  beforeEach(async () => {
    await resetDatabase();

    // Create test users via fixtures
    userA = await createTestUser({ email: "usera@example.com" });
    userB = await createTestUser({ email: "userb@example.com" });

    // Generate JWT access tokens via fixtures
    tokenUserA = tokenFor(userA);
    tokenUserB = tokenFor(userB);

    // Seed User A's application via fixtures
    userApp = await createTestApplication({
      userId: userA.id,
      company: "User A's Company",
      jobTitle: "Developer",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should prevent User B from updating User A's application", async () => {
    const res = await request(app)
      .patch(`/api/applications/${userApp.id}`)
      .set("Authorization", `Bearer ${tokenUserB}`)
      .send({
        jobTitle: "Hacked Job Title",
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should prevent User B from deleting User A's application", async () => {
    const res = await request(app)
      .delete(`/api/applications/${userApp.id}`)
      .set("Authorization", `Bearer ${tokenUserB}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should ignore attempts to change userId via PATCH mass-assignment", async () => {
    const res = await request(app)
      .patch(`/api/applications/${userApp.id}`)
      .set("Authorization", `Bearer ${tokenUserA}`)
      .send({
        jobTitle: "Updated Title",
        userId: "hacked-user-id-9999", // Attempted mass assignment
      });

    expect(res.status).toBe(200);
    expect(res.body.jobTitle).toBe("Updated Title");
    expect(res.body.userId).not.toBe("hacked-user-id-9999");
    expect(res.body.userId).toBe(userA.id); // userA is now properly defined from fixture
  });
});