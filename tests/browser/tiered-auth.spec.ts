/**
 * Tier-gated browser coverage for dev-tier seeded users.
 *
 * These tests auto-skip when `.playwright-auth/credentials.json` is missing
 * (the CI default). Run them locally with:
 *
 *   1. populate `.env.local` with DATABASE_URL + ENABLE_DEV_SEED=true
 *   2. `pnpm seed:dev-users`
 *   3. `pnpm test:e2e`
 */

import { expect, test } from "@playwright/test";

import type { DevTierKey } from "../../src/lib/dev/seed-fixtures";

import {
	devTierCredentialsAvailable,
	ensureStorageStateForTier,
} from "./fixtures/tiered-auth";

const HOME_HEADING = /shipping api dojo/i;
const SETTINGS = /settings/i;
const CURRENT_ENTITLEMENT_STATE = /current entitlement state/i;
const UNLOCK_NEW_CHALLENGE_PRO = /unlock new challenge \(pro\)/i;
const NEW_CHALLENGE = /^new challenge$/i;

const LESSON_PATH =
	"/lesson/cross-track-2-carrier-capability-matrix-integration-architecture";

const TIER_MATRIX: Array<{
	tier: DevTierKey;
	expectInSettings: RegExp;
	expectUnlockedReroll: boolean;
}> = [
	{
		tier: "free",
		expectInSettings: /tier:\s*free/i,
		expectUnlockedReroll: false,
	},
	{
		tier: "pro",
		expectInSettings: /tier:\s*pro/i,
		expectUnlockedReroll: true,
	},
	{
		tier: "enterprise",
		expectInSettings: /tier:\s*enterprise/i,
		expectUnlockedReroll: true,
	},
	{
		tier: "canceled",
		expectInSettings: /tier:\s*free/i,
		expectUnlockedReroll: false,
	},
	{
		tier: "inactive",
		expectInSettings: /tier:\s*free/i,
		expectUnlockedReroll: false,
	},
];

test.describe("dev-tier seeded auth", () => {
	test.skip(
		!devTierCredentialsAvailable(),
		"Dev-tier credentials not seeded. Run `pnpm seed:dev-users` to enable."
	);

	for (const entry of TIER_MATRIX) {
		test(`${entry.tier} tier renders the expected entitlement state`, async ({
			browser,
			baseURL,
		}) => {
			const statePath = await ensureStorageStateForTier({
				baseURL: baseURL ?? "http://127.0.0.1:3101",
				tier: entry.tier,
			});
			expect(statePath).not.toBeNull();

			const context = await browser.newContext({
				storageState: statePath ?? undefined,
			});
			const page = await context.newPage();
			try {
				await page.goto("/");
				await expect(
					page.getByRole("heading", { level: 1, name: HOME_HEADING })
				).toBeVisible();

				await page.goto("/settings");
				await expect(
					page.getByRole("heading", { level: 1, name: SETTINGS })
				).toBeVisible();
				await expect(page.getByText(CURRENT_ENTITLEMENT_STATE)).toBeVisible();
				await expect(
					page.getByText(entry.expectInSettings).first()
				).toBeVisible();

				await page.goto(LESSON_PATH);
				if (entry.expectUnlockedReroll) {
					await expect(
						page.getByRole("button", { name: NEW_CHALLENGE })
					).toBeVisible();
				} else {
					await expect(
						page.getByRole("link", { name: UNLOCK_NEW_CHALLENGE_PRO })
					).toBeVisible();
				}
			} finally {
				await context.close();
			}
		});
	}
});

test("anonymous baseline still sees locked premium rerolls even with tier seeds present", async ({
	page,
}) => {
	await page.goto(LESSON_PATH);
	await expect(
		page.getByRole("link", { name: UNLOCK_NEW_CHALLENGE_PRO })
	).toBeVisible();
});
