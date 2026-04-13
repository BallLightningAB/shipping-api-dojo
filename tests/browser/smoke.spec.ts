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
const VERSION_DRIFT_WSDL_MONITORING =
	/version drift, wsdl monitoring, and regeneration/i;
const SOAP_HEADERS_AUTH_CORRELATION_IDS =
	/soap headers, auth tokens, and correlation ids/i;
const PRACTICE_DRILLS = /practice drills/i;
const MARK_LESSON_COMPLETE = /mark lesson complete/i;
const TRACKING_WEBHOOK_TIMED_OUT_ONCE = /tracking webhook timed out once/i;
const DUPLICATE_WEBHOOK_REPLAY = /duplicate webhook replay/i;
const SOAP_HEADER_AUTH_MISMATCH = /soap header\/auth mismatch/i;
const BACK_TO_SCENARIOS = /back to scenarios/i;
const SCHEMA_VALIDATION = /schema validation/i;
const SOURCES_HEADING = /^Sources$/;
const W3C_XML_SCHEMA_PRIMER = /w3c xml schema primer/i;
const DIRECTORY_HEADING = /directory/i;
const SPECIFICATIONS_AND_STANDARDS = /specifications & standards/i;
const WS_SECURITY = /ws-security soap message security 1\.1\.1/i;
const XMLUNIT = /xmlunit/i;

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

test("soap hub renders the expanded wave 3 lesson set", async ({ page }) => {
	await page.goto("/learn/soap");

	await expect(
		page.getByRole("heading", { level: 1, name: SOAP_TRACK })
	).toBeVisible();
	await expect(
		page.getByRole("link", {
			name: ENVELOPE_NAMESPACES,
		})
	).toBeVisible();
	await expect(
		page.getByRole("link", {
			name: VERSION_DRIFT_WSDL_MONITORING,
		})
	).toBeVisible();
});

test("wave 3 SOAP lesson route renders drills and supports rerolling", async ({
	page,
}) => {
	await page.goto("/lesson/soap-5-headers-auth-correlation-ids");

	await expect(
		page.getByRole("heading", {
			level: 1,
			name: SOAP_HEADERS_AUTH_CORRELATION_IDS,
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
	await expect(
		page.getByRole("button", { name: SOAP_HEADER_AUTH_MISMATCH })
	).toBeVisible();

	await page.goto("/arena?scenario=duplicate-webhook-replay&runSeed=123");
	await expect(page.getByText(TRACKING_WEBHOOK_TIMED_OUT_ONCE)).toBeVisible();
	await expect(
		page.getByRole("button", { name: BACK_TO_SCENARIOS })
	).toBeVisible();
});

test("wave 3 wiki support content renders", async ({ page }) => {
	await page.goto("/wiki/schema-validation");

	await expect(
		page.getByRole("heading", { level: 1, name: SCHEMA_VALIDATION })
	).toBeVisible();
	await expect(
		page.getByRole("heading", { level: 3, name: SOURCES_HEADING })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: W3C_XML_SCHEMA_PRIMER })
	).toBeVisible();
});

test("directory includes the SOAP operational references", async ({ page }) => {
	await page.goto("/directory");

	await expect(
		page.getByRole("heading", { level: 1, name: DIRECTORY_HEADING })
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: SPECIFICATIONS_AND_STANDARDS })
	).toBeVisible();
	await expect(page.getByRole("link", { name: WS_SECURITY })).toBeVisible();
	await expect(page.getByRole("link", { name: XMLUNIT })).toBeVisible();
});
