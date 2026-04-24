ALTER TABLE "schedule_events" ADD COLUMN IF NOT EXISTS "action_url" text;--> statement-breakpoint
ALTER TABLE "schedule_events" ADD COLUMN IF NOT EXISTS "action_label" text;