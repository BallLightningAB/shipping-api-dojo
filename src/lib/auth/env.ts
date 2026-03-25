import { z } from "zod";

const authEnvSchema = z.object({
	APP_BASE_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
	BETTER_AUTH_URL: z.url(),
	RESEND_API_KEY: z.string().min(1),
	RESEND_FROM_EMAIL: z.email(),
	RESEND_WEBHOOK_SECRET: z.string().optional(),
	SESSION_COOKIE_DOMAIN: z.string().optional(),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

export function parseAuthEnv(input: unknown): AuthEnv {
	return authEnvSchema.parse(input);
}

export function parseTrustedOrigins(raw: string | undefined): string[] {
	if (!raw) {
		return [];
	}

	return raw
		.split(",")
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);
}

export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
	return parseAuthEnv(env);
}
