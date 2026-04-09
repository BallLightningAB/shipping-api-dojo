/**
 * Orchestrates drill display/scoring by type.
 */

import type { Drill } from "@/content/types";
import { BuilderDrill } from "./BuilderDrill";
import { ClozeDrill } from "./ClozeDrill";
import { McqDrill } from "./McqDrill";

interface DrillRunnerProps {
	drill: Drill;
	onComplete: (drillId: string, score: number) => void;
}

export function DrillRunner({ drill, onComplete }: DrillRunnerProps) {
	function handleComplete(score: number) {
		onComplete(drill.progressKey ?? drill.familyId ?? drill.id, score);
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
