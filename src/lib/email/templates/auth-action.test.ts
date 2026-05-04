import { describe, expect, it } from "vitest";

import { renderAuthActionEmail } from "./auth-action";

describe("renderAuthActionEmail", () => {
	it("renders the provided title and action URL", () => {
		const html = renderAuthActionEmail({
			actionLabel: "Sign in",
			actionUrl: "https://shipping.apidojo.app/auth/magic?token=test",
			previewText: "Sign in to Shipping API Dojo",
			title: "Sign in to Shipping API Dojo",
		});

		expect(html).toContain("Sign in to Shipping API Dojo");
		expect(html).toContain(
			"https://shipping.apidojo.app/auth/magic?token=test"
		);
		expect(html).toContain("<!DOCTYPE html>");
	});
});
