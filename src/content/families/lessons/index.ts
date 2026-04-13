import { lessonCatalog } from "../../catalog/lesson-catalog";
import { lessons as legacyLessons } from "../../lessons";
import type { LessonDefinition, LessonSection } from "../../types";

function toSectionId(heading: string) {
	return heading
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function withSectionIds(sections: LessonSection[]) {
	return sections.map((section) => ({
		...section,
		id: section.id ?? toSectionId(section.heading),
	}));
}

const lessonDefinitions: LessonDefinition[] = lessonCatalog.map((entry) => {
	const legacyLesson = legacyLessons.find(
		(lesson) => lesson.slug === entry.slug
	);
	if (!legacyLesson) {
		throw new Error(`Unknown legacy lesson: ${entry.slug}`);
	}

	return {
		id: entry.id,
		slug: legacyLesson.slug,
		title: legacyLesson.title,
		track: legacyLesson.track,
		order: legacyLesson.order,
		summary: legacyLesson.summary,
		objectives: entry.objectives,
		sections: withSectionIds(legacyLesson.sections),
		drillFamilyIds: entry.drillFamilyIds,
	};
});

export { lessonDefinitions };
