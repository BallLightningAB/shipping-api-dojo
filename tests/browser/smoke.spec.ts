import { expect, test } from "@playwright/test";

const HOME_HEADING = /shipping api dojo/i;
const START_REST_TRACK = /start rest track/i;
const START_SOAP_TRACK = /start soap track/i;
const INCIDENT_ARENA = /incident arena/i;
const WIKI_QUICK_REFERENCE = /wiki quick-reference/i;
const REST_TRACK = /rest track/i;
const IDEMPOTENCY_KEYS = /idempotency keys & deduplication patterns/i;
const OBSERVABILITY_RUNBOOKS =
	/observability, health checks & incident runbooks/i;
const SOAP_TRACK = /soap track/i;
const ENVELOPE_NAMESPACES = /envelope & namespaces/i;
const RATE_LIMITS_BACKPRESSURE = /rate limits, quotas & backpressure/i;
const PRACTICE_DRILLS = /practice drills/i;
const MARK_LESSON_COMPLETE = /mark lesson complete/i;
const TRACKING_WEBHOOK_TIMED_OUT_ONCE = /tracking webhook timed out once/i;
const DUPLICATE_WEBHOOK_REPLAY = /duplicate webhook replay/i;
const BACK_TO_SCENARIOS = /back to scenarios/i;
const OAUTH_TOKEN_LIFECYCLE = /oauth token lifecycle/i;
const SOURCES_HEADING = /^Sources$/;
const RFC_6749 = /rfc 6749/i;
const DIRECTORY_HEADING = /directory/i;
const SPECIFICATIONS_AND_STANDARDS = /specifications & standards/i;
const RFC_9331 = /rfc 9331/i;
const OPENTELEMETRY_DOCUMENTATION = /opentelemetry documentation/i;

test("home page exposes the main learning surfaces", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { level: 1, name: HOME_HEADING })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: START_REST_TRACK })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: START_SOAP_TRACK })
	).toBeVisible();
	await expect(
		page.locator("main").getByRole("link", { name: INCIDENT_ARENA }).first()
	).toBeVisible();
	await expect(
		page.locator("main").getByRole("link", { name: WIKI_QUICK_REFERENCE })
	).toBeVisible();
});

test("rest track hub renders the migrated wave 2 lesson set", async ({
	page,
}) => {
	await page.goto("/learn/rest");

	await expect(
		page.getByRole("heading", { level: 1, name: REST_TRACK })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: IDEMPOTENCY_KEYS })
	).toBeVisible();
	await expect(
		page.getByRole("link", {
			name: OBSERVABILITY_RUNBOOKS,
		})
	).toBeVisible();
});

test("soap hub still renders after the rest expansion", async ({ page }) => {
	await page.goto("/learn/soap");

	await expect(
		page.getByRole("heading", { level: 1, name: SOAP_TRACK })
	).toBeVisible();
	await expect(
		page.getByRole("link", {
			name: ENVELOPE_NAMESPACES,
		})
	).toBeVisible();
});

test("wave 2 lesson route renders drills and supports rerolling", async ({
	page,
}) => {
	await page.goto("/lesson/rest-7-rate-limits-quotas-backpressure");

	await expect(
		page.getByRole("heading", {
			level: 1,
			name: RATE_LIMITS_BACKPRESSURE,
		})
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: PRACTICE_DRILLS })
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: MARK_LESSON_COMPLETE })
	).toBeVisible();
});

test("arena lists migrated scenario cards and opens a wave 2 incident", async ({
	page,
}) => {
	await page.goto("/arena");

	await expect(
		page.getByRole("heading", { level: 1, name: INCIDENT_ARENA })
	).toBeVisible();

	await expect(
		page.getByRole("button", { name: DUPLICATE_WEBHOOK_REPLAY })
	).toBeVisible();

	await page.goto("/arena?scenario=duplicate-webhook-replay&runSeed=123");
	await expect(page.getByText(TRACKING_WEBHOOK_TIMED_OUT_ONCE)).toBeVisible();
	await expect(
		page.getByRole("button", { name: BACK_TO_SCENARIOS })
	).toBeVisible();
});

test("wave 2 wiki support content renders", async ({ page }) => {
	await page.goto("/wiki/oauth-token-lifecycle");

	await expect(
		page.getByRole("heading", { level: 1, name: OAUTH_TOKEN_LIFECYCLE })
	).toBeVisible();
	await expect(
		page.getByRole("heading", { level: 3, name: SOURCES_HEADING })
	).toBeVisible();
	await expect(page.getByRole("link", { name: RFC_6749 })).toBeVisible();
});

test("directory includes the new operational references", async ({ page }) => {
	await page.goto("/directory");

	await expect(
		page.getByRole("heading", { level: 1, name: DIRECTORY_HEADING })
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: SPECIFICATIONS_AND_STANDARDS })
	).toBeVisible();
	await expect(page.getByRole("link", { name: RFC_9331 })).toBeVisible();
	await expect(
		page.getByRole("link", { name: OPENTELEMETRY_DOCUMENTATION })
	).toBeVisible();
});
