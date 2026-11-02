import { prisma } from "../../src/db/client.js";
import bcrypt from "bcrypt";
import { TokenService } from "../../src/services/token.service.js";

let userCounter = 0;

export async function createTestUser({ email, password = "correcthorse" } = {}) {
  userCounter += 1;
  const resolvedEmail = email ?? `test-user-${userCounter}@example.com`;
  const passwordHash = await bcrypt.hash(password, 4); // Low cost factor for fast test execution
  return prisma.user.create({
    data: {
      email: resolvedEmail,
      displayName: "Test User",
      passwordHash: passwordHash,
    },
  });
}

export async function createTestApplication({ userId, company = "Fixture Corp", jobTitle = "Software Engineer" } = {}) {
  return prisma.application.create({
    data: {
      userId,
      company,
      jobTitle,
      status: "WISHLIST",
      appliedDate: new Date(),
      salary: "$100,000",
      location: "Remote",
      notes: "Test application",
    },
  });
}

export function tokenFor(user) {
  return TokenService.issueTokens(user).accessToken;
}

export async function resetDatabase() {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("test")) {
    throw new Error("Tests must be run against a test database! Check your DATABASE_URL.");
  }
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});
}