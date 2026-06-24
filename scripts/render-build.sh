#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=production
export BASE_PATH=/
export PORT=3000

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found — installing via npm..."
  npm install -g pnpm@10
fi

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building frontend..."
pnpm --filter @workspace/prait-landing run build

echo "Building API server..."
pnpm --filter @workspace/api-server run build

echo "Render build complete."
