import { describe, expect, it } from "vitest";
import { listKnownSiteSlugs } from "@/lib/sites/get-site";

describe("get-site public resolver", () => {
  it("does not expose hardcoded demo slugs", () => {
    expect(listKnownSiteSlugs()).toEqual([]);
  });
});
