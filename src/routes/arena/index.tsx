import { ScenarioPlayer } from "@/components/arena/ScenarioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getArenaScenarioCards,
	getRouteSeed,
	getScenarioProgressKey,
	getScenarioRuntimeById,
} from "@/content/runtime";
import {
	canAccessScenarioRun,
	canUseScenarioReroll,
	fallbackFreeEntitlements,
	requiresPremiumScenarioDepth,
} from "@/lib/entitlements/access-policy";
import { getCurrentEntitlements } from "@/lib/entitlements/entitlements.sync";
import { completeScenario } from "@/lib/progress/progress.actions";
import { progressStore } from "@/lib/progress/progress.store";
import { makeClientSeed } from "@/lib/randomization";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	ClientOnly,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/arena/")({
	validateSearch: z.object({
		runSeed: z.coerce.number().int().positive().optional(),
		scenario: z.string().optional(),
		seed: z.coerce.number().int().positive().optional(),
	}),
	loaderDeps: ({ search }) => ({
		seed: search.seed,
	}),
	loader: async ({ deps }) => {
		const seed = getRouteSeed("arena:index", deps.seed);
		let capabilities = fallbackFreeEntitlements().capabilities;
		try {
			const entitlements = await getCurrentEntitlements();
			capabilities = entitlements.capabilities;
		} catch (error) {
			console.error("Failed to resolve arena entitlements", error);
		}

		return {
			cards: getArenaScenarioCards(seed).map((card) => ({
				...card,
				isLocked: !canAccessScenarioRun(capabilities, card.ladderLevel),
				requiresPremiumDepth: requiresPremiumScenarioDepth(card.ladderLevel),
			})),
			canRerollScenarioRuns: canUseScenarioReroll(capabilities),
			seed,
		};
	},
	head: () => {
		const title = "Shipping Incident Practice";
		const description =
			"Practice realistic shipping and carrier integration incidents: timeouts, rate limits, SOAP faults, and silent failures.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/arena",
					image: "/og-arena.png",
					imageAlt:
						"Incident Arena preview with carrier troubleshooting scenarios and decision steps.",
					type: "website",
				}),
			],
			links: [generateCanonical("/arena")],
		};
	},
	component: ArenaPage,
});

