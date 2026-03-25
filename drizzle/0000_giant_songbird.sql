CREATE TABLE "billing_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" varchar(32) DEFAULT 'creem' NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"user_id" text,
	"subscription_id" text,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"certificate_type" varchar(64) NOT NULL,
	"credential_id" varchar(128) NOT NULL,
	"credential_url" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"provider_event_id" text,
	"provider" varchar(32) DEFAULT 'resend' NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"user_id" text,
	"recipient" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_merge_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"merge_strategy" varchar(32) NOT NULL,
	"local_snapshot" jsonb NOT NULL,
	"server_snapshot" jsonb,
	"result_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" varchar(32) DEFAULT 'creem' NOT NULL,
	"status" varchar(32) NOT NULL,
	"plan_key" varchar(64) NOT NULL,
	"product_id" text NOT NULL,
	"price_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_entitlements" (
	"user_id" text PRIMARY KEY NOT NULL,
	"tier" varchar(32) DEFAULT 'free' NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" varchar(64) DEFAULT 'system' NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"progress_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "billing_events_user_id_idx" ON "billing_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_events_subscription_id_idx" ON "billing_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "certificates_user_id_idx" ON "certificates" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_credential_id_unique" ON "certificates" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "email_events_user_id_idx" ON "email_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_events_provider_event_id_idx" ON "email_events" USING btree ("provider_event_id");--> statement-breakpoint
CREATE INDEX "progress_merge_events_user_id_idx" ON "progress_merge_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_entitlements_tier_idx" ON "user_entitlements" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "user_progress_updated_at_idx" ON "user_progress" USING btree ("updated_at");