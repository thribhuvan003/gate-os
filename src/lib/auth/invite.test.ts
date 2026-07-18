import { describe, expect, it } from "vitest";
import { safeNextPath } from "./invite";

describe("safeNextPath", () => {
  it("defaults to the private workspace", () => expect(safeNextPath(null)).toBe("/app"));
  it("keeps local paths", () => expect(safeNextPath("/app/notes")).toBe("/app/notes"));
  it("rejects protocol-relative redirects", () => expect(safeNextPath("//attacker.example")).toBe("/app"));
});