function ArenaPage() {
	const navigate = useNavigate({ from: "/arena/" });
	const { canRerollScenarioRuns, cards } = Route.useLoaderData();
	const search = Route.useSearch();
	const activeCard = search.scenario
		? cards.find((card) => card.id === search.scenario)
		: null;
	const activeScenarioLocked = Boolean(activeCard?.isLocked);
	const activeScenario =
		search.scenario && search.runSeed && !activeScenarioLocked
			? getScenarioRuntimeById(search.scenario, search.runSeed)
			: null;

	function handleShuffleScenarios() {
		navigate({
			search: (prev) => ({
				...prev,
				seed: makeClientSeed("arena:index"),
				scenario: undefined,
				runSeed: undefined,
			}),
		});
	}

	function handleOpenScenario(scenarioId: string) {
		navigate({
			search: (prev) => ({
				...prev,
				runSeed: makeClientSeed(`arena:${scenarioId}`),
				scenario: scenarioId,
			}),
		});
	}

	function handleBackToScenarios() {
		navigate({
			search: (prev) => ({
				...prev,
				runSeed: undefined,
				scenario: undefined,
			}),
		});
	}

	function handleRerollScenario() {
		if (!(search.scenario && canRerollScenarioRuns)) {
			return;
		}

		navigate({
			search: (prev) => ({
				...prev,
				runSeed: makeClientSeed(`arena:${search.scenario}`),
			}),
		});
	}

	let arenaContent: React.ReactNode;

	if (activeScenario) {
		arenaContent = (
			<div>
				<button
					className="mb-6 text-sm text-muted-foreground hover:text-foreground"
					onClick={handleBackToScenarios}
					type="button"
				>
					&larr; Back to scenarios
				</button>
				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-2xl">{activeScenario.title}</h2>
					{canRerollScenarioRuns ? (
						<button
							className="text-sm text-muted-foreground hover:text-foreground"
							onClick={handleRerollScenario}
							type="button"
						>
							New Scenario Run
						</button>
					) : (
						<a
							className="text-sm text-muted-foreground hover:text-foreground"
							href="/settings#paid-access"
						>
							Unlock New Scenario Runs (Pro)
						</a>
					)}
				</div>
				<ClientOnly
					fallback={<p className="text-muted-foreground">Loading...</p>}
				>
					<ScenarioPlayer
						key={`${activeScenario.id}:${activeScenario.runSeed ?? "legacy"}`}
						onComplete={() =>
							completeScenario(getScenarioProgressKey(activeScenario))
						}
						scenario={activeScenario}
					/>
				</ClientOnly>
			</div>
		);
	} else if (activeScenarioLocked) {
		arenaContent = (
			<div className="space-y-5 rounded-lg border border-border p-6">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Lock className="h-4 w-4" />
					<span>Advanced Scenario Depth (Pro)</span>
				</div>
				<h2 className="text-2xl">{activeCard?.title ?? "Locked Scenario"}</h2>
				<p className="text-muted-foreground">
					This advanced scenario ladder is locked on Free. Public learning
					content stays available, and Pro unlocks deeper review-mode incident
					runs.
				</p>
				<div className="flex flex-wrap gap-3">
					<a
						className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
						href="/settings#paid-access"
					>
						View Paid Access Options
					</a>
					<button
						className="text-sm text-muted-foreground hover:text-foreground"
						onClick={handleBackToScenarios}
						type="button"
					>
						Back to scenarios
					</button>
				</div>
			</div>
		);
	} else {
		arenaContent = (
			<div className="space-y-4">
				<div className="flex justify-end">
					<button
						className="text-sm text-muted-foreground hover:text-foreground"
						onClick={handleShuffleScenarios}
						type="button"
					>
						Shuffle Scenario Order
					</button>
				</div>
				{cards.map((scenario) =>
					scenario.isLocked ? (
						<Card className="border-border/70 bg-muted/30" key={scenario.id}>
							<CardHeader className="flex flex-row items-center gap-4">
								<div className="flex-1">
									<div className="mb-1 flex items-center gap-2">
										<CardTitle className="text-base font-semibold">
											{scenario.title}
										</CardTitle>
										<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											{scenario.difficulty}
										</span>
										{scenario.requiresPremiumDepth && (
											<span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
												Pro
											</span>
										)}
									</div>
								</div>
								<Lock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-muted-foreground">
									{scenario.summary}
								</p>
								<a
									className="inline-flex items-center text-sm text-bl-red hover:underline"
									href="/settings#paid-access"
								>
									Unlock advanced scenario depth
								</a>
							</CardContent>
						</Card>
					) : (
						<button
							className="w-full text-left"
							key={scenario.id}
							onClick={() => handleOpenScenario(scenario.id)}
							type="button"
						>
							<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
								<CardHeader className="flex flex-row items-center gap-4">
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<CardTitle className="text-base font-semibold group-hover:text-bl-red">
												{scenario.title}
											</CardTitle>
											<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
												{scenario.difficulty}
											</span>
										</div>
									</div>
									<ClientOnly fallback={null}>
										<ScenarioStatus
											scenarioId={getScenarioProgressKey(scenario)}
										/>
									</ClientOnly>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{scenario.summary}
									</p>
								</CardContent>
							</Card>
						</button>
					)
				)}
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Incident Arena</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Realistic carrier integration incidents. Make decisions, get feedback,
				and build troubleshooting instincts.
			</p>
			{arenaContent}
		</div>
	);
}

function ScenarioStatus({ scenarioId }: { scenarioId: string }) {
	const completed = useStore(progressStore, (s) =>
		s.scenariosCompleted.includes(scenarioId)
	);

	if (completed) {
		return <CheckCircle className="h-5 w-5 text-green-400" />;
	}
	return <Circle className="h-5 w-5 text-muted-foreground/40" />;
}
