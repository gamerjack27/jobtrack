import { jest } from "@jest/globals";
import { errorHandler } from "../../src/middleware/error-handler.js";

describe("errorHandler Middleware Unit Tests", () => {
  let req, res, next, consoleSpy;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  it("should return formatted error message in non-production environment", () => {
    process.env.NODE_ENV = "development";
    const error = new Error("Database query failed");
    error.status = 400;
    error.code = "BAD_REQUEST";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "BAD_REQUEST",
        message: "Database query failed",
      },
    });
  });

  it("should mask internal error messages in production environment", () => {
    process.env.NODE_ENV = "production";
    const error = new Error("Sensitive DB connection leak details");
    error.status = 500;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong.",
      },
    });
  });
});