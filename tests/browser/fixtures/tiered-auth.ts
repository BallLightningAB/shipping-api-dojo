/**
 * Playwright helpers for dev-tier seeded users.
 *
 * The helpers load the credentials file written by `pnpm seed:dev-users`
 * (`.playwright-auth/credentials.json`) and expose a `storageStateForTier`
 * function that signs in as the requested tier and returns a Playwright
 * storage state path. Tests that rely on tier state can consume these
 * fixtures without duplicating fragile signin steps.
 *
 * When the credentials file is missing (e.g. CI without a seeded DB) the
 * helpers return `null` so callers can skip cleanly instead of failing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { APIRequestContext, BrowserContext } from "@playwright/test";
import { request as playwrightRequest } from "@playwright/test";

import { type DevTierKey } from "../../../src/lib/dev/seed-fixtures";

const CREDENTIALS_PATH = resolve(
	process.cwd(),
	".playwright-auth",
	"credentials.json"
);

function storageStatePathForTier(tier: DevTierKey): string {
	return resolve(process.cwd(), ".playwright-auth", `storage-${tier}.json`);
}

interface CredentialEntry {
	email: string;
	key: DevTierKey;
	password: string;
}

interface CredentialsFile {
	entries: CredentialEntry[];
}

export function devTierCredentialsAvailable(): boolean {
	return existsSync(CREDENTIALS_PATH);
}

function loadCredentials(): CredentialsFile | null {
	if (!devTierCredentialsAvailable()) {
		return null;
	}
	const raw = readFileSync(CREDENTIALS_PATH, "utf-8");
	return JSON.parse(raw) as CredentialsFile;
}

export function getCredentialsForTier(
	tier: DevTierKey
): CredentialEntry | null {
	const file = loadCredentials();
	if (!file) {
		return null;
	}
	return file.entries.find((entry) => entry.key === tier) ?? null;
}

async function signInViaApi(
	request: APIRequestContext,
	credentials: CredentialEntry
): Promise<void> {
	const response = await request.post("/api/auth/sign-in/email", {
		data: {
			email: credentials.email,
			password: credentials.password,
		},
	});
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(
			`sign-in failed for ${credentials.email}: ${response.status()} ${body}`
		);
	}
}

export interface TierStorageStateOptions {
	baseURL: string;
	tier: DevTierKey;
}

/**
 * Sign in as the requested tier using Better Auth's email/password endpoint
 * and write a Playwright storage state file that tests can reuse. Returns
 * the storage state path, or `null` if credentials are missing.
 */
export async function ensureStorageStateForTier(
	options: TierStorageStateOptions
): Promise<string | null> {
	const credentials = getCredentialsForTier(options.tier);
	if (!credentials) {
		return null;
	}

	const resolved: CredentialEntry = {
		key: options.tier,
		email: credentials.email,
		password: credentials.password,
	};

	const statePath = storageStatePathForTier(options.tier);
	const context = await playwrightRequest.newContext({
		baseURL: options.baseURL,
	});
	try {
		await signInViaApi(context, resolved);
		const state = await context.storageState();
		mkdirSync(dirname(statePath), { recursive: true });
		writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
	} finally {
		await context.dispose();
	}
	return statePath;
}

export async function applyTierStorageState(
	context: BrowserContext,
	tier: DevTierKey
): Promise<boolean> {
	const credentials = getCredentialsForTier(tier);
	if (!credentials) {
		return false;
	}
	const statePath = storageStatePathForTier(tier);
	if (!existsSync(statePath)) {
		return false;
	}
	const state = JSON.parse(readFileSync(statePath, "utf-8"));
	if (state.cookies) {
		await context.addCookies(state.cookies);
	}
	return true;
}
