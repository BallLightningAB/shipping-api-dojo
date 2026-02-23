/**
 * Cloze (fill-in-the-blanks) drill UI.
 */

import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ClozeDrill as ClozeDrillType } from "@/content/types";

interface ClozeDrillProps {
	drill: ClozeDrillType;
	onComplete: (score: number) => void;
}

function getInputBorderClass(
	isSubmitted: boolean,
	input: string,
	answer: string
): string {
	if (!isSubmitted) {
		return "border-border";
	}
	if (input.trim().toLowerCase() === answer.toLowerCase()) {
		return "border-green-500 text-green-400";
	}
	return "border-destructive text-destructive";
}

export function ClozeDrill({ drill, onComplete }: ClozeDrillProps) {
	const blankCount = drill.answers.length;
	const [inputs, setInputs] = useState<string[]>(
		new Array(blankCount).fill("")
	);
	const [submitted, setSubmitted] = useState(false);

	const parts = drill.template.split("___");

	function handleChange(index: number, value: string) {
		const next = [...inputs];
		next[index] = value;
		setInputs(next);
	}

	function handleSubmit() {
		setSubmitted(true);
		const correct = inputs.filter(
			(v, i) => v.trim().toLowerCase() === drill.answers[i].toLowerCase()
		).length;
		onComplete(correct / blankCount);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-1 text-foreground leading-relaxed">
				{parts.map((part, i) => (
					<span className="inline-flex items-center gap-1" key={part}>
						<span className="whitespace-pre-wrap">{part}</span>
						{i < blankCount && (
							<span className="relative inline-block">
								<input
									className={`inline-block w-28 rounded border bg-transparent px-2 py-0.5 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-bl-red ${getInputBorderClass(submitted, inputs[i], drill.answers[i])}`}
									disabled={submitted}
									onChange={(e) => handleChange(i, e.target.value)}
									placeholder={`blank ${i + 1}`}
									type="text"
									value={inputs[i]}
								/>
								{submitted &&
									inputs[i].trim().toLowerCase() !==
										drill.answers[i].toLowerCase() && (
										<span className="ml-1 text-xs text-green-400">
											({drill.answers[i]})
										</span>
									)}
							</span>
						)}
					</span>
				))}
			</div>

			{!submitted && (
				<Button
					disabled={inputs.some((v) => v.trim() === "")}
					onClick={handleSubmit}
					size="sm"
				>
					Check Answers
				</Button>
			)}

			{submitted && (
				<div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
					{inputs.every(
						(v, i) => v.trim().toLowerCase() === drill.answers[i].toLowerCase()
					) ? (
						<CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
					) : (
						<XCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
					)}
					<span className="text-muted-foreground">{drill.explanation}</span>
				</div>
			)}
		</div>
	);
}
