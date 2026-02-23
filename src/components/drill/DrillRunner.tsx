/**
 * Orchestrates drill display/scoring by type.
 */

import type { Drill } from "@/content/types";
import { McqDrill } from "./McqDrill";
import { ClozeDrill } from "./ClozeDrill";
import { BuilderDrill } from "./BuilderDrill";

interface DrillRunnerProps {
	drill: Drill;
	onComplete: (drillId: string, score: number) => void;
}

export function DrillRunner({ drill, onComplete }: DrillRunnerProps) {
	function handleComplete(score: number) {
		onComplete(drill.id, score);
	}

	switch (drill.type) {
		case "mcq":
			return <McqDrill drill={drill} onComplete={handleComplete} />;
		case "cloze":
			return <ClozeDrill drill={drill} onComplete={handleComplete} />;
		case "builder.rest":
		case "builder.soap":
			return <BuilderDrill drill={drill} onComplete={handleComplete} />;
		default:
			return <p className="text-muted-foreground">Unknown drill type.</p>;
	}
}
