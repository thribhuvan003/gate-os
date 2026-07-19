import { describe, expect, it } from "vitest";
import { safeNextPath } from "./invite";

describe("safeNextPath", () => {
  it("defaults to the private workspace", () => expect(safeNextPath(null)).toBe("/app"));
  it("keeps local paths", () => expect(safeNextPath("/app/notes")).toBe("/app/notes"));
  it("keeps local query strings and anchors", () => expect(safeNextPath("/app/circles?invite=joined#session")).toBe("/app/circles?invite=joined#session"));
  it("rejects protocol-relative redirects", () => expect(safeNextPath("//attacker.example")).toBe("/app"));
  it("rejects backslash-based redirects", () => expect(safeNextPath("/\\\\attacker.example")).toBe("/app"));
});
