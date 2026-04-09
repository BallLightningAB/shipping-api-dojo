import { ScenarioPlayer } from "@/components/arena/ScenarioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getArenaScenarioCards,
	getRouteSeed,
	getScenarioProgressKey,
	getScenarioRuntimeById,
} from "@/content/runtime";
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
import { CheckCircle, Circle } from "lucide-react";
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
	loader: ({ deps }) => {
		const seed = getRouteSeed("arena:index", deps.seed);

		return {
			cards: getArenaScenarioCards(seed),
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
	const { cards } = Route.useLoaderData();
	const search = Route.useSearch();
	const activeScenario =
		search.scenario && search.runSeed
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
		if (!search.scenario) {
			return;
		}

		navigate({
			search: (prev) => ({
				...prev,
				runSeed: makeClientSeed(`arena:${search.scenario}`),
			}),
		});
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Incident Arena</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Realistic carrier integration incidents. Make decisions, get feedback,
				and build troubleshooting instincts.
			</p>

			{activeScenario ? (
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
						<button
							className="text-sm text-muted-foreground hover:text-foreground"
							onClick={handleRerollScenario}
							type="button"
						>
							New Scenario Run
						</button>
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
			) : (
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
					{cards.map((scenario) => (
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
					))}
				</div>
			)}
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
