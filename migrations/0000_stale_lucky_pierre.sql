CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"interest" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dennis_promos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"short_desc" text NOT NULL,
	"description" text NOT NULL,
	"rules" text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'ru' NOT NULL,
	"translation_group" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_name" text NOT NULL,
	"partner_cu" text NOT NULL,
	"partner_id" integer,
	"schedule_event_id" integer,
	"zoom_link" text NOT NULL,
	"title" text NOT NULL,
	"event_date" text NOT NULL,
	"event_time" text NOT NULL,
	"invite_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_events_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "invite_guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"invite_event_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"clicked_zoom" boolean DEFAULT false NOT NULL,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_chat_id" text NOT NULL,
	"telegram_username" text,
	"name" text NOT NULL,
	"cu_number" text NOT NULL,
	"phone" text,
	"email" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_telegram_chat_id_unique" UNIQUE("telegram_chat_id")
);
--> statement-breakpoint
CREATE TABLE "personal_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"schedule_event_id" integer NOT NULL,
	"invite_code" text NOT NULL,
	"prospect_name" text NOT NULL,
	"prospect_type" text DEFAULT 'Neutral' NOT NULL,
	"prospect_note" text,
	"guest_name" text,
	"guest_email" text,
	"guest_telegram" text,
	"registered_at" timestamp,
	"reminder_preference" text,
	"chat_history" text DEFAULT '[]',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "personal_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "promo_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"promo_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cu_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"banner" text DEFAULT '' NOT NULL,
	"highlights" text[] NOT NULL,
	"cta_text" text NOT NULL,
	"cta_link" text NOT NULL,
	"deadline" text,
	"gradient" text DEFAULT 'from-[#7C3AED] to-[#A855F7]' NOT NULL,
	"badge_color" text DEFAULT 'bg-orange-500' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"translation_group" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"timezone" text DEFAULT 'CET' NOT NULL,
	"title" text NOT NULL,
	"speaker" text NOT NULL,
	"speaker_id" integer,
	"type" text NOT NULL,
	"type_badge" text NOT NULL,
	"banner" text DEFAULT '' NOT NULL,
	"highlights" text[] NOT NULL,
	"link" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"translation_group" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "zoom_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"invite_guest_id" integer,
	"invite_event_id" integer NOT NULL,
	"participant_email" text NOT NULL,
	"participant_name" text,
	"join_time" timestamp,
	"leave_time" timestamp,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"questions_asked" integer DEFAULT 0 NOT NULL,
	"question_texts" text[],
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
