import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import {
	buildAuthBaseURLConfig,
	getCrossSubdomainCookieConfig,
	shouldUseSecureCookies,
} from "@/lib/auth/config";
import { getAuthEnv, parseTrustedOrigins } from "@/lib/auth/env";
import { sendMagicLinkEmail, sendResetPasswordEmail } from "@/lib/auth/email";
import { getDb } from "@/lib/db/client";
import { schema } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/email/lifecycle";

const authEnv = getAuthEnv();

export const auth = betterAuth({
	baseURL: buildAuthBaseURLConfig(authEnv),
	secret: authEnv.BETTER_AUTH_SECRET,
	trustedOrigins: parseTrustedOrigins(authEnv.BETTER_AUTH_TRUSTED_ORIGINS),
	advanced: {
		crossSubDomainCookies: getCrossSubdomainCookieConfig(authEnv),
		trustedProxyHeaders: true,
		useSecureCookies: shouldUseSecureCookies(authEnv),
	},
	database: drizzleAdapter(getDb(), {
		provider: "pg",
		schema: {
			account: schema.account,
			session: schema.session,
			user: schema.user,
			verification: schema.verification,
		},
	}),
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await sendWelcomeEmail(user.email);
				},
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail(user.email, url);
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
	},
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendMagicLinkEmail(email, url);
			},
		}),
		tanstackStartCookies(),
	],
});
