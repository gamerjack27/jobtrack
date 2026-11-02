import { resetDatabase, createTestUser, createTestApplication } from "../test-utils/fixtures.js";
import { UserRepository } from "../../src/repositories/user.repository.js";
import { ApplicationRepository } from "../../src/repositories/application.repository.js";

describe("Repository Unit Tests", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("should find a user by ID using UserRepository.findById", async () => {
    const createdUser = await createTestUser({ email: "repouser@example.com" });
    const foundUser = await UserRepository.findById(createdUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(createdUser.id);
    expect(foundUser.email).toBe("repouser@example.com");
    expect(foundUser).not.toHaveProperty("passwordHash");
  });

  it("should delete an application using ApplicationRepository.delete", async () => {
    const user = await createTestUser();
    const app = await createTestApplication({ userId: user.id });

    const deleted = await ApplicationRepository.delete(app.id);
    expect(deleted.id).toBe(app.id);

    const check = await ApplicationRepository.findById(app.id);
    expect(check).toBeNull();
  });
});