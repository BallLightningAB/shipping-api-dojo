/**
 * Dev-only tiered seed CLI.
 *
 * Run with:
 *   pnpm seed:dev-users
 *
 * Guarded by `src/lib/dev/seed-guard.ts` — the script refuses to run unless
 * NODE_ENV is `development` or `test`, VERCEL_ENV is not production or
 * preview, `ENABLE_DEV_SEED=true`, and DATABASE_URL is set. The script
 * writes the seeded credentials to `.playwright-auth/credentials.json` so
 * the Playwright tiered-auth helpers can discover them.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { closeDbPool } from "@/lib/db/client";
import { seedDevUsers } from "@/lib/dev/seed-dev-users";

const OUTPUT_PATH = resolve(
	process.cwd(),
	".playwright-auth",
	"credentials.json"
);

async function main(): Promise<void> {
	const result = await seedDevUsers(process.env);
	mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
	const payload = {
		generatedAt: new Date().toISOString(),
		entries: result.entries,
	};
	writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

	for (const entry of result.entries) {
		const status = entry.created ? "created" : "existing";
		const subscription = entry.subscriptionId
			? ` subscription=${entry.subscriptionId}`
			: "";
		console.log(
			`[seed-dev-users] ${entry.key} (${status}) email=${entry.email} tier=${entry.expectedTier}${subscription}`
		);
	}

	console.log(`[seed-dev-users] credentials written to ${OUTPUT_PATH}`);
}

main()
	.catch((error) => {
		console.error("[seed-dev-users] failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await closeDbPool();
	});
