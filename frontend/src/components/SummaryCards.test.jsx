import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryCards from "./SummaryCards";

const apps = [
  { id: "1", status: "WISHLIST" },
  { id: "2", status: "APPLIED" },
  { id: "3", status: "INTERVIEWING" },
  { id: "4", status: "OFFERED" },
  { id: "5", status: "REJECTED" },
];

// each number sits right under its label
const valueFor = (label) => screen.getByText(label).nextElementSibling.textContent;

describe("SummaryCards", () => {
  it("shows zeros when there are no applications", () => {
    render(<SummaryCards applications={[]} />);

    expect(valueFor("Applied")).toBe("0");
    expect(valueFor("Interviewing")).toBe("0");
    expect(valueFor("Offers")).toBe("0");
  });

  it("counts every status except bookmarked as applied", () => {
    render(<SummaryCards applications={apps} />);

    expect(valueFor("Applied")).toBe("4");
    expect(valueFor("Interviewing")).toBe("1");
    expect(valueFor("Offers")).toBe("1");
  });

  it("doesn't count bookmarked applications", () => {
    render(<SummaryCards applications={[{ id: "1", status: "WISHLIST" }]} />);

    expect(valueFor("Applied")).toBe("0");
  });

  it("recalculates when the list changes", () => {
    const { rerender } = render(<SummaryCards applications={[]} />);
    rerender(<SummaryCards applications={apps} />);

    expect(valueFor("Applied")).toBe("4");
  });
});