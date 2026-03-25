import { Resend } from "resend";

import { getAuthEnv } from "@/lib/auth/env";

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
		html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h1 style="font-size: 20px;">${title}</h1>
        <p>Use the button below to continue.</p>
        <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Continue</a></p>
        <p>If the button does not work, copy this URL:</p>
        <p><a href="${url}">${url}</a></p>
      </div>
    `,
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
