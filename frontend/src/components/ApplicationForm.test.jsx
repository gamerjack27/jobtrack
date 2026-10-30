import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationForm from "./ApplicationForm";

describe("ApplicationForm", () => {
  it("starts empty with the default status when adding", () => {
    render(<ApplicationForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText("Company")).toHaveValue("");
    expect(screen.getByLabelText("Role")).toHaveValue("");
    expect(screen.getByLabelText("Location")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("WISHLIST");
  });

  it("fills in the fields from initialData when editing", () => {
    const existing = {
      company: "Acme",
      jobTitle: "Developer",
      status: "APPLIED",
      appliedDate: "2026-10-03T00:00:00.000Z", // what the API sends back
      salary: "90000",
      location: "Remote",
    };
    render(<ApplicationForm initialData={existing} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText("Company")).toHaveValue("Acme");
    expect(screen.getByLabelText("Role")).toHaveValue("Developer");
    expect(screen.getByLabelText("Status")).toHaveValue("APPLIED");
    // the date input only wants the YYYY-MM-DD part
    expect(screen.getByLabelText("Applied Date")).toHaveValue("2026-10-03");
    expect(screen.getByLabelText("Salary")).toHaveValue(90000);
    expect(screen.getByLabelText("Location")).toHaveValue("Remote");
  });

  it("calls onSubmit with the typed values and a full ISO date", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("Company"), "Acme");
    await user.type(screen.getByLabelText("Role"), "Engineer");
    await user.selectOptions(screen.getByLabelText("Status"), "APPLIED");
    fireEvent.change(screen.getByLabelText("Applied Date"), { target: { value: "2026-10-03" } });
    await user.type(screen.getByLabelText("Salary"), "85000");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      company: "Acme",
      jobTitle: "Engineer",
      status: "APPLIED",
      appliedDate: "2026-10-03T00:00:00.000Z",
      salary: "85000",
      location: "Remote",
    });
  });

  it("calls onCancel and not onSubmit when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("doesn't submit when the required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});