CREATE TABLE "practice_seeds" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"surface" varchar(32) NOT NULL,
	"scope" varchar(256) NOT NULL,
	"seed" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "practice_seeds_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "practice_seeds_user_id_idx" ON "practice_seeds" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_seeds_owner_scope_unique" ON "practice_seeds" USING btree ("user_id","surface","scope");
