import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository.js";
import { TokenService } from "./token.service.js";
import { assertNonEmpty } from "../utils/validation.js";

export class EmailAlreadyRegisteredError extends Error {}
export class InvalidCredentialsError extends Error {}
export class WeakPasswordError extends Error {}

export const AuthService = {
  async register({ email, displayName, password }) {
    assertNonEmpty(email, "email");
    assertNonEmpty(displayName, "displayName");
    assertNonEmpty(password, "password");

    if (password.length < 8) {
      throw new WeakPasswordError("Password must be at least 8 characters long.");
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyRegisteredError("This email is already registered.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await UserRepository.create({ email, displayName, passwordHash });
    } catch {
      throw new EmailAlreadyRegisteredError("This email is already registered.");
    }

    const tokens = TokenService.issueTokens(user);
    return { user, ...tokens };
  },

  async login({ email, password }) {
    assertNonEmpty(email, "email");
    assertNonEmpty(password, "password");

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }

    const tokens = TokenService.issueTokens(user);
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  },

  refreshToken(refreshToken) {
    assertNonEmpty(refreshToken, "refreshToken");
    return TokenService.refresh(refreshToken);
  }
};