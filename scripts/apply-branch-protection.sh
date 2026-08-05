#!/usr/bin/env bash
# Apply recommended branch protection on main (requires repo admin or org owner).
# Usage: GH_REPO=GF-Elektro/Portal-App ./scripts/apply-branch-protection.sh

set -euo pipefail

REPO="${GH_REPO:-GF-Elektro/Portal-App}"
BRANCH="${GH_BRANCH:-main}"

echo "Applying branch protection on ${REPO} → ${BRANCH}"
echo "(requires GitHub admin on this repository)"
echo

gh api --method PUT "repos/${REPO}/branches/${BRANCH}/protection" \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF

echo
echo "Done. Verify: gh api repos/${REPO}/branches/${BRANCH}/protection"
