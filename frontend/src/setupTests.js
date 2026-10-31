import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// clear the fake page between tests so they don't leak into each other
afterEach(() => cleanup());