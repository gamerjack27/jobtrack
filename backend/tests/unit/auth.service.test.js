import { jest } from "@jest/globals";
import { AuthService, EmailAlreadyRegisteredError } from "../../src/services/auth.service.js";
import { UserRepository } from "../../src/repositories/user.repository.js";

describe("AuthService Unit Tests", () => {
  it("should throw EmailAlreadyRegisteredError when UserRepository.create fails unexpectedly", async () => {
    jest.spyOn(UserRepository, "findByEmail").mockResolvedValue(null);
    jest.spyOn(UserRepository, "create").mockRejectedValue(new Error("DB Constraint Violation"));

    await expect(
      AuthService.register({
        email: "unique@example.com",
        displayName: "User",
        password: "securepassword123",
      })
    ).rejects.toThrow(EmailAlreadyRegisteredError);

    UserRepository.findByEmail.mockRestore();
    UserRepository.create.mockRestore();
  });
});