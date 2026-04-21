import { ScenarioPlayer } from "@/components/arena/ScenarioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getArenaScenarioCards,
	getScenarioProgressKey,
} from "@/content/runtime";
import type { Scenario } from "@/content/types";
import { requiresPremiumScenarioDepth } from "@/lib/entitlements/access-policy";
import type { ArenaScenarioCard } from "@/lib/practice/practice-runs";
import {
	createArenaCardsRun,
	createArenaScenarioRun,
	getArenaPracticeRouteData,
} from "@/lib/practice/practice-runs.sync";
import { arenaPracticeSearchSchema } from "@/lib/practice/seed-search";
import { useStripLegacySeedParams } from "@/lib/practice/use-strip-legacy-seed-params";
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
import { useEffect, useState } from "react";

export const Route = createFileRoute("/arena/")({
	validateSearch: arenaPracticeSearchSchema,
	loaderDeps: ({ search }) => ({
		scenario: search.scenario,
	}),
	loader: ({ deps }) =>
		getArenaPracticeRouteData({ data: { scenario: deps.scenario } }),
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
	useStripLegacySeedParams();

	const navigate = useNavigate({ from: "/arena/" });
	const {
		activeScenario: loadedActiveScenario,
		activeScenarioLocked,
		canRerollScenarioRuns,
		cards,
		usesServerSeed,
	} = Route.useLoaderData();
	const [currentCards, setCurrentCards] = useState(cards);
	const [currentActiveScenario, setCurrentActiveScenario] =
		useState<Scenario | null>(loadedActiveScenario);
	const [rerollNonce, setRerollNonce] = useState(0);
	const search = Route.useSearch();
	const activeCard = search.scenario
		? currentCards.find((card) => card.id === search.scenario)
		: null;

	useEffect(() => {
		setCurrentCards(cards);
		setCurrentActiveScenario(loadedActiveScenario);
		setRerollNonce((nonce) => nonce + 1);
	}, [cards, loadedActiveScenario]);

	async function handleShuffleScenarios() {
		if (canRerollScenarioRuns) {
			const run = await createArenaCardsRun({ data: {} });
			setCurrentCards(run.cards);
			setCurrentActiveScenario(null);
			setRerollNonce((nonce) => nonce + 1);
			navigate({
				search: () => ({
					scenario: undefined,
				}),
			});
			return;
		}

		if (usesServerSeed) {
			return;
		}

		setCurrentCards((prev) => overlayArenaCardAccess(prev));
		setCurrentActiveScenario(null);
		setRerollNonce((nonce) => nonce + 1);
	}

	function handleOpenScenario(scenarioId: string) {
		navigate({
			search: () => ({
				scenario: scenarioId,
			}),
		});
	}

	function handleBackToScenarios() {
		navigate({
			search: () => ({
				scenario: undefined,
			}),
		});
	}

	async function handleRerollScenario() {
		if (!(search.scenario && canRerollScenarioRuns)) {
			return;
		}

		const run = await createArenaScenarioRun({
			data: {
				scenarioId: search.scenario,
			},
		});
		setCurrentActiveScenario(run.activeScenario);
		setRerollNonce((nonce) => nonce + 1);
	}

	let arenaContent: React.ReactNode;

	if (currentActiveScenario) {
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
					<h2 className="text-2xl">{currentActiveScenario.title}</h2>
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
						key={`${currentActiveScenario.id}:${rerollNonce}`}
						onComplete={() =>
							completeScenario(getScenarioProgressKey(currentActiveScenario))
						}
						scenario={currentActiveScenario}
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
					{canRerollScenarioRuns || !usesServerSeed ? (
						<button
							className="text-sm text-muted-foreground hover:text-foreground"
							onClick={handleShuffleScenarios}
							type="button"
						>
							Shuffle Scenario Order
						</button>
					) : (
						<a
							className="text-sm text-muted-foreground hover:text-foreground"
							href="/settings#paid-access"
						>
							Unlock Scenario Shuffles (Pro)
						</a>
					)}
				</div>
				{currentCards.map((scenario) =>
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

function overlayArenaCardAccess(cards: ArenaScenarioCard[]) {
	const accessById = new Map(
		cards.map((card) => [
			card.id,
			{
				isLocked: card.isLocked,
				requiresPremiumDepth: card.requiresPremiumDepth,
			},
		])
	);

	return getArenaScenarioCards(makeClientSeed("arena:index")).map((card) => ({
		...card,
		isLocked: accessById.get(card.id)?.isLocked ?? false,
		requiresPremiumDepth:
			accessById.get(card.id)?.requiresPremiumDepth ??
			requiresPremiumScenarioDepth(card.ladderLevel),
	}));
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
