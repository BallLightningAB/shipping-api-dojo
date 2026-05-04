import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	retentionSummaryItems,
	SUPPORT_CONTACT_LABEL,
	SUPPORT_EMAIL,
} from "@/content/legal";
import { getAccountPrivacyExport } from "@/lib/account/account-rights.sync";
import { authClient } from "@/lib/auth/client";
import { fallbackFreeEntitlements } from "@/lib/entitlements/access-policy";
import { getCurrentEntitlements } from "@/lib/entitlements/entitlements.sync";
import { captureException } from "@/lib/observability/logger";
import { resetProgress } from "@/lib/progress/progress.actions";
import { parseProgress } from "@/lib/progress/progress.schema";
import { saveProgress } from "@/lib/progress/progress.storage";
import { progressStore } from "@/lib/progress/progress.store";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	ClientOnly,
	createFileRoute,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Download, LogOut, Mail, Trash2, Upload } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/settings")({
	head: () => ({
		meta: [
			...generateMeta({
				title: "Settings",
				description:
					"Manage Shipping API Dojo progress, privacy links, and account-related support surfaces.",
				url: "/settings",
			}),
			{
				name: "robots",
				content: "noindex, nofollow",
			},
		],
		links: [generateCanonical("/settings")],
	}),
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Settings</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Manage anonymous browser progress, review how signed-in account data is
				handled, and reach the current privacy and support surfaces for Shipping
				API Dojo.
			</p>

			<ClientOnly fallback={<SettingsFallback />}>
				<SettingsPanel />
			</ClientOnly>
		</div>
	);
}

function buildSupportMailto() {
	return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		"Shipping API Dojo support request"
	)}`;
}

function getMagicLinkFailureStatus(error: unknown) {
	const message = error instanceof Error ? error.message.toLowerCase() : "";

	if (message.includes("rate") || message.includes("429")) {
		return "Too many sign-in link requests. Wait a few minutes and try again.";
	}

	if (message.includes("invalid") && message.includes("email")) {
		return "Enter a valid email address to receive a sign-in link.";
	}

	if (message.includes("network") || message.includes("fetch")) {
		return "Network error while sending the sign-in link. Check your connection and try again.";
	}

	return "Could not send a sign-in link. Contact support if it persists.";
}

function buildDeletionMailto(accountEmail = "") {
	const body = accountEmail
		? `&body=${encodeURIComponent(
				`Please review my Shipping API Dojo deletion request.\n\nAccount email: ${accountEmail}\nRequest details: `
			)}`
		: "";

	return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		"Shipping API Dojo deletion request"
	)}${body}`;
}

function CurrentStorageModelCard({
	isSignedIn = false,
}: {
	isSignedIn?: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Current storage model</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				{isSignedIn ? (
					<>
						<p>
							Anonymous progress can still exist in this browser, but your
							account also uses hosted auth/session records and server-backed
							progress sync while you are signed in.
						</p>
						<p>
							Billing, entitlement, and transactional email records can also be
							associated with your account when those features are used.
						</p>
					</>
				) : (
					<>
						<p>
							You are currently using the anonymous mode. Progress stays in this
							browser unless you later choose to sign in and sync it into an
							account.
						</p>
						<p>
							Sign-in features rely on necessary account/session cookies and
							hosted records. They are described in the public legal pages
							below.
						</p>
					</>
				)}
			</CardContent>
		</Card>
	);
}

