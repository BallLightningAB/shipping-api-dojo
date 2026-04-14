export const SUPPORT_EMAIL = "info@balllightning.cloud";
export const SUPPORT_CONTACT_LABEL = "Ball Lightning AB support";

export interface DisclosureCard {
	title: string;
	summary: string;
	details: string[];
}

export interface StorageDisclosureItem {
	name: string;
	purpose: string;
	required: string;
	retention: string;
	when: string;
	where: string;
}

export interface RetentionSummaryItem {
	category: string;
	retention: string;
	notes: string[];
}

export const privacyOverviewSections: DisclosureCard[] = [
	{
		title: "Anonymous progress in your browser",
		summary:
			"When you use the public learning product without signing in, progress stays in your current browser storage.",
		details: [
			"We store anonymous lesson, drill, XP, streak, and scenario progress in browser localStorage.",
			"This data stays on the device and browser profile you are using unless you export, import, reset, or clear browser storage.",
			"The anonymous experience does not require an account.",
		],
	},
	{
		title: "Signed-in accounts and server-backed progress",
		summary:
			"When you sign in, we also store account, session, and progress records on our hosted services so progress can persist across sessions and devices.",
		details: [
			"Better Auth manages sign-in, password reset, magic-link flows, and cookie-backed sessions.",
			"Signed-in progress is stored in our hosted database together with merge-event records used when local anonymous progress is synced into an account.",
			"Entitlement and subscription state can also be associated with your account when paid features are enabled.",
		],
	},
	{
		title: "Billing and payment-provider records",
		summary:
			"Paid subscriptions are handled through Creem, and we store the subscription and webhook records needed to reflect billing state inside the app.",
		details: [
			"Creem acts as the payment and subscription system for paid plans.",
			"We receive billing events, subscription status, and plan information needed to update account entitlements and handle disputes, fraud checks, or accounting obligations.",
			"We do not use this repository as a credit-card vault. Payment-card handling stays with the payment provider.",
		],
	},
	{
		title: "Transactional email and delivery events",
		summary:
			"We send sign-in, password-reset, welcome, and billing lifecycle email through Resend and record tracked delivery events that help us operate those messages safely.",
		details: [
			"Transactional emails can include sign-in links, password resets, welcome messages, payment-failure notices, subscription confirmations, or subscription-cancellation notices.",
			"We store tracked delivery, bounce, complaint, and suppression webhook events when Resend reports them back to us.",
			"These records help us troubleshoot delivery issues, avoid repeat sends to bad destinations, and respond to abuse or support requests.",
		],
	},
];

export const browserStorageItems: StorageDisclosureItem[] = [
	{
		name: "Anonymous progress local storage",
		purpose:
			"Remember anonymous lesson, drill, streak, XP, and scenario progress in the browser you are using.",
		required: "Yes. This is part of the progress feature you requested.",
		retention:
			"Until you reset/import progress, clear browser storage, or your browser removes it.",
		when: "When you use lessons, drills, or scenarios without signing in, and also as the local cache that can later be merged into an account.",
		where: "Browser localStorage key `shipping-api-dojo-progress`.",
	},
	{
		name: "Legacy progress migration storage",
		purpose:
			"Migrate older anonymous progress into the current browser storage key without losing prior progress.",
		required: "Yes, but only for users with older saved progress.",
		retention:
			"Read only during migration and removed once data is copied into the current key.",
		when: "Only if an older `api-trainer-progress` key still exists in the browser.",
		where: "Browser localStorage key `api-trainer-progress`.",
	},
	{
		name: "Sign-in and session cookies",
		purpose:
			"Authenticate you, keep your session active, and secure account-related requests.",
		required:
			"Yes. These are strictly necessary when account features are used.",
		retention:
			"Until sign-out, cookie expiry, or browser removal, subject to the configured session lifetime.",
		when: "When you sign in, keep a session active, reset a password, or use other account-related auth flows.",
		where:
			"First-party cookies issued through Better Auth on `shipping.apidojo.app` and, if enabled later, an explicitly configured subdomain cookie scope.",
	},
];

export const serverRecordItems: StorageDisclosureItem[] = [
	{
		name: "Account, session, and verification records",
		purpose:
			"Create and secure user accounts, keep sessions active, and support password-reset or magic-link verification flows.",
		required: "Yes for signed-in features.",
		retention:
			"While the account remains active, plus a limited period where needed for security, abuse prevention, or legal compliance.",
		when: "When you sign up, sign in, reset a password, or use magic-link flows.",
		where:
			"Hosted database records for `user`, `session`, `account`, and `verification`.",
	},
	{
		name: "Signed-in progress and merge-event records",
		purpose:
			"Persist progress across sessions and devices and record how anonymous local progress was merged into an account.",
		required: "Yes for server-backed progress.",
		retention:
			"While the account remains active, subject to deletion-request handling and operational exceptions.",
		when: "When a signed-in user syncs progress or when anonymous local progress is merged into an account.",
		where:
			"Hosted database records for `user_progress` and `progress_merge_events`.",
	},
	{
		name: "Subscriptions, entitlements, and billing events",
		purpose:
			"Reflect plan status, enable or disable paid capabilities, and keep an audit trail for billing operations.",
		required: "Yes for paid features.",
		retention:
			"As needed for contract performance, accounting, tax, fraud prevention, disputes, and legal obligations.",
		when: "When Creem reports subscription or billing webhook events, or when account entitlements are updated.",
		where:
			"Hosted database records for `subscriptions`, `user_entitlements`, and `billing_events`.",
	},
	{
		name: "Transactional email event records",
		purpose:
			"Track delivery, bounce, complaint, and suppression events so account and billing email can be operated safely.",
		required: "Yes for transactional email operations.",
		retention:
			"As needed to troubleshoot delivery, maintain suppression safety, and respond to abuse or support issues.",
		when: "When Resend reports tracked webhook events for transactional email we send.",
		where: "Hosted database records for `email_events`.",
	},
];

export const retentionSummaryItems: RetentionSummaryItem[] = [
	{
		category: "Anonymous browser progress",
		retention:
			"Stored in your browser until you clear it, reset/import over it, or the browser removes it.",
		notes: [
			"No server-side account is required for this data.",
			"You can clear it immediately through browser storage controls or the settings reset action.",
		],
	},
	{
		category: "Signed-in account and progress data",
		retention:
			"Kept while the account is active and while the service needs it to provide account features.",
		notes: [
			"Deletion requests are handled manually in this phase so we can review linked progress, auth, billing, and support records together.",
			"Some minimal security or backup traces may persist temporarily after a request while scheduled cleanup completes.",
		],
	},
	{
		category: "Billing, subscription, and dispute records",
		retention:
			"Kept as long as needed for accounting, tax, fraud prevention, contractual record-keeping, or dispute handling.",
		notes: [
			"These records are not all immediately erasable on request.",
			"Where deletion is restricted, we will explain the legal or operational basis for retaining the record.",
		],
	},
	{
		category: "Transactional email delivery records",
		retention:
			"Kept as long as needed to operate email safely, investigate delivery problems, and maintain suppression hygiene.",
		notes: [
			"Bounce and complaint records may be retained even if other account data is removed.",
			"This helps prevent repeated delivery attempts to unsafe or unavailable destinations.",
		],
	},
];
