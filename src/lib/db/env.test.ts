import { describe, expect, it } from "vitest";

import { getDatabaseUrl, parseDatabaseEnv } from "./env";

describe("parseDatabaseEnv", () => {
	it("accepts a valid postgres connection string", () => {
		const parsed = parseDatabaseEnv({
			DATABASE_URL:
				"postgres://postgres:postgres@localhost:5432/shipping_api_dojo",
		});

		expect(parsed.DATABASE_URL).toContain("shipping_api_dojo");
	});

	it("throws when DATABASE_URL is missing", () => {
		expect(() => parseDatabaseEnv({})).toThrowError();
	});
});

describe("getDatabaseUrl", () => {
	it("returns DATABASE_URL from a process-like env object", () => {
		const result = getDatabaseUrl({
			DATABASE_URL: "postgres://postgres:postgres@localhost:5432/test_db",
		});

		expect(result).toBe("postgres://postgres:postgres@localhost:5432/test_db");
	});
});
