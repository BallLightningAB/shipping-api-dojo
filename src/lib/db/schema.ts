import {
	bigserial,
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
};

export const userProgress = pgTable(
	"user_progress",
	{
		userId: text("user_id").primaryKey(),
		version: integer("version").default(1).notNull(),
		progressJson: jsonb("progress_json").notNull(),
		...timestamps,
	},
	(table) => [index("user_progress_updated_at_idx").on(table.updatedAt)]
);

export const userEntitlements = pgTable(
	"user_entitlements",
	{
		userId: text("user_id").primaryKey(),
		tier: varchar("tier", { length: 32 }).default("free").notNull(),
		capabilities: jsonb("capabilities").default([]).notNull(),
		source: varchar("source", { length: 64 }).default("system").notNull(),
		effectiveFrom: timestamp("effective_from", { withTimezone: true })
			.defaultNow()
			.notNull(),
		effectiveTo: timestamp("effective_to", { withTimezone: true }),
		...timestamps,
	},
	(table) => [index("user_entitlements_tier_idx").on(table.tier)]
);

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").notNull(),
		provider: varchar("provider", { length: 32 }).default("creem").notNull(),
		status: varchar("status", { length: 32 }).notNull(),
		planKey: varchar("plan_key", { length: 64 }).notNull(),
		productId: text("product_id").notNull(),
		priceId: text("price_id"),
		currentPeriodStart: timestamp("current_period_start", {
			withTimezone: true,
		}),
		currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
		cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
		rawPayload: jsonb("raw_payload").notNull(),
		...timestamps,
	},
	(table) => [
		index("subscriptions_user_id_idx").on(table.userId),
		index("subscriptions_status_idx").on(table.status),
	]
);

export const billingEvents = pgTable(
	"billing_events",
	{
		id: text("id").primaryKey(),
		provider: varchar("provider", { length: 32 }).default("creem").notNull(),
		eventType: varchar("event_type", { length: 128 }).notNull(),
		userId: text("user_id"),
		subscriptionId: text("subscription_id"),
		payload: jsonb("payload").notNull(),
		receivedAt: timestamp("received_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		processedAt: timestamp("processed_at", { withTimezone: true }),
		...timestamps,
	},
	(table) => [
		index("billing_events_user_id_idx").on(table.userId),
		index("billing_events_subscription_id_idx").on(table.subscriptionId),
	]
);

export const certificates = pgTable(
	"certificates",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").notNull(),
		certificateType: varchar("certificate_type", { length: 64 }).notNull(),
		credentialId: varchar("credential_id", { length: 128 }).notNull(),
		credentialUrl: text("credential_url"),
		issuedAt: timestamp("issued_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		metadata: jsonb("metadata").default({}).notNull(),
		...timestamps,
	},
	(table) => [
		index("certificates_user_id_idx").on(table.userId),
		uniqueIndex("certificates_credential_id_unique").on(table.credentialId),
	]
);

export const emailEvents = pgTable(
	"email_events",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		providerEventId: text("provider_event_id"),
		provider: varchar("provider", { length: 32 }).default("resend").notNull(),
		eventType: varchar("event_type", { length: 64 }).notNull(),
		userId: text("user_id"),
		recipient: text("recipient").notNull(),
		payload: jsonb("payload").notNull(),
		occurredAt: timestamp("occurred_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		...timestamps,
	},
	(table) => [
		index("email_events_user_id_idx").on(table.userId),
		index("email_events_provider_event_id_idx").on(table.providerEventId),
	]
);

export const progressMergeEvents = pgTable(
	"progress_merge_events",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		userId: text("user_id").notNull(),
		mergeStrategy: varchar("merge_strategy", { length: 32 }).notNull(),
		localSnapshot: jsonb("local_snapshot").notNull(),
		serverSnapshot: jsonb("server_snapshot"),
		resultSnapshot: jsonb("result_snapshot").notNull(),
		...timestamps,
	},
	(table) => [index("progress_merge_events_user_id_idx").on(table.userId)]
);

export const user = pgTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		image: text("image"),
		...timestamps,
	},
	(table) => [uniqueIndex("user_email_unique").on(table.email)]
);

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		token: text("token").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		uniqueIndex("session_token_unique").on(table.token),
		index("session_user_id_idx").on(table.userId),
	]
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
		}),
		scope: text("scope"),
		password: text("password"),
		...timestamps,
	},
	(table) => [
		uniqueIndex("account_provider_account_unique").on(
			table.providerId,
			table.accountId
		),
		index("account_user_id_idx").on(table.userId),
	]
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		...timestamps,
	},
	(table) => [
		uniqueIndex("verification_identifier_value_unique").on(
			table.identifier,
			table.value
		),
	]
);

export const schema = {
	account,
	billingEvents,
	certificates,
	emailEvents,
	progressMergeEvents,
	session,
	subscriptions,
	user,
	userEntitlements,
	userProgress,
	verification,
};

export type DbSchema = typeof schema;
