#!/usr/bin/env bash
# Source gitignored .env.local (Apple signing, Graphify Gemini backend, etc.).
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
set -a
if [[ -f "$repo_root/.env.local" ]]; then
  # shellcheck source=/dev/null
  source "$repo_root/.env.local"
fi
set +a
if [[ -z "${GEMINI_API_KEY:-}" && -n "${VITE_GEMINI_API_KEY:-}" ]]; then
  export GEMINI_API_KEY="$VITE_GEMINI_API_KEY"
fi
