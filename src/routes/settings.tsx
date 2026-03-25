import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Download, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getCurrentEntitlements } from "@/lib/entitlements/entitlements.sync";
import { resetProgress } from "@/lib/progress/progress.actions";
import { parseProgress } from "@/lib/progress/progress.schema";
import { saveProgress } from "@/lib/progress/progress.storage";
import { progressStore } from "@/lib/progress/progress.store";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/settings")({
	head: () => ({
		meta: [
			...generateMeta({
				title: "Settings",
				description:
					"Manage local Shipping API Dojo progress data for export, import, and reset actions.",
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
				Export, import, or reset your progress data. All data is stored locally
				in your browser.
			</p>

			<ClientOnly
				fallback={<p className="text-muted-foreground">Loading settings...</p>}
			>
				<SettingsPanel />
			</ClientOnly>
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
	const [entitlementDebug, setEntitlementDebug] = useState<{
		capabilities: string[];
		source: string;
		tier: string;
	} | null>(null);

	useEffect(() => {
		if (!import.meta.env.DEV) {
			return;
		}

		getCurrentEntitlements()
			.then((entitlements) => {
				setEntitlementDebug(entitlements);
			})
			.catch((error: unknown) => {
				console.error("Failed to load entitlement debug info", error);
			});
	}, []);

	const completedLessons = Object.values(lessonsProgress).filter(
		(l) => l.completed
	).length;

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
		// biome-ignore lint: simple UX for MVP reset
		if (window.confirm("Are you sure? This will erase all your progress.")) {
			resetProgress();
			setImportStatus("Progress reset.");
		}
	}

	return (
		<div className="space-y-8">
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

			{import.meta.env.DEV && entitlementDebug && (
				<div className="space-y-3 rounded-lg border border-border p-4">
					<h2 className="text-xl">Entitlement Debug</h2>
					<p className="text-sm text-muted-foreground">
						User: {session.data?.user?.email ?? "anonymous"}
					</p>
					<p className="text-sm text-muted-foreground">
						Tier: {entitlementDebug.tier} ({entitlementDebug.source})
					</p>
					<pre className="overflow-auto rounded bg-muted p-3 text-xs">
						{JSON.stringify(entitlementDebug.capabilities, null, 2)}
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
