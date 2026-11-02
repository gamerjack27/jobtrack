import { TokenService, InvalidTokenError } from "../../src/services/token.service.js";
import jwt from "jsonwebtoken";

describe("TokenService Unit Tests", () => {
  const mockUser = { id: "123-uuid", email: "test@example.com" };

  it("should issue valid access and refresh tokens", () => {
    const tokens = TokenService.issueTokens(mockUser);
    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");

    const verified = TokenService.verifyAccessToken(tokens.accessToken);
    expect(verified.sub).toBe(mockUser.id);
    expect(verified.email).toBe(mockUser.email);
  });

  it("should throw InvalidTokenError for a malformed token", () => {
    expect(() => {
      TokenService.verifyAccessToken("invalid.token.string");
    }).toThrow(InvalidTokenError);
  });

  it("should reject tokens signed with the wrong secret or tampered payload", () => {
    const tamperedToken = jwt.sign(
      { sub: mockUser.id, email: mockUser.email },
      "wrong-secret",
      { expiresIn: "1h" }
    );

    expect(() => {
      TokenService.verifyAccessToken(tamperedToken);
    }).toThrow(InvalidTokenError);
  });

  it("should round-trip refresh tokens through the refresh verifier but reject them via access verifier", () => {
    const tokens = TokenService.issueTokens(mockUser);

    // Verify successfully with refresh verifier
    const payload = TokenService.verifyRefreshToken(tokens.refreshToken);
    expect(payload.sub).toBe(mockUser.id);

    // Reject refresh token when passed to access token verifier
    expect(() => {
      TokenService.verifyAccessToken(tokens.refreshToken);
    }).toThrow(InvalidTokenError);
  });

  it("should throw InvalidTokenError when verifying an invalid or expired refresh token", () => {
    expect(() => {
      TokenService.verifyRefreshToken("malformed.refresh.token");
    }).toThrow(InvalidTokenError);
  });
});