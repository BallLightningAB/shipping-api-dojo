import { expect, test } from "@playwright/test";

const HOME_HEADING = /shipping api dojo/i;
const PRIVACY_POLICY = /privacy policy/i;
const COOKIE_AND_STORAGE = /cookie & storage/i;
const COOKIE_AND_STORAGE_DISCLOSURE = /cookie & storage disclosure/i;
const FUTURE_CONSENT_TRIGGER_MATRIX = /future consent-trigger matrix/i;
const START_REST_TRACK = /start rest track/i;
const START_SOAP_TRACK = /start soap track/i;
const INCIDENT_ARENA = /incident arena/i;
const SETTINGS = /settings/i;
const PLANS_AND_ACCESS = /plans and access/i;
const CURRENT_ENTITLEMENT_STATE = /current entitlement state/i;
const ACCOUNT_DATA_RIGHTS = /account data rights/i;
const ACCESS_AND_EXPORT = /access and export/i;
const DELETION_REQUESTS = /deletion requests/i;
const SUPPORT_CONTACT = /support contact/i;
const RETENTION_SUMMARY = /retention summary/i;
const WIKI_QUICK_REFERENCE = /wiki quick-reference/i;
const REST_TRACK = /rest track/i;
const IDEMPOTENCY_KEYS = /idempotency keys & deduplication patterns/i;
const OBSERVABILITY_RUNBOOKS =
	/observability, health checks & incident runbooks/i;
const SOAP_TRACK = /soap track/i;
const ENVELOPE_NAMESPACES = /envelope & namespaces/i;
const VERSION_DRIFT_WSDL_MONITORING =
	/version drift, wsdl monitoring, and regeneration/i;
const CROSS_TRACK_HUB = /cross-track hub/i;
const CARRIER_CAPABILITY_MATRIX = /carrier capability matrix/i;
const SANDBOX_VS_PRODUCTION_BEHAVIOR = /sandbox vs production behavior/i;
const PRACTICE_DRILLS = /practice drills/i;
const MARK_LESSON_COMPLETE = /mark lesson complete/i;
const UNLOCK_NEW_CHALLENGE_PRO = /unlock new challenge \(pro\)/i;
const CHECK_ANSWER = /check answer/i;
const ACCEPT_COOKIES =
	/accept cookies|accept all|allow analytics|manage cookies/i;
const TRACKING_WEBHOOK_TIMED_OUT_ONCE = /tracking webhook timed out once/i;
const DUPLICATE_WEBHOOK_REPLAY = /duplicate webhook replay/i;
const SOAP_HEADER_AUTH_MISMATCH = /soap header\/auth mismatch/i;
const SANDBOX_WORKS_BUT_PRODUCTION_REJECTS =
	/sandbox works but production rejects the request/i;
const UNLOCK_ADVANCED_SCENARIO_DEPTH = /unlock advanced scenario depth/i;
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
		page.locator("main").getByRole("link", { name: CROSS_TRACK_HUB }).first()
	).toBeVisible();
	await expect(
		page.locator("main").getByRole("link", { name: INCIDENT_ARENA }).first()
	).toBeVisible();
	await expect(
		page.locator("main").getByRole("link", { name: WIKI_QUICK_REFERENCE })
	).toBeVisible();
	await expect(
		page.locator("footer").getByRole("link", { name: PRIVACY_POLICY })
	).toBeVisible();
	await expect(
		page.locator("footer").getByRole("link", { name: COOKIE_AND_STORAGE })
	).toBeVisible();
});

test("public legal disclosure routes are reachable from the footer", async ({
	page,
}) => {
	await page.goto("/");

	await page
		.locator("footer")
		.getByRole("link", { name: PRIVACY_POLICY })
		.click();
	await expect(
		page.getByRole("heading", { level: 1, name: PRIVACY_POLICY })
	).toBeVisible();

	await page.goto("/cookies");
	await expect(
		page.getByRole("heading", {
			level: 1,
			name: COOKIE_AND_STORAGE_DISCLOSURE,
		})
	).toBeVisible();
	await expect(page.getByText(FUTURE_CONSENT_TRIGGER_MATRIX)).toBeVisible();
});

test("settings exposes the privacy and account-rights surfaces", async ({
	page,
}) => {
	await page.goto("/settings");

	await expect(
		page.getByRole("heading", { level: 1, name: SETTINGS })
	).toBeVisible();
	await expect(page.getByText(PLANS_AND_ACCESS)).toBeVisible();
	await expect(page.getByText(CURRENT_ENTITLEMENT_STATE)).toBeVisible();
	await expect(page.getByText(ACCOUNT_DATA_RIGHTS)).toBeVisible();
	await expect(page.getByText(ACCESS_AND_EXPORT)).toBeVisible();
	await expect(page.getByText(DELETION_REQUESTS)).toBeVisible();
	await expect(page.getByText(SUPPORT_CONTACT)).toBeVisible();
	await expect(page.getByText(RETENTION_SUMMARY)).toBeVisible();
});

test("anonymous browser behavior matches the current disclosure baseline", async ({
	page,
}) => {
	await page.goto(
		"/lesson/cross-track-2-carrier-capability-matrix-integration-architecture"
	);

	await expect(
		page.getByRole("button", { name: MARK_LESSON_COMPLETE })
	).toBeVisible();
	await expect(page.getByRole("button", { name: ACCEPT_COOKIES })).toHaveCount(
		0
	);

	await page.getByRole("button", { name: MARK_LESSON_COMPLETE }).click();

	await expect
		.poll(() =>
			page.evaluate(() =>
				window.localStorage.getItem("shipping-api-dojo-progress")
			)
		)
		.not.toBeNull();

	const localStorageKeys = await page.evaluate(() =>
		Object.keys(window.localStorage).sort()
	);
	expect(localStorageKeys).toContain("shipping-api-dojo-progress");
	expect(localStorageKeys).not.toContain("api-trainer-progress");

	const cookieNames = (await page.context().cookies()).map(
		(cookie) => cookie.name
	);
	expect(cookieNames).not.toContain("better-auth.session_token");
	expect(cookieNames).not.toContain("_ga");
	expect(cookieNames).not.toContain("_gid");
	expect(cookieNames).not.toContain("_fbp");
	expect(cookieNames).not.toContain("_hjSessionUser");
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

test("cross-track hub renders the final wave 4 lesson set", async ({
	page,
}) => {
	await page.goto("/learn/cross-track");

	await expect(
		page.getByRole("heading", { level: 1, name: CROSS_TRACK_HUB })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: SANDBOX_VS_PRODUCTION_BEHAVIOR })
	).toBeVisible();
});

test("wave 4 cross-track lesson route keeps drills visible and gates premium rerolls for free tier", async ({
	page,
}) => {
	await page.goto(
		"/lesson/cross-track-2-carrier-capability-matrix-integration-architecture"
	);

	await expect(
		page.getByRole("heading", {
			level: 1,
			name: CARRIER_CAPABILITY_MATRIX,
		})
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: PRACTICE_DRILLS })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: UNLOCK_NEW_CHALLENGE_PRO })
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: CHECK_ANSWER }).first()
	).toBeDisabled();
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
	await expect(
		page.getByText(SANDBOX_WORKS_BUT_PRODUCTION_REJECTS)
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: UNLOCK_ADVANCED_SCENARIO_DEPTH }).first()
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
