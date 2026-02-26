export type ContentNode = {
	id: string;
	type: 'section' | 'subsection' | 'paragraph' | 'definition' | 'text';
	number: string | null;
	heading: string | null;
	content: string;
	children: ContentNode[];
	depth: number;
};

export type Section = {
	id: string;
	titleId: string;
	sectionNumber: string;
	heading: string;
	slug: string;
	contentTree: ContentNode[];
	plainText: string;
	sortOrder: number;
	isRepealed: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type RegulationTitle = {
	id: string;
	codeId: string;
	titleNumber: string;
	title: string;
	description: string | null;
	slug: string;
	sortOrder: number;
};

export type RegulatoryCode = {
	id: string;
	codeNumber: string;
	title: string;
	jurisdiction: string;
};

export type CrossReference = {
	id: string;
	sourceSectionId: string;
	sourceNodeId: string;
	targetCitation: string;
	targetSectionId: string | null;
	targetSubsection: string | null;
	referenceType: 'internal' | 'external_statute' | 'external_federal';
	displayText: string | null;
};

export type Amendment = {
	id: string;
	sectionId: string;
	amendmentType: 'adopted' | 'amended';
	effectiveDate: Date | null;
	massRegister: string | null;
	description: string | null;
	sortOrder: number;
};

export type Bookmark = {
	id: string;
	userId: string;
	sectionId: string;
	nodeId: string | null;
	label: string | null;
	createdAt: Date;
};

export type Annotation = {
	id: string;
	userId: string;
	sectionId: string;
	nodeId: string | null;
	content: string;
	highlightText: string | null;
	color: string;
	createdAt: Date;
	updatedAt: Date;
};

export type SearchResult = {
	sectionId: string;
	sectionNumber: string;
	heading: string;
	slug: string;
	titleSlug: string;
	snippet: string;
	rank: number;
};
