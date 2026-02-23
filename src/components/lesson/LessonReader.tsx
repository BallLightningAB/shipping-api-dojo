/**
 * Renders lesson content with sections and carrier reality boxes.
 */

import { AlertTriangle } from "lucide-react";
import type { Lesson } from "@/content/types";

interface LessonReaderProps {
	lesson: Lesson;
}

export function LessonReader({ lesson }: LessonReaderProps) {
	return (
		<article className="prose prose-cream max-w-none">
			<p className="text-lg text-muted-foreground">{lesson.summary}</p>

			{lesson.sections.map((section) => (
				<section key={section.heading} className="mt-10">
					<h2 className="text-2xl">{section.heading}</h2>
					<div className="mt-4 whitespace-pre-line text-foreground/90 leading-relaxed">
						{section.body}
					</div>
					{section.carrierReality && (
						<div className="mt-4 rounded-lg border border-bl-red/30 bg-bl-red/5 p-4">
							<div className="mb-2 flex items-center gap-2 font-semibold text-sm text-bl-red">
								<AlertTriangle className="h-4 w-4" />
								Carrier Reality
							</div>
							<p className="text-sm text-foreground/80">
								{section.carrierReality}
							</p>
						</div>
					)}
				</section>
			))}
		</article>
	);
}
