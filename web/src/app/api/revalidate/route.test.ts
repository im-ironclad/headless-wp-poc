// @vitest-environment node
import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const request = (body: unknown, secret = "s3cret") =>
  new Request("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify(body),
  });

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.mocked(revalidateTag).mockClear();
    vi.stubEnv("REVALIDATE_SECRET", "s3cret");
  });

  it("expires every tag WordPress sends so the next visit gets fresh content", async () => {
    const response = await POST(request({ tags: ["page:/about", "pages"] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: ["page:/about", "pages"] });
    expect(revalidateTag).toHaveBeenCalledWith("page:/about", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("pages", { expire: 0 });
  });

  it("rejects requests without the shared secret", async () => {
    const response = await POST(request({ tags: ["globals"] }, "wrong"));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects bodies without a list of tags", async () => {
    const response = await POST(request({ tags: "globals" }));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
