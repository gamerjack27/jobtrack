import { assertNonEmpty, ValidationError } from "../../src/utils/validation.js";

describe("Validation Utility", () => {
  it("should not throw an error for a valid non-empty string", () => {
    expect(() => assertNonEmpty("Test Company", "company")).not.toThrow();
  });

  it("should throw a ValidationError for missing or empty strings", () => {
    expect(() => assertNonEmpty("", "company")).toThrow(ValidationError);
    expect(() => assertNonEmpty(null, "company")).toThrow(ValidationError);
    expect(() => assertNonEmpty(undefined, "company")).toThrow(ValidationError);
    expect(() => assertNonEmpty("   ", "company")).toThrow(ValidationError);
  });
});