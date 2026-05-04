import { describe, expect, it } from "vitest";

import { normalizeHttpUrl } from "./http-url";

describe("normalizeHttpUrl", () => {
	it("normalizes absolute HTTP and HTTPS URLs", () => {
		expect(normalizeHttpUrl("https://creem.io/store/monthly")).toBe(
			"https://creem.io/store/monthly",
		);
		expect(normalizeHttpUrl("http://localhost:3000/path")).toBe(
			"http://localhost:3000/path",
		);
	});

	it("rejects missing, relative, and non-HTTP URLs", () => {
		expect(normalizeHttpUrl(undefined)).toBeNull();
		expect(normalizeHttpUrl("")).toBeNull();
		expect(normalizeHttpUrl("/plans")).toBeNull();
		expect(normalizeHttpUrl("javascript:alert(1)")).toBeNull();
	});
});
