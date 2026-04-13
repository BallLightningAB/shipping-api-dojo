import { defineConfig } from "@playwright/test";

const port = 3000;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: "./tests/browser",
	timeout: 30_000,
	expect: {
		timeout: 5000,
	},
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
	use: {
		baseURL,
		headless: true,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "off",
	},
	projects: [
		{
			name: "chromium",
			use: {
				channel: "chromium",
			},
		},
	],
	webServer: {
		command: "pnpm dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
