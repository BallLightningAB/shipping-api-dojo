import type { AuthEnv } from "./env";
import { parseTrustedOrigins } from "./env";

function toHostname(urlString: string): string | null {
	try {
		return new URL(urlString).hostname;
	} catch {
		return null;
	}
}

export function getAllowedAuthHosts(env: AuthEnv): string[] {
	const hosts = new Set<string>();

	const baseHosts = [env.APP_BASE_URL, env.BETTER_AUTH_URL]
		.map(toHostname)
		.filter((host): host is string => Boolean(host));

	for (const host of baseHosts) {
		hosts.add(host);
	}

	for (const origin of parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS)) {
		const host = toHostname(origin);
		if (host) {
			hosts.add(host);
		}
	}

	return [...hosts];
}

export function buildAuthBaseURLConfig(env: AuthEnv) {
	return {
		allowedHosts: getAllowedAuthHosts(env),
		fallback: env.BETTER_AUTH_URL,
		protocol: "auto" as const,
	};
}

export function getCrossSubdomainCookieConfig(env: AuthEnv):
	| {
			domain: string;
			enabled: true;
	  }
	| undefined {
	if (!env.SESSION_COOKIE_DOMAIN) {
		return undefined;
	}

	return {
		domain: env.SESSION_COOKIE_DOMAIN,
		enabled: true,
	};
}

export function shouldUseSecureCookies(env: AuthEnv): boolean {
	return new URL(env.BETTER_AUTH_URL).protocol === "https:";
}
