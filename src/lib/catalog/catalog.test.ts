import { describe, expect, it } from "vitest";
import { GATE_CS_IT_2026_BASELINE } from "./gate-cs-2026";
import { validateGateCatalog } from "./helpers";

describe("GATE catalog baseline", () => {
  it("has stable, internally valid references", () => {
    expect(validateGateCatalog(GATE_CS_IT_2026_BASELINE)).toEqual([]);
  });

  it("ships as a baseline, not a false official 2027 claim", () => {
    expect(GATE_CS_IT_2026_BASELINE.version.baselineYear).toBe(2026);
    expect(GATE_CS_IT_2026_BASELINE.version.status).toBe("baseline-pending-official-release");
  });
});
