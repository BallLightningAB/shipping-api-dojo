/**
 * Multiple Choice Question drill UI.
 */

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { McqDrill as McqDrillType } from "@/content/types";

interface McqDrillProps {
	drill: McqDrillType;
	onComplete: (score: number) => void;
}

export function McqDrill({ drill, onComplete }: McqDrillProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const isCorrect = selectedIndex === drill.correctIndex;

	function handleSubmit() {
		if (selectedIndex === null) {
			return;
		}
		setSubmitted(true);
		onComplete(isCorrect ? 1 : 0);
	}

	return (
		<div className="space-y-4">
			<p className="font-medium text-foreground">{drill.question}</p>
			<div className="space-y-2">
				{drill.options.map((option, i) => {
					let borderClass = "border-border";
					if (submitted) {
						if (i === drill.correctIndex) {
							borderClass = "border-green-500 bg-green-500/10";
						} else if (i === selectedIndex && !isCorrect) {
							borderClass = "border-destructive bg-destructive/10";
						}
					} else if (i === selectedIndex) {
						borderClass = "border-bl-red bg-bl-red/10";
					}

					return (
						<button
							key={option}
							type="button"
							disabled={submitted}
							onClick={() => setSelectedIndex(i)}
							className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${borderClass} ${
								submitted
									? "cursor-default"
									: "cursor-pointer hover:border-bl-red/50"
							}`}
						>
							<span className="mr-2 font-mono text-muted-foreground">
								{String.fromCharCode(65 + i)}.
							</span>
							{option}
						</button>
					);
				})}
			</div>

			{!submitted && (
				<Button
					onClick={handleSubmit}
					disabled={selectedIndex === null}
					size="sm"
				>
					Check Answer
				</Button>
			)}

			{submitted && (
				<div
					className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
						isCorrect
							? "bg-green-500/10 text-green-400"
							: "bg-destructive/10 text-destructive"
					}`}
				>
					{isCorrect ? (
						<CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
					) : (
						<XCircle className="mt-0.5 h-4 w-4 shrink-0" />
					)}
					<span>{drill.explanation}</span>
				</div>
			)}
		</div>
	);
}
