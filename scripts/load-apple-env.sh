#!/usr/bin/env bash
# Source gitignored .env.local for local Apple signing / TestFlight (maintainers only).
set -a
if [[ -f "$(dirname "$0")/../.env.local" ]]; then
  # shellcheck source=/dev/null
  source "$(dirname "$0")/../.env.local"
fi
set +a
