import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationTable from "./ApplicationTable";

const sampleApps = [
  { id: "1", company: "Acme", jobTitle: "Developer", status: "APPLIED", appliedDate: "2026-10-03T00:00:00.000Z", salary: "90000", location: "Remote" },
  { id: "2", company: "Globex", jobTitle: "Intern", status: "WISHLIST", appliedDate: "2026-10-05T00:00:00.000Z", salary: "", location: "Austin" },
];

const jsonResponse = (body, ok = true) => ({ ok, json: async () => body });

// pretends to be the backend, keeps its own list of rows so changes stick between calls
function makeFakeApi(initial = sampleApps) {
  let rows = [...initial];
  return vi.fn(async (url, options = {}) => {
    const method = options.method || "GET";
    if (method === "GET") return jsonResponse([...rows]);
    if (method === "POST") {
      const created = { id: "99", ...JSON.parse(options.body) };
      rows = [...rows, created];
      return jsonResponse(created);
    }
    if (method === "PATCH") {
      const id = url.split("/").pop();
      const updated = { ...rows.find((r) => r.id === id), ...JSON.parse(options.body) };
      rows = rows.map((r) => (r.id === id ? updated : r));
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const id = url.split("/").pop();
      rows = rows.filter((r) => r.id !== id);
      return { ok: true, status: 204 };
    }
  });
}

const callsWith = (api, method) => api.mock.calls.filter(([, opts]) => opts?.method === method);

afterEach(() => vi.restoreAllMocks());

describe("ApplicationTable", () => {
  it("shows a loading message, then the rows from the API", async () => {
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);

    expect(screen.getByText("Loading applications...")).toBeInTheDocument();
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(api.mock.calls[0][0]).toBe("/api/applications");
  });

  it("stops loading and shows no rows if the API call fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // the component logs this on purpose
    const api = vi.fn(async () => jsonResponse({ error: { message: "nope" } }, false));
    render(<ApplicationTable authFetch={api} />);

    await waitFor(() =>
      expect(screen.queryByText("Loading applications...")).not.toBeInTheDocument()
    );
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
  });

  it("filters the rows when you type in the search box", async () => {
    const user = userEvent.setup();
    render(<ApplicationTable authFetch={makeFakeApi()} />);
    await screen.findByText("Acme");

    await user.type(screen.getByPlaceholderText("Search applications..."), "Glob");

    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
  });

  it("adds an application: POSTs it, shows the new row, closes the modal", async () => {
    const user = userEvent.setup();
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Add Application" }));
    await user.type(screen.getByLabelText("Company"), "Initech");
    await user.type(screen.getByLabelText("Role"), "Analyst");
    fireEvent.change(screen.getByLabelText("Applied Date"), { target: { value: "2026-10-10" } });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Initech")).toBeInTheDocument();
    expect(callsWith(api, "POST")).toHaveLength(1);
    expect(JSON.parse(callsWith(api, "POST")[0][1].body).company).toBe("Initech");
    expect(screen.queryByRole("heading", { name: "Add Application" })).not.toBeInTheDocument();
  });

  it("edits an application: opens the row, PATCHes the change, updates the table", async () => {
    const user = userEvent.setup();
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);
    await user.click(await screen.findByText("Acme")); // clicking the row opens the edit modal

    expect(screen.getByRole("heading", { name: "Edit Application" })).toBeInTheDocument();
    const company = screen.getByLabelText("Company");
    expect(company).toHaveValue("Acme");
    await user.clear(company);
    await user.type(company, "Acme Corp");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
    expect(callsWith(api, "PATCH")[0][0]).toBe("/api/applications/1");
  });

  it("changes a status from the row dropdown and sends only the status", async () => {
    const user = userEvent.setup();
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);
    await screen.findByText("Acme");

    await user.selectOptions(screen.getAllByRole("combobox")[0], "INTERVIEWING");

    await waitFor(() => expect(screen.getAllByRole("combobox")[0]).toHaveValue("INTERVIEWING"));
    expect(callsWith(api, "PATCH")[0][0]).toBe("/api/applications/1");
    expect(JSON.parse(callsWith(api, "PATCH")[0][1].body)).toEqual({ status: "INTERVIEWING" });
  });

  it("deletes a row after the user confirms", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);
    const row = (await screen.findByText("Acme")).closest("tr");

    await user.click(within(row).getByRole("button")); // the trash icon is the only button in the row

    await waitFor(() => expect(screen.queryByText("Acme")).not.toBeInTheDocument());
    expect(callsWith(api, "DELETE")[0][0]).toBe("/api/applications/1");
  });

  it("keeps the row if the user cancels the delete confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const api = makeFakeApi();
    render(<ApplicationTable authFetch={api} />);
    const row = (await screen.findByText("Acme")).closest("tr");

    await user.click(within(row).getByRole("button"));

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(callsWith(api, "DELETE")).toHaveLength(0);
  });
});