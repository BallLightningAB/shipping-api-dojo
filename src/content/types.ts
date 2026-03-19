/**
 * Content Data Types for Shipping API Dojo
 */

export type Track = "rest" | "soap" | "intro";

export type DrillType = "mcq" | "cloze" | "builder.rest" | "builder.soap";

export interface DrillOption {
	label: string;
	value: string;
}

export interface McqDrill {
	id: string;
	type: "mcq";
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export interface ClozeDrill {
	id: string;
	type: "cloze";
	template: string;
	answers: string[];
	explanation: string;
}

export interface BuilderRestDrill {
	id: string;
	type: "builder.rest";
	prompt: string;
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: string;
	expectedOutput: string;
	explanation: string;
}

export interface BuilderSoapDrill {
	id: string;
	type: "builder.soap";
	prompt: string;
	soapAction: string;
	namespace: string;
	bodyFields: Record<string, string>;
	expectedEnvelope: string;
	explanation: string;
}

export type Drill = McqDrill | ClozeDrill | BuilderRestDrill | BuilderSoapDrill;

export interface LessonSection {
	heading: string;
	body: string;
	carrierReality?: string;
}

export interface Lesson {
	slug: string;
	title: string;
	track: Track;
	order: number;
	summary: string;
	sections: LessonSection[];
	drillIds: string[];
}

export interface ScenarioStep {
	id: string;
	text: string;
	choices: ScenarioChoice[];
}

export interface ScenarioChoice {
	label: string;
	nextStepId: string | null;
	feedback: string;
	isCorrect: boolean;
}

export interface Scenario {
	id: string;
	title: string;
	summary: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	steps: ScenarioStep[];
}

export interface WikiEntry {
	slug: string;
	title: string;
	summary: string;
	body: string;
	sources: WikiSource[];
	relatedSlugs: string[];
}

export interface WikiSource {
	label: string;
	url: string;
}

export interface DirectoryEntry {
	title: string;
	url: string;
	description: string;
	category: "spec" | "tool" | "carrier" | "community";
}
