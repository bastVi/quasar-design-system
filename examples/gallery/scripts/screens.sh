#!/usr/bin/env bash
# Runs the @screens suite inside the pinned Playwright image so baselines match across hosts and CI.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(cd ../.. && pwd)"
PORT=4319
VERSION="$(node -p "require('@playwright/test/package.json').version")"

# Docker Desktop runs containers in its own VM, where --network host does not reach the host loopback.
if [ "$(docker info --format '{{.OperatingSystem}}')" = "Docker Desktop" ]; then
  BIND=0.0.0.0 HOST=host.docker.internal NETWORK=(--add-host host.docker.internal:host-gateway)
else
  BIND=127.0.0.1 HOST=127.0.0.1 NETWORK=(--network host)
fi

pnpm build
setsid pnpm preview --host "$BIND" --port "$PORT" --strictPort >/dev/null 2>&1 &
PREVIEW=$!
trap 'kill -- -"$PREVIEW" 2>/dev/null || true' EXIT
for _ in $(seq 1 120); do curl -sf "http://127.0.0.1:$PORT/" >/dev/null && break; sleep 0.25; done

docker run --rm "${NETWORK[@]}" --ipc host -u "$(id -u):$(id -g)" -e HOME=/tmp \
  -e QDS_SCREENS=1 -e QDS_BASE_URL="http://$HOST:$PORT/" \
  -v "$ROOT:$ROOT" -w "$PWD" "mcr.microsoft.com/playwright:v$VERSION-noble" \
  node_modules/.bin/playwright test "$@"
