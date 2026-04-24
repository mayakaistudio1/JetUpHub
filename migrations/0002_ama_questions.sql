CREATE TABLE IF NOT EXISTS "ama_questions" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "contact" text NOT NULL,
  "question" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
