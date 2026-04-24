#!/bin/bash
set -e

npm install --legacy-peer-deps
npx drizzle-kit push --force <<< ""

# Apply data seeds
if [ -f migrations/0004_de_tutorials_seed.sql ]; then
  psql "$DATABASE_URL" -f migrations/0004_de_tutorials_seed.sql
fi

if [ -f migrations/0005_en_tutorials_seed.sql ]; then
  psql "$DATABASE_URL" -f migrations/0005_en_tutorials_seed.sql
fi
