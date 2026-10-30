import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const testUser = { id: "u1", email: "jackson@example.com", displayName: "Jackson" };
const sampleApp = {
  id: "1", company: "Acme", jobTitle: "Developer", status: "APPLIED",
  appliedDate: "2026-10-03T00:00:00.000Z", salary: "90000", location: "Remote",
};

const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });

// pretend backend: auth routes plus the applications list, and it rejects tokens it doesn't recognise
function makeServer() {
  const state = { validAccess: "access-1", validRefresh: "refresh-1" };
  const calls = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method || "GET";
    calls.push(`${method} ${url}`);
    const body = options.body ? JSON.parse(options.body) : {};

    if (url === "/api/auth/login") {
      if (body.password !== "correct-password") {
        return reply(401, { error: { message: "Invalid email or password." } });
      }
      return reply(200, { user: testUser, accessToken: state.validAccess, refreshToken: state.validRefresh });
    }
    if (url === "/api/auth/register") {
      if (body.email === "taken@example.com") {
        return reply(400, { error: { message: "This email is already registered." } });
      }
      return reply(201, { user: testUser, accessToken: state.validAccess, refreshToken: state.validRefresh });
    }
    if (url === "/api/auth/refresh") {
      if (body.refreshToken !== state.validRefresh) {
        return reply(401, { error: { code: "INVALID_TOKEN", message: "Invalid or expired refresh token." } });
      }
      state.validAccess = "access-2";
      state.validRefresh = "refresh-2";
      return reply(200, { accessToken: state.validAccess, refreshToken: state.validRefresh });
    }
    if (url === "/api/applications") {
      if (options.headers?.Authorization !== `Bearer ${state.validAccess}`) {
        return reply(401, { error: { message: "Invalid or expired access token." } });
      }
      return reply(200, [sampleApp]);
    }
    return reply(404, { error: { message: "not found" } });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { state, calls };
}

const saveSession = (tokens) =>
  localStorage.setItem("jobtrack_session", JSON.stringify({ user: testUser, tokens }));
const savedSession = () => JSON.parse(localStorage.getItem("jobtrack_session"));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("App", () => {
  it("shows the login screen when nothing is saved", () => {
    makeServer();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Log in to JobTrack" })).toBeInTheDocument();
  });

  it("logs in, shows the table, and saves the session", async () => {
    const user = userEvent.setup();
    makeServer();
    render(<App />);

    await user.type(screen.getByLabelText("Email"), "jackson@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Welcome, Jackson")).toBeInTheDocument();
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(savedSession().tokens).toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("shows the server's error on a wrong password and saves nothing", async () => {
    const user = userEvent.setup();
    makeServer();
    render(<App />);

    await user.type(screen.getByLabelText("Email"), "jackson@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Log in to JobTrack" })).toBeInTheDocument();
    expect(localStorage.getItem("jobtrack_session")).toBeNull();
  });

  it("registers a new account, loads the table, and saves the session", async () => {
    const user = userEvent.setup();
    makeServer();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Register" }));
    await user.type(screen.getByLabelText("Display Name"), "Jackson");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    // this is the one that caught the handleRegister bug - no tokens meant the table never loaded
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(savedSession().tokens.accessToken).toBe("access-1");
  });

  it("shows the server's error when the email is already registered", async () => {
    const user = userEvent.setup();
    makeServer();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Register" }));
    await user.type(screen.getByLabelText("Display Name"), "Jackson");
    await user.type(screen.getByLabelText("Email"), "taken@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("This email is already registered.")).toBeInTheDocument();
    expect(localStorage.getItem("jobtrack_session")).toBeNull();
  });

  it("stays logged in after a page reload", async () => {
    const server = makeServer();
    saveSession({ accessToken: "access-1", refreshToken: "refresh-1" }); // like a session left from before the reload
    render(<App />);

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Log in to JobTrack" })).not.toBeInTheDocument();
    expect(server.calls).toEqual(["GET /api/applications"]);
  });

  it("refreshes an expired access token and retries the request", async () => {
    const server = makeServer();
    saveSession({ accessToken: "expired", refreshToken: "refresh-1" });
    render(<App />);

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(server.calls).toEqual([
      "GET /api/applications",
      "POST /api/auth/refresh",
      "GET /api/applications",
    ]);
    expect(savedSession().tokens).toEqual({ accessToken: "access-2", refreshToken: "refresh-2" });
  });

  it("goes back to the login screen when the refresh token is dead too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // the table logs the failed load
    makeServer();
    saveSession({ accessToken: "expired", refreshToken: "also-expired" });
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Log in to JobTrack" })).toBeInTheDocument();
    expect(localStorage.getItem("jobtrack_session")).toBeNull();
  });

  it("logs out: back to the login screen and the saved session is cleared", async () => {
    const user = userEvent.setup();
    makeServer();
    saveSession({ accessToken: "access-1", refreshToken: "refresh-1" });
    render(<App />);
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByRole("heading", { name: "Log in to JobTrack" })).toBeInTheDocument();
    expect(localStorage.getItem("jobtrack_session")).toBeNull();
  });
});