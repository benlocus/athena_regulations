import {
	pgTable,
	uuid,
	text,
	timestamp,
	integer,
	boolean,
	date,
	jsonb,
	uniqueIndex,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { ContentNode } from '$lib/types';

// ── Regulatory Codes ──────────────────────────────────────────────
export const regulatoryCodes = pgTable('regulatory_codes', {
	id: uuid('id').defaultRandom().primaryKey(),
	codeNumber: text('code_number').notNull().unique(),
	title: text('title').notNull(),
	jurisdiction: text('jurisdiction').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ── Regulation Titles ─────────────────────────────────────────────
export const regulationTitles = pgTable(
	'regulation_titles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		codeId: uuid('code_id')
			.notNull()
			.references(() => regulatoryCodes.id),
		titleNumber: text('title_number').notNull(),
		title: text('title').notNull(),
		description: text('description'),
		slug: text('slug').notNull().unique(),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	}
);

// ── Sections ──────────────────────────────────────────────────────
export const sections = pgTable(
	'sections',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		titleId: uuid('title_id')
			.notNull()
			.references(() => regulationTitles.id),
		sectionNumber: text('section_number').notNull(),
		heading: text('heading').notNull(),
		slug: text('slug').notNull(),
		contentTree: jsonb('content_tree').$type<ContentNode[]>().notNull(),
		plainText: text('plain_text').notNull().default(''),
		searchVector: text('search_vector'),
		sortOrder: integer('sort_order').notNull().default(0),
		isRepealed: boolean('is_repealed').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('sections_title_section_unique').on(table.titleId, table.sectionNumber),
		index('sections_slug_idx').on(table.slug)
	]
);

// ── Cross References ──────────────────────────────────────────────
export const crossReferences = pgTable(
	'cross_references',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sourceSectionId: uuid('source_section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		sourceNodeId: text('source_node_id').notNull(),
		targetCitation: text('target_citation').notNull(),
		targetSectionId: uuid('target_section_id').references(() => sections.id, {
			onDelete: 'set null'
		}),
		targetSubsection: text('target_subsection'),
		referenceType: text('reference_type').notNull().default('internal'),
		displayText: text('display_text')
	},
	(table) => [
		index('cross_refs_source_idx').on(table.sourceSectionId),
		index('cross_refs_target_idx').on(table.targetSectionId),
		index('cross_refs_citation_idx').on(table.targetCitation)
	]
);

// ── Amendments ────────────────────────────────────────────────────
export const amendments = pgTable(
	'amendments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		amendmentType: text('amendment_type').notNull(),
		effectiveDate: date('effective_date'),
		massRegister: text('mass_register'),
		description: text('description'),
		sortOrder: integer('sort_order').notNull().default(0)
	}
);

// ── Better Auth Tables ────────────────────────────────────────────
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ── Bookmarks ─────────────────────────────────────────────────────
export const bookmarks = pgTable(
	'bookmarks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		nodeId: text('node_id'),
		label: text('label'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('bookmarks_user_section_node_unique').on(
			table.userId,
			table.sectionId,
			table.nodeId
		)
	]
);

// ── Annotations ───────────────────────────────────────────────────
export const annotations = pgTable(
	'annotations',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		nodeId: text('node_id'),
		content: text('content').notNull(),
		highlightText: text('highlight_text'),
		startOffset: integer('start_offset'),
		endOffset: integer('end_offset'),
		color: text('color').notNull().default('yellow'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('annotations_user_section_idx').on(table.userId, table.sectionId)]
);
