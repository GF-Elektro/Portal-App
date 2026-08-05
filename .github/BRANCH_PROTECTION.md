# Branch protection for `main`

GitHub shows **“Your main branch isn't protected”** when `main` allows force-push and deletion. Recommended settings for Portal-App:

| Setting | Value | Why |
| ------- | ----- | --- |
| **Allow force pushes** | Off | Prevents rewriting published history |
| **Allow deletions** | Off | Prevents accidental removal of `main` |
| **Require pull request** | Off (for now) | Maintainers still push directly to `main` |
| **Require status checks** | Off (for now) | No PR CI yet; Pages deploy runs only after merge |
| **Include administrators** | Off | Admins can bypass in emergencies |

## Option A — UI (fastest if you see the blue banner)

1. Open [Portal-App → Code](https://github.com/GF-Elektro/Portal-App)
2. Click **Protect this branch** on the banner (or **Settings → Branches → Add rule**)
3. Branch name pattern: `main`
4. Enable only:
   - **Do not allow bypassing the above settings** — optional
   - Disable **Allow force pushes**
   - Disable **Allow deletions**
5. Leave **Require a pull request before merging** unchecked
6. Save changes

## Option B — CLI (org owner / repo admin)

Requires a token with **admin** on `GF-Elektro/Portal-App`:

```bash
chmod +x scripts/apply-branch-protection.sh
./scripts/apply-branch-protection.sh
```

Or one-shot:

```bash
gh api --method PUT repos/GF-Elektro/Portal-App/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

## Verify

```bash
gh api repos/GF-Elektro/Portal-App/branches/main/protection --jq '{allow_force_pushes, allow_deletions}'
```

Expected: both `false`. The blue banner should disappear.

## Later (optional)

When you want Dependabot PRs gated by CI:

1. Add a `pull_request` workflow (lint/build)
2. Turn on **Require status checks** with that job name
3. Turn on **Require pull request before merging** for non-admin contributors
