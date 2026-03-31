import { Resend } from "resend";

import { getAuthEnv } from "@/lib/auth/env";
import { renderAuthActionEmail } from "@/lib/email/templates/auth-action";

interface AuthEmailInput {
	email: string;
	subject: string;
	url: string;
	title: string;
}

const AUTH_EMAIL_COPY = {
	magicLink: {
		subject: "Your Shipping API Dojo sign-in link",
		title: "Sign in to Shipping API Dojo",
	},
	resetPassword: {
		subject: "Reset your Shipping API Dojo password",
		title: "Reset your password",
	},
} as const;

async function sendAuthEmail({ email, subject, title, url }: AuthEmailInput) {
	const env = getAuthEnv();
	const resend = new Resend(env.RESEND_API_KEY);

	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: [email],
		subject,
		html: renderAuthActionEmail({
			actionLabel: "Continue",
			actionUrl: url,
			previewText: subject,
			title,
		}),
	});
}

export async function sendMagicLinkEmail(email: string, url: string) {
	await sendAuthEmail({
		email,
		url,
		subject: AUTH_EMAIL_COPY.magicLink.subject,
		title: AUTH_EMAIL_COPY.magicLink.title,
	});
}

export async function sendResetPasswordEmail(email: string, url: string) {
	await sendAuthEmail({
		email,
		url,
		subject: AUTH_EMAIL_COPY.resetPassword.subject,
		title: AUTH_EMAIL_COPY.resetPassword.title,
	});
}
