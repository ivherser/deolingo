import { describe, expect, it } from "vitest";
import { isAdminEmail, parseAdminEmails } from "@/lib/admin";

describe("admin email allowlist", () => {
  it("normalizes comma-separated addresses", () => {
    expect(parseAdminEmails(" Admin@Example.com, , other@example.com ")).toEqual(
      new Set(["admin@example.com", "other@example.com"]),
    );
    expect(isAdminEmail(" ADMIN@example.com ", "admin@example.com,other@example.com")).toBe(true);
  });

  it("does not authorize an empty or non-listed address", () => {
    expect(isAdminEmail("admin@example.com", "")).toBe(false);
    expect(parseAdminEmails(undefined).size).toBe(0);
    expect(isAdminEmail("other@example.com", "admin@example.com")).toBe(false);
  });
});
