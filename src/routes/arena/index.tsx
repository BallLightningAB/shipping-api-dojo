import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { ScenarioPlayer } from "@/components/arena/ScenarioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scenarios } from "@/content/scenarios";
import { completeScenario } from "@/lib/progress/progress.actions";
import { progressStore } from "@/lib/progress/progress.store";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/arena/")({
	head: () => {
		const title = "Incident Arena";
		const description =
			"Practice realistic carrier integration incidents: timeouts, rate limits, SOAP faults, and silent failures.";

		return {
			meta: [
				{ title: `${title} | Shipping API Dojo` },
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
	const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
	const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

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
						onClick={() => setActiveScenarioId(null)}
						type="button"
					>
						&larr; Back to scenarios
					</button>
					<h2 className="mb-6 text-2xl">{activeScenario.title}</h2>
					<ClientOnly
						fallback={<p className="text-muted-foreground">Loading...</p>}
					>
						<ScenarioPlayer
							onComplete={() => completeScenario(activeScenario.id)}
							scenario={activeScenario}
						/>
					</ClientOnly>
				</div>
			) : (
				<div className="space-y-4">
					{scenarios.map((scenario) => (
						<button
							className="w-full text-left"
							key={scenario.id}
							onClick={() => setActiveScenarioId(scenario.id)}
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
										<ScenarioStatus scenarioId={scenario.id} />
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
