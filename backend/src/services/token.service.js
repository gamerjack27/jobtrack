import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret";
const ACCESS_TOKEN_TTL = "8h"; // TODO: Complete the refresh token implementation
const REFRESH_TOKEN_TTL = "7d";

export class InvalidTokenError extends Error {}

export const TokenService = {
  issueTokens(user) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
      throw new InvalidTokenError("Invalid or expired access token.");
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
      throw new InvalidTokenError("Invalid or expired refresh token.");
    }
  },

  refresh(refreshToken) {
    const payload = this.verifyRefreshToken(refreshToken);
    return this.issueTokens({ id: payload.sub, email: payload.email });
  }
};