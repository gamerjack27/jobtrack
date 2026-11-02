import { TokenService, InvalidTokenError } from "../../src/services/token.service.js";

describe("TokenService", () => {
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
});