import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("Worker API", () => {
	it("returns name from /api/ endpoint", async () => {
		const response = await SELF.fetch("http://example.com/api/");
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual({ name: "Cloudflare" });
	});

	it("returns 404 for unknown routes", async () => {
		const response = await SELF.fetch("http://example.com/unknown");
		expect(response.status).toBe(404);
	});
});
