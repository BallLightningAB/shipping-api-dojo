/**
 * Content Data Types for Shipping API Dojo
 */

export type Track = "rest" | "soap" | "intro" | "cross-track";

export type DrillType = "mcq" | "cloze" | "builder.rest" | "builder.soap";

export interface DrillOption {
	label: string;
	value: string;
}

export interface McqDrill {
	correctIndex: number;
	explanation: string;
	familyId?: string;
	id: string;
	options: string[];
	progressKey?: string;
	question: string;
	type: "mcq";
	variantId?: string;
}

export interface ClozeDrill {
	answers: string[];
	explanation: string;
	familyId?: string;
	id: string;
	progressKey?: string;
	template: string;
	type: "cloze";
	variantId?: string;
}

export interface BuilderRestDrill {
	body?: string;
	expectedOutput: string;
	explanation: string;
	familyId?: string;
	headers: Record<string, string>;
	id: string;
	method: string;
	progressKey?: string;
	prompt: string;
	type: "builder.rest";
	url: string;
	variantId?: string;
}

export interface BuilderSoapDrill {
	bodyFields: Record<string, string>;
	expectedEnvelope: string;
	explanation: string;
	familyId?: string;
	id: string;
	namespace: string;
	progressKey?: string;
	prompt: string;
	soapAction: string;
	type: "builder.soap";
	variantId?: string;
}

export type Drill = McqDrill | ClozeDrill | BuilderRestDrill | BuilderSoapDrill;

export interface LessonSection {
	body: string;
	carrierReality?: string;
	heading: string;
	id?: string;
}

export interface Lesson {
	drillFamilyIds?: string[];
	drillIds: string[];
	id?: string;
	objectives?: string[];
	order: number;
	sections: LessonSection[];
	slug: string;
	summary: string;
	title: string;
	track: Track;
}

export interface ScenarioStep {
	choices: ScenarioChoice[];
	id: string;
	text: string;
}

export interface ScenarioChoice {
	feedback: string;
	id?: string;
	isCorrect: boolean;
	label: string;
	nextStepId: string | null;
}

export interface Scenario {
	difficulty: "beginner" | "intermediate" | "advanced";
	evidence?: string[];
	id: string;
	ladderLevel?: 1 | 2 | 3 | 4;
	progressKey?: string;
	runSeed?: number;
	scenarioFamilyId?: string;
	steps: ScenarioStep[];
	summary: string;
	title: string;
}

export interface LessonDefinition {
	drillFamilyIds: string[];
	id: string;
	objectives: string[];
	order: number;
	sections: LessonSection[];
	slug: string;
	summary: string;
	title: string;
	track: Track;
}

export interface DrillVariant {
	drill: Drill;
	variantId: string;
}

export interface DrillFamilyDefinition {
	buildVariant: (seed: number) => DrillVariant;
	concept: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	id: string;
	misconception: string;
	tags: string[];
	type: DrillType;
}

export interface ScenarioRun {
	runId: string;
	scenario: Scenario;
}

export interface ScenarioFamilyDefinition {
	buildRun: (seed: number) => ScenarioRun;
	concept: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	id: string;
	ladderLevel: 1 | 2 | 3 | 4;
	summary: string;
	title: string;
}

export interface WikiEntry {
	body: string;
	relatedSlugs: string[];
	slug: string;
	sources: WikiSource[];
	summary: string;
	title: string;
}

export interface WikiSource {
	label: string;
	url: string;
}

/**
 * Protocol families for carrier API surfaces.
 *
 * `xml-http` covers proprietary XML-over-HTTP interfaces (XML payload
 * passed in a query string or POST body) such as legacy USPS Web Tools
 * and pre-2024 UPS XML services. It is intentionally distinct from
 * `soap` (envelope-based, WSDL-described) and from XML-RPC, which is a
 * specific RPC standard that none of the supported carriers implement.
 */
export type ProtocolFamily =
	| "rest"
	| "soap"
	| "edi-x12"
	| "edi-edifact"
	| "graphql"
	| "webhook"
	| "xml-http";

export type CarrierStatus =
	| "active"
	| "preview"
	| "deprecated"
	| "sunset"
	| "legacy";

export type CarrierRegion =
	| "global"
	| "us"
	| "ca"
	| "de"
	| "fr"
	| "uk"
	| "nl"
	| "se"
	| "au"
	| "jp"
	| "apac"
	| "europe"
	| "americas";

export interface CarrierBaseUrls {
	production?: string;
	sandbox?: string;
}

export interface CarrierToolingNotes {
	ediGuideUrl?: string;
	graphqlEndpoint?: string;
	openApiUrl?: string;
	postmanCollectionUrl?: string;
	wsdlUrl?: string;
}

export interface CarrierFaq {
	answer: string;
	question: string;
}

export interface CarrierSurface {
	apiName: string;
	authMethods: string[];
	baseUrls: CarrierBaseUrls;
	body: string;
	businessUnit: string;
	businessUnitSlug: string;
	deprecationNotes?: string;
	directorySlugs: string[];
	faqs: CarrierFaq[];
	lastReviewed: string;
	officialDocs: WikiSource[];
	productLine?: string;
	protocol: ProtocolFamily;
	region: CarrierRegion;
	relatedConceptSlugs: string[];
	relatedSurfaceSlugs: string[];
	replacementSurfaceSlug?: string;
	sandboxNotes?: string;
	slug: string;
	sources: WikiSource[];
	status: CarrierStatus;
	summary: string;
	title: string;
	toolingNotes?: CarrierToolingNotes;
	vendor: string;
	vendorSlug: string;
}

export interface DirectoryDeprecation {
	effectiveDate?: string;
	notes: string;
	replacement?: string;
}

export interface DirectorySandbox {
	available: boolean;
	notes?: string;
	url?: string;
}

export interface DirectoryEntry {
	apiName?: string;
	businessUnit?: string;
	carrierSlug?: string;
	category: "spec" | "tool" | "carrier" | "community";
	deprecation?: DirectoryDeprecation;
	description: string;
	protocols?: ProtocolFamily[];
	region?: CarrierRegion;
	sandbox?: DirectorySandbox;
	slug?: string;
	status?: CarrierStatus;
	title: string;
	tooling?: CarrierToolingNotes;
	url: string;
	vendor?: string;
}
