import { describe, expect, it } from "vitest";
import { componentMap } from "@/renderer/componentMap";
import { SECTION_TYPES } from "@/lib/types/website-config";

describe("component registry", () => {
  it("registers every catalog section type exactly once", () => {
    expect(Object.keys(componentMap).sort()).toEqual([...SECTION_TYPES].sort());
  });

  it("maps each catalog ID to a React component", () => {
    for (const type of SECTION_TYPES) {
      expect(componentMap[type]).toBeTypeOf("function");
    }
  });
});
