import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { magicLink } from "better-auth/plugins/magic-link";
import { expect, it } from "vitest";

const BASE_URL = "http://localhost:3101";
const EMAIL = "learner@example.test";
const PASSWORD = "Local-test-password-9381!";

function createTestAuth() {
	const database: Record<string, object[]> = {
		account: [],
		session: [],
		user: [],
		verification: [],
	};
	const delivery = { url: "" };
	const auth = betterAuth({
		baseURL: BASE_URL,
		secret: "local-test-only-secret-with-at-least-32-characters",
		database: memoryAdapter(database),
		emailAndPassword: { enabled: true },
		logger: { disabled: true },
		rateLimit: { enabled: false },
		plugins: [
			magicLink({
				sendMagicLink: ({ url }) => {
					delivery.url = url;
					return Promise.resolve();
				},
			}),
		],
	});
	return { auth, database, delivery };
}

function sessionHeaders(response: Response): Headers {
	return new Headers({
		cookie: response.headers
			.getSetCookie()
			.map((cookie) => cookie.split(";")[0])
			.join("; "),
		origin: BASE_URL,
	});
}

it("preserves password sign-in and revokes the session on sign-out", async () => {
	const { auth } = createTestAuth();
	await auth.api.signUpEmail({
		body: { email: EMAIL, name: "Test learner", password: PASSWORD },
	});
	const response = await auth.api.signInEmail({
		asResponse: true,
		body: { email: EMAIL, password: PASSWORD },
		headers: new Headers({ "x-forwarded-for": "203.0.113.10" }),
	});
	expect(response.status).toBe(200);
	const headers = sessionHeaders(response);
	expect((await auth.api.getSession({ headers }))?.user.email).toBe(EMAIL);
	expect((await auth.api.getSession({ headers }))?.session.ipAddress).toBe(
		"203.0.113.10"
	);
	await auth.api.signOut({ headers });
	expect(await auth.api.getSession({ headers })).toBeNull();
});

it("accepts a delivered magic link once and rejects replay", async () => {
	const { auth, delivery } = createTestAuth();
	await auth.api.signInMagicLink({
		body: { email: EMAIL, callbackURL: `${BASE_URL}/settings` },
		headers: new Headers({ origin: BASE_URL }),
	});
	expect(delivery.url).toContain("/magic-link/verify?");
	const response = await auth.handler(new Request(delivery.url));
	expect(response.status).toBe(302);
	expect(response.headers.get("location")).toBe(`${BASE_URL}/settings`);
	expect(
		(await auth.api.getSession({ headers: sessionHeaders(response) }))?.user
			.email
	).toBe(EMAIL);
	const replay = await auth.handler(new Request(delivery.url));
	expect(replay.headers.get("location")).toContain("error=");
});

it.each([
	"",
	"magic-link:",
])("rejects an unrelated verification payload with identifier prefix '%s'", async (prefix) => {
	const { auth, database } = createTestAuth();
	const token = "cross-purpose-token";
	database.verification.push({
		id: "unrelated-verification",
		identifier: `${prefix}${token}`,
		value: JSON.stringify({ email: EMAIL }),
		expiresAt: new Date(Date.now() + 60_000),
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	const response = await auth.handler(
		new Request(`${BASE_URL}/api/auth/magic-link/verify?token=${token}`)
	);
	expect(response.headers.get("location")).toContain("error=");
	expect(database.session).toHaveLength(0);
});
