CREATE TYPE "public"."board_background_brightness" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"edge_color" text,
	"card_id" text NOT NULL,
	"uploaded_by_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_link" text,
	"background" text,
	"background_image" text,
	"background_brightness" "board_background_brightness" DEFAULT 'light' NOT NULL,
	"background_bottom_color" text,
	"background_top_color" text,
	"background_color" text,
	"starred" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "board_short_link_unique" UNIQUE("short_link")
);
--> statement-breakpoint
CREATE TABLE "card" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pos" double precision NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"due_date" timestamp,
	"short_link" text,
	"cover_color" text,
	"cover_image" text,
	"list_id" text NOT NULL,
	"board_id" text NOT NULL,
	"assignee_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "card_short_link_unique" UNIQUE("short_link")
);
--> statement-breakpoint
CREATE TABLE "card_label" (
	"card_id" text NOT NULL,
	"label_id" text NOT NULL,
	CONSTRAINT "card_label_card_id_label_id_pk" PRIMARY KEY("card_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "check_item" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pos" double precision NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"checklist_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pos" double precision NOT NULL,
	"card_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"card_id" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "label" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"board_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pos" double precision NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"board_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_link" text,
	"description" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "workspace_short_link_unique" UNIQUE("short_link")
);
--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board" ADD CONSTRAINT "board_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board" ADD CONSTRAINT "board_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_list_id_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_label" ADD CONSTRAINT "card_label_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_label" ADD CONSTRAINT "card_label_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_item" ADD CONSTRAINT "check_item_checklist_id_checklist_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."checklist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist" ADD CONSTRAINT "checklist_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list" ADD CONSTRAINT "list_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_card_id_idx" ON "attachment" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "attachment_uploaded_by_id_idx" ON "attachment" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "board_workspace_id_idx" ON "board" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "board_user_id_idx" ON "board" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_board_id_idx" ON "card" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "card_list_id_idx" ON "card" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "card_assignee_id_idx" ON "card" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "check_item_checklist_id_idx" ON "check_item" USING btree ("checklist_id");--> statement-breakpoint
CREATE INDEX "checklist_card_id_idx" ON "checklist" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "comment_card_id_idx" ON "comment" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "comment_author_id_idx" ON "comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "label_board_id_idx" ON "label" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "list_board_id_idx" ON "list" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "workspace_owner_id_idx" ON "workspace" USING btree ("owner_id");