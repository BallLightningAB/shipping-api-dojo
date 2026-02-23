/**
 * REST/SOAP builder drill UI — user constructs a request and compares to expected output.
 */

import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BuilderRestDrill, BuilderSoapDrill } from "@/content/types";

type BuilderDrillType = BuilderRestDrill | BuilderSoapDrill;

interface BuilderDrillProps {
	drill: BuilderDrillType;
	onComplete: (score: number) => void;
}

export function BuilderDrill({ drill, onComplete }: BuilderDrillProps) {
	const [userInput, setUserInput] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [showExpected, setShowExpected] = useState(false);

	const expected =
		drill.type === "builder.rest"
			? drill.expectedOutput
			: drill.expectedEnvelope;

	function handleSubmit() {
		setSubmitted(true);
		setShowExpected(true);
		const similarity = computeSimilarity(userInput.trim(), expected.trim());
		onComplete(scoreFromSimilarity(similarity));
	}

	return (
		<div className="space-y-4">
			<p className="font-medium text-foreground">{drill.prompt}</p>

			{drill.type === "builder.rest" && (
				<div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
					<p>
						<span className="text-muted-foreground">Method:</span>{" "}
						<code className="text-bl-red">{drill.method}</code>
					</p>
					<p>
						<span className="text-muted-foreground">URL:</span>{" "}
						<code className="text-bl-red">{drill.url}</code>
					</p>
					<p className="text-muted-foreground">
						Required headers: Content-Type, Accept, Authorization,
						X-Correlation-ID
					</p>
				</div>
			)}

			{drill.type === "builder.soap" && (
				<div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
					<p>
						<span className="text-muted-foreground">SOAPAction:</span>{" "}
						<code className="text-bl-red">{drill.soapAction}</code>
					</p>
					<p>
						<span className="text-muted-foreground">Namespace:</span>{" "}
						<code className="text-bl-red">{drill.namespace}</code>
					</p>
					<p className="text-muted-foreground">
						Fields:{" "}
						{Object.entries(drill.bodyFields)
							.map(([k, v]) => `${k}=${v}`)
							.join(", ")}
					</p>
				</div>
			)}

			<textarea
				className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-bl-red"
				disabled={submitted}
				onChange={(e) => setUserInput(e.target.value)}
				placeholder={
					drill.type === "builder.rest"
						? "Write the raw HTTP request..."
						: "Write the SOAP envelope XML..."
				}
				rows={8}
				value={userInput}
			/>

			{!submitted && (
				<Button
					disabled={userInput.trim() === ""}
					onClick={handleSubmit}
					size="sm"
				>
					Check
				</Button>
			)}

			{showExpected && (
				<div className="space-y-2">
					<div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
						{computeSimilarity(userInput.trim(), expected.trim()) >= 0.7 ? (
							<CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
						) : (
							<XCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
						)}
						<span className="text-muted-foreground">{drill.explanation}</span>
					</div>
					<details className="rounded-lg border border-border">
						<summary className="cursor-pointer px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
							Show expected output
						</summary>
						<pre className="overflow-x-auto p-3 font-mono text-sm text-green-400">
							{expected}
						</pre>
					</details>
				</div>
			)}
		</div>
	);
}

function scoreFromSimilarity(similarity: number): number {
	if (similarity >= 0.7) {
		return 1;
	}
	if (similarity >= 0.4) {
		return 0.5;
	}
	return 0;
}

function computeSimilarity(a: string, b: string): number {
	const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
	const na = normalize(a);
	const nb = normalize(b);
	if (na === nb) {
		return 1;
	}
	const wordsA = new Set(na.split(" "));
	const wordsB = new Set(nb.split(" "));
	const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
	const union = new Set([...wordsA, ...wordsB]).size;
	return union === 0 ? 0 : intersection / union;
}
