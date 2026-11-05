import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BackendApiError,
  generateSiteConfig,
  getBackendBaseUrl,
} from "@/lib/api/backend";

describe("backend API client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requires NEXT_PUBLIC_API_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(() => getBackendBaseUrl()).toThrow(BackendApiError);
  });

  it("strips trailing slashes from the base URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000/");
    expect(getBackendBaseUrl()).toBe("http://localhost:8000");
  });

  it("posts generate with bearer auth", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        config: {
          siteName: "Demo",
          theme: {
            style: "modern",
            primaryColor: "#111111",
            accentColor: "#C9A45C",
          },
          sections: [
            {
              id: "hero_01",
              type: "hero",
              variant: "centered",
              props: { headline: "Demo" },
            },
          ],
        },
        sectionCount: 1,
        sectionTypes: ["hero"],
        site: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateSiteConfig("token-123", {
      businessName: "Demo",
      style: "modern",
      inspirationHint: "Clean modern shop",
      sections: ["hero", "about", "footer"],
    });

    expect(result.sectionCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/v1/sites/generate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as { body: string }).body,
    ) as {
      sections: string[];
      inspirationHint: string;
    };
    expect(body.sections).toEqual(["hero", "about", "footer"]);
    expect(body.inspirationHint).toBe("Clean modern shop");
  });
});

