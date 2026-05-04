/**
 * Decision-tree scenario player for the Incident Arena.
 */

import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Scenario, ScenarioStep } from "@/content/types";

interface ScenarioPlayerProps {
	scenario: Scenario;
	onComplete: () => void;
}

export function ScenarioPlayer({ scenario, onComplete }: ScenarioPlayerProps) {
	const [currentStepId, setCurrentStepId] = useState("start");
	const [feedback, setFeedback] = useState<{
		text: string;
		isCorrect: boolean;
	} | null>(null);
	const [completed, setCompleted] = useState(false);
	const [history, setHistory] = useState<string[]>([]);

	const currentStep = scenario.steps.find(
		(s: ScenarioStep) => s.id === currentStepId
	);

	function handleChoice(
		nextStepId: string | null,
		choiceFeedback: string,
		isCorrect: boolean
	) {
		setFeedback({ text: choiceFeedback, isCorrect });
		setHistory((prev) => [...prev, currentStepId]);

		if (!nextStepId) {
			setCompleted(true);
			if (isCorrect) {
				onComplete();
			}
		} else {
			setTimeout(() => {
				setCurrentStepId(nextStepId);
				setFeedback(null);
			}, 2000);
		}
	}

	function handleRestart() {
		setCurrentStepId("start");
		setFeedback(null);
		setCompleted(false);
		setHistory([]);
	}

	if (!currentStep) {
		return <p className="text-muted-foreground">Scenario step not found.</p>;
	}

	return (
		<div className="space-y-6">
			{/* Progress indicator */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>
					Step {history.length + 1} of ~{scenario.steps.length}
				</span>
				<span className="text-xs">({scenario.difficulty})</span>
			</div>

			{/* Scenario text */}
			<div className="rounded-lg border border-border bg-muted/30 p-4">
				<p className="whitespace-pre-line text-foreground leading-relaxed">
					{currentStep.text}
				</p>
			</div>

			{/* Choices */}
			{feedback === null && !completed && (
				<div className="space-y-2">
					{currentStep.choices.map((choice) => (
						<button
							className="w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-bl-red/50 hover:bg-bl-red/5"
							key={choice.label}
							onClick={() =>
								handleChoice(
									choice.nextStepId,
									choice.feedback,
									choice.isCorrect
								)
							}
							type="button"
						>
							{choice.label}
						</button>
					))}
				</div>
			)}

			{/* Feedback */}
			{feedback && (
				<div
					className={`flex items-start gap-2 rounded-lg p-4 text-sm ${
						feedback.isCorrect
							? "bg-green-500/10 text-green-400"
							: "bg-destructive/10 text-destructive"
					}`}
				>
					{feedback.isCorrect ? (
						<CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
					) : (
						<XCircle className="mt-0.5 h-4 w-4 shrink-0" />
					)}
					<span>{feedback.text}</span>
				</div>
			)}

			{/* Completed */}
			{completed && (
				<div className="flex items-center gap-3">
					<Button onClick={handleRestart} size="sm" variant="outline">
						<RotateCcw className="mr-2 h-4 w-4" />
						Try Again
					</Button>
				</div>
			)}
		</div>
	);
}
