import { jest } from "@jest/globals";
import { requireAuth } from "../../src/middleware/auth.middleware.js";
import { TokenService, InvalidTokenError } from "../../src/services/token.service.js";

describe("requireAuth Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should return 401 if Authorization header is missing", () => {
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "UNAUTHORIZED", message: "Authentication token is missing or malformed." },
    });
  });

  it("should return 401 if Authorization header does not start with Bearer", () => {
    req.headers.authorization = "Basic 12345";
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 on InvalidTokenError", () => {
    req.headers.authorization = "Bearer badtoken";
    jest.spyOn(TokenService, "verifyAccessToken").mockImplementation(() => {
      throw new InvalidTokenError("Token invalid");
    });

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "UNAUTHORIZED", message: "Token invalid" },
    });

    TokenService.verifyAccessToken.mockRestore();
  });

  it("should call next(err) when a non-InvalidTokenError occurs", () => {
    req.headers.authorization = "Bearer validformat";
    const genericError = new Error("Unexpected error");
    jest.spyOn(TokenService, "verifyAccessToken").mockImplementation(() => {
      throw genericError;
    });

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(genericError);

    TokenService.verifyAccessToken.mockRestore();
  });
});