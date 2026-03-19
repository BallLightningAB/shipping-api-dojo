import { describe, expect, it } from "vitest";

import { generateRootEntityGraphSchema } from "./structured-data";

describe("generateRootEntityGraphSchema", () => {
	it("uses the Shipping API Dojo brand and live domain", () => {
		const schema = generateRootEntityGraphSchema() as unknown as {
			"@graph": Record<string, unknown>[];
		};

		const website = schema["@graph"].find(
			(entry) => entry["@type"] === "WebSite"
		);
		const app = schema["@graph"].find(
			(entry) => entry["@type"] === "WebApplication"
		);

		expect(website?.name).toBe("Shipping API Dojo");
		expect(website?.url).toBe("https://shipping.apidojo.app");
		expect(app?.name).toBe("Shipping API Dojo");
		expect(app?.url).toBe("https://shipping.apidojo.app");
	});
});
