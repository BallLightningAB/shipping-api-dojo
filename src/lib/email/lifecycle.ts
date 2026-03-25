import { Resend } from "resend";

import { getAuthEnv } from "../auth/env";
import { renderAuthActionEmail } from "./templates/auth-action";

type LifecycleEmailType =
	| "welcome"
	| "subscription_confirmation"
	| "payment_failure"
	| "subscription_cancellation";

interface LifecycleEmailCopy {
	actionLabel: string;
	subject: string;
	title: string;
}

const PLAN_LABELS: Record<string, string> = {
	enterprise: "Enterprise",
	pro_annual: "Pro Annual",
	pro_monthly: "Pro Monthly",
};

function resolvePlanLabel(planKey: string | null | undefined): string {
	if (!planKey) {
		return "Pro";
	}
	return PLAN_LABELS[planKey] ?? "Pro";
}

export function buildLifecycleEmailCopy(
	type: LifecycleEmailType,
	options?: { planKey?: string | null }
): LifecycleEmailCopy {
	switch (type) {
		case "welcome":
			return {
				actionLabel: "Start learning",
				subject: "Welcome to Shipping API Dojo",
				title: "Welcome to Shipping API Dojo",
			};
		case "subscription_confirmation":
			return {
				actionLabel: "Manage billing",
				subject: `${resolvePlanLabel(options?.planKey)} subscription confirmed`,
				title: "Your subscription is active",
			};
		case "payment_failure":
			return {
				actionLabel: "Update payment method",
				subject: "Payment failed for your Shipping API Dojo subscription",
				title: "Payment failed",
			};
		case "subscription_cancellation":
			return {
				actionLabel: "Review plan options",
				subject: "Your Shipping API Dojo subscription was canceled",
				title: "Subscription canceled",
			};
		default:
			throw new Error(`Unsupported lifecycle email type: ${type}`);
	}
}

async function sendLifecycleEmail(
	email: string,
	type: LifecycleEmailType,
	options?: { planKey?: string | null }
) {
	const env = getAuthEnv();
	const resend = new Resend(env.RESEND_API_KEY);
	const copy = buildLifecycleEmailCopy(type, options);
	const settingsUrl = `${env.APP_BASE_URL}/settings`;

	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		html: renderAuthActionEmail({
			actionLabel: copy.actionLabel,
			actionUrl: settingsUrl,
			previewText: copy.subject,
			title: copy.title,
		}),
		subject: copy.subject,
		to: [email],
	});
}

export async function sendWelcomeEmail(email: string) {
	await sendLifecycleEmail(email, "welcome");
}

export async function sendSubscriptionConfirmationEmail(
	email: string,
	planKey: string | null | undefined
) {
	await sendLifecycleEmail(email, "subscription_confirmation", { planKey });
}

export async function sendPaymentFailureEmail(email: string) {
	await sendLifecycleEmail(email, "payment_failure");
}

export async function sendSubscriptionCancellationEmail(email: string) {
	await sendLifecycleEmail(email, "subscription_cancellation");
}
