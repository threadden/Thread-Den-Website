#!/usr/bin/env bash
cd "$(dirname "$0")"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local - open it, paste your GEMINI_API_KEY, then run this script again."
  exit 0
fi
[ -d node_modules ] || npm install
echo "Starting Thread Den at http://localhost:3000"
npm run dev