function PrivacySupportCard({ supportMailto }: { supportMailto: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Privacy and support</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<p>
					Use the public legal pages to review the current privacy policy and
					cookie/storage disclosure before you use account features.
				</p>
				<p>
					For support, access, or deletion questions, contact{" "}
					<a className="text-bl-red hover:underline" href={supportMailto}>
						{SUPPORT_CONTACT_LABEL}
					</a>
					.
				</p>
				<div className="flex flex-wrap gap-3 pt-1">
					<Button asChild size="sm" variant="outline">
						<Link to="/privacy">Privacy Policy</Link>
					</Button>
					<Button asChild size="sm" variant="outline">
						<Link to="/cookies">Cookie &amp; Storage</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function PlansAndAccessSection({
	activeTier,
	entitlementSource,
	hasPaidTier = false,
}: {
	activeTier: string;
	entitlementSource: string;
	hasPaidTier?: boolean;
}) {
	return (
		<div className="space-y-4" id="entitlement-status">
			<h2 className="text-xl">Entitlement Status</h2>
			<p className="max-w-3xl text-sm text-muted-foreground">
				Settings shows the account entitlement state detected for this session.
				Public plan details and purchase CTAs live on the crawlable plans page.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Current entitlement state</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>
						Current tier:{" "}
						<strong className="text-foreground">{activeTier}</strong>
					</p>
					<p>
						Source:{" "}
						<strong className="text-foreground">{entitlementSource}</strong>
					</p>
					{hasPaidTier ? (
						<p>
							Your account has paid-tier access enabled. Premium challenge
							surfaces should be unlocked across lessons and arena.
						</p>
					) : (
						<p>
							No active paid entitlement is detected. Missing, inactive, or
							canceled subscriptions safely remain on Free access until a paid
							entitlement becomes active.
						</p>
					)}
					<Button asChild size="sm" variant="outline">
						<Link to="/plans">View public plans</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function AccountAccessCard({
	isPending,
	userEmail,
}: {
	isPending: boolean;
	userEmail?: string | null;
}) {
	const navigate = useNavigate();
	const isMountedRef = useRef(true);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedEmail = email.trim();
		if (!normalizedEmail) {
			setStatus("Enter an email address to receive a sign-in link.");
			return;
		}

		setStatus(null);
		setIsSubmitting(true);
		try {
			await authClient.signIn.magicLink({
				callbackURL: "/settings",
				email: normalizedEmail,
				newUserCallbackURL: "/settings",
			});
			if (!isMountedRef.current) {
				return;
			}
			navigate({ replace: true, to: "/settings" });
			setEmail("");
			setStatus("Check your email for the Shipping API Dojo sign-in link.");
		} catch (error) {
			if (!isMountedRef.current) {
				return;
			}
			setStatus(getMagicLinkFailureStatus(error));
		} finally {
			if (isMountedRef.current) {
				setIsSubmitting(false);
			}
		}
	}

	async function handleSignOut() {
		setStatus(null);
		setIsSubmitting(true);
		try {
			await authClient.signOut();
			if (!isMountedRef.current) {
				return;
			}
			navigate({ replace: true, to: "/" });
		} catch {
			if (isMountedRef.current) {
				setStatus("Could not sign out. Refresh and try again.");
				setIsSubmitting(false);
			}
		}
	}

	let accountContent = <p>Checking account session...</p>;

	if (!(isPending || !userEmail)) {
		accountContent = (
			<>
				<p>
					Signed in as <strong className="text-foreground">{userEmail}</strong>.
				</p>
				<Button
					className="gap-2"
					disabled={isSubmitting}
					onClick={handleSignOut}
					variant="outline"
				>
					<LogOut className="h-4 w-4" />
					Sign out
				</Button>
			</>
		);
	} else if (!isPending) {
		accountContent = (
			<form className="space-y-3" onSubmit={handleMagicLink}>
				<p>
					Sign in or create an account to sync progress and connect any Pro
					entitlement reported by Creem.
				</p>
				<div className="space-y-2">
					<Label htmlFor="account-email">Email address</Label>
					<Input
						id="account-email"
						onChange={(event) => setEmail(event.target.value)}
						placeholder="you@example.com"
						type="email"
						value={email}
					/>
				</div>
				<Button className="gap-2" disabled={isSubmitting} type="submit">
					<Mail className="h-4 w-4" />
					{isSubmitting ? "Sending..." : "Send sign-in link"}
				</Button>
			</form>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Account access</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-muted-foreground">
				{accountContent}
				{status && <p>{status}</p>}
			</CardContent>
		</Card>
	);
}

function AccountAccessFallbackCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Account access</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<p>
					Sign-in controls load in the browser so account sessions and
					magic-link requests stay client-side.
				</p>
				<p>
					Use the visible Sign in action in the header or refresh if the account
					form does not appear.
				</p>
			</CardContent>
		</Card>
	);
}

function AccountDataRightsSection({
	accountExportStatus,
	deletionMailto,
	isExportingAccount = false,
	isSignedIn,
	onAccountExport,
	supportMailto,
}: {
	accountExportStatus?: string | null;
	deletionMailto: string;
	isExportingAccount?: boolean;
	isSignedIn: boolean;
	onAccountExport?: () => void;
	supportMailto: string;
}) {
	return (
		<div className="space-y-4">
			<h2 className="text-xl">Account Data Rights</h2>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Access and export</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						{isSignedIn && onAccountExport ? (
							<>
								<p>
									Export a structured copy of your signed-in account data,
									server-backed progress, subscription summaries, billing-event
									metadata, email-event metadata, and merge-event history.
								</p>
								<p>
									The local export above only covers browser progress. This
									export covers the hosted records tied to your signed-in
									account.
								</p>
								<Button
									className="gap-2"
									disabled={isExportingAccount}
									onClick={onAccountExport}
									variant="outline"
								>
									<Download className="h-4 w-4" />
									{isExportingAccount
										? "Preparing export..."
										: "Export Account Data"}
								</Button>
							</>
						) : (
							<p>
								Self-serve account export becomes available when you are signed
								in. Anonymous mode still lets you export the browser-only
								progress file shown above.
							</p>
						)}

						{accountExportStatus && (
							<p className="text-sm text-muted-foreground">
								{accountExportStatus}
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Deletion requests</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							Account deletion is currently handled as a manual support request,
							not an irreversible one-click action.
						</p>
						<p>
							This is intentional because linked data can span auth, progress,
							subscriptions, billing events, email-event records, and retention
							exceptions for legal, accounting, fraud, or abuse-prevention
							reasons.
						</p>
						<a className="text-bl-red hover:underline" href={deletionMailto}>
							Email a deletion request
						</a>
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Support contact</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							Use {SUPPORT_CONTACT_LABEL} for access requests, deletion
							questions, corrections, or retention clarifications.
						</p>
						<a className="text-bl-red hover:underline" href={supportMailto}>
							Email {SUPPORT_EMAIL}
						</a>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Retention summary</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3 text-sm text-muted-foreground">
							{retentionSummaryItems.map((item) => (
								<li key={item.category}>
									<p className="font-semibold text-foreground">
										{item.category}
									</p>
									<p>{item.retention}</p>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function SettingsFallback() {
	const supportMailto = buildSupportMailto();
	const deletionMailto = buildDeletionMailto();

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2">
				<AccountAccessFallbackCard />
				<CurrentStorageModelCard />
				<PrivacySupportCard supportMailto={supportMailto} />
			</div>

			<PlansAndAccessSection
				activeTier="free"
				entitlementSource="browser_pending"
			/>

			<AccountDataRightsSection
				deletionMailto={deletionMailto}
				isSignedIn={false}
				supportMailto={supportMailto}
			/>
		</div>
	);
}

function SettingsPanel() {
	const session = authClient.useSession();
	const xp = useStore(progressStore, (s) => s.xp);
	const streak = useStore(progressStore, (s) => s.streak);
	const lessonsProgress = useStore(progressStore, (s) => s.lessons);
	const scenariosCompleted = useStore(
		progressStore,
		(s) => s.scenariosCompleted
	);
	const [importStatus, setImportStatus] = useState<string | null>(null);
	const [accountExportStatus, setAccountExportStatus] = useState<string | null>(
		null
	);
	const [isExportingAccount, setIsExportingAccount] = useState(false);
	const [currentEntitlements, setCurrentEntitlements] = useState<{
		capabilities: string[];
		source: string;
		tier: string;
	} | null>(null);
	const supportMailto = buildSupportMailto();
	const deletionMailto = buildDeletionMailto(session.data?.user?.email);
	const debugSessionKey = session.isPending
		? "pending"
		: (session.data?.user?.id ?? "anonymous");

	useEffect(() => {
		if (debugSessionKey === "pending") {
			return;
		}

		getCurrentEntitlements()
			.then((entitlements) => {
				setCurrentEntitlements(entitlements);
			})
			.catch((error: unknown) => {
				captureException(error, {
					fallbackTier: "free",
					operation: "resolve_entitlements",
					route: "/settings",
				});
				setCurrentEntitlements(fallbackFreeEntitlements());
			});
	}, [debugSessionKey]);

	const completedLessons = Object.values(lessonsProgress).filter(
		(l) => l.completed
	).length;
	const activeTier = currentEntitlements?.tier ?? "free";
	const hasPaidTier = activeTier === "pro" || activeTier === "enterprise";

	function handleExport() {
		const data = progressStore.state;
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "shipping-api-dojo-progress.json";
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				return;
			}
			const reader = new FileReader();
			reader.onload = (ev) => {
				try {
					const raw = JSON.parse(ev.target?.result as string);
					const parsed = parseProgress(raw);
					progressStore.setState(() => parsed);
					saveProgress(parsed);
					setImportStatus("Progress imported successfully.");
				} catch {
					setImportStatus("Invalid file format.");
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	function handleReset() {
		// biome-ignore lint/suspicious/noAlert: intentional MVP confirmation before destructive local progress reset.
		if (window.confirm("Are you sure? This will erase all your progress.")) {
			resetProgress();
			setImportStatus("Progress reset.");
		}
	}

	async function handleAccountExport() {
		setAccountExportStatus(null);
		setIsExportingAccount(true);

		try {
			const exportData = await getAccountPrivacyExport();
			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `shipping-api-dojo-account-export-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setAccountExportStatus("Account export downloaded.");
		} catch (error) {
			captureException(error, {
				operation: "account_privacy_export",
				route: "/settings",
			});
			setAccountExportStatus(
				"Could not export account data. Contact support if the problem persists."
			);
		} finally {
			setIsExportingAccount(false);
		}
	}

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2">
				<AccountAccessCard
					isPending={session.isPending}
					userEmail={session.data?.user?.email}
				/>
				<CurrentStorageModelCard isSignedIn={Boolean(session.data?.user?.id)} />
				<PrivacySupportCard supportMailto={supportMailto} />
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-4">
				<StatCard label="XP" value={String(xp)} />
				<StatCard label="Streak" value={`${streak}d`} />
				<StatCard label="Lessons" value={String(completedLessons)} />
				<StatCard label="Scenarios" value={String(scenariosCompleted.length)} />
			</div>

			{/* Actions */}
			<div className="space-y-4">
				<h2 className="text-xl">Data Management</h2>

				<div className="flex flex-wrap gap-3">
					<Button className="gap-2" onClick={handleExport} variant="outline">
						<Download className="h-4 w-4" />
						Export Progress
					</Button>
					<Button className="gap-2" onClick={handleImport} variant="outline">
						<Upload className="h-4 w-4" />
						Import Progress
					</Button>
					<Button className="gap-2" onClick={handleReset} variant="destructive">
						<Trash2 className="h-4 w-4" />
						Reset All Progress
					</Button>
				</div>

				{importStatus && (
					<p className="text-sm text-muted-foreground">{importStatus}</p>
				)}
			</div>

			<PlansAndAccessSection
				activeTier={activeTier}
				entitlementSource={currentEntitlements?.source ?? "fallback_free"}
				hasPaidTier={hasPaidTier}
			/>

			<AccountDataRightsSection
				accountExportStatus={accountExportStatus}
				deletionMailto={deletionMailto}
				isExportingAccount={isExportingAccount}
				isSignedIn={Boolean(session.data?.user?.id)}
				onAccountExport={handleAccountExport}
				supportMailto={supportMailto}
			/>

			{import.meta.env.DEV && currentEntitlements && (
				<div className="space-y-3 rounded-lg border border-border p-4">
					<h2 className="text-xl">Entitlement Debug</h2>
					<p className="text-sm text-muted-foreground">
						User: {session.data?.user?.email ?? "anonymous"}
					</p>
					<p className="text-sm text-muted-foreground">
						Tier: {currentEntitlements.tier} ({currentEntitlements.source})
					</p>
					<pre className="overflow-auto rounded bg-muted p-3 text-xs">
						{JSON.stringify(currentEntitlements.capabilities, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border p-4 text-center">
			<p className="font-mono text-2xl font-bold text-bl-red">{value}</p>
			<p className="mt-1 text-sm text-muted-foreground">{label}</p>
		</div>
	);
}
