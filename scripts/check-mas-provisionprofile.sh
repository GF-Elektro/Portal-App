#!/usr/bin/env bash
# Fail fast if build/embedded.provisionprofile does not match the Apple Distribution cert in Keychain.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${1:-$ROOT/build/embedded.provisionprofile}"

if [[ ! -f "$PROFILE" ]]; then
  echo "Missing $PROFILE — download Mac App Store profile for com.gfelektro.portal (see docs/apple-signing.md)." >&2
  exit 1
fi

if ! security find-identity -v -p codesigning 2>/dev/null | grep -q 'Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)'; then
  echo "No Apple Distribution certificate in keychain for G&F Elektro." >&2
  exit 1
fi

_prof_meta=()
while IFS= read -r line; do _prof_meta+=("$line"); done < <(python3 - "$PROFILE" <<'PY'
import hashlib, plistlib, subprocess, sys, tempfile, os

path = sys.argv[1]
data = subprocess.check_output(["security", "cms", "-D", "-i", path])
pl = plistlib.loads(data)
certs = pl.get("DeveloperCertificates") or []
if not certs:
    raise SystemExit("profile has no DeveloperCertificates")
with tempfile.NamedTemporaryFile(suffix=".cer", delete=False) as f:
    f.write(certs[0])
    cer = f.name
fp = subprocess.check_output(
    ["openssl", "x509", "-inform", "der", "-in", cer, "-noout", "-fingerprint", "-sha1"],
    text=True,
).strip().removeprefix("sha1 Fingerprint=")
subj = subprocess.check_output(
    ["openssl", "x509", "-inform", "der", "-in", cer, "-noout", "-subject"],
    text=True,
).strip().removeprefix("subject=")
os.unlink(cer)
print(fp)
print(subj)
PY
)
profile_fp="${_prof_meta[0]}"
profile_subject="${_prof_meta[1]}"

keychain_fp="$(security find-certificate -c "Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)" -p 2>/dev/null \
  | openssl x509 -noout -fingerprint -sha1 | sed 's/sha1 Fingerprint=//')"

profile_norm="$(echo "$profile_fp" | tr '[:lower:]' '[:upper:]' | tr -d ':')"
keychain_norm="$(echo "$keychain_fp" | tr '[:lower:]' '[:upper:]' | tr -d ':')"

if [[ "$profile_norm" != "$keychain_norm" ]]; then
  echo "ERROR: Provisioning profile certificate does not match keychain Apple Distribution." >&2
  echo "  Profile:  $profile_subject" >&2
  echo "  Profile SHA-1:  $profile_fp" >&2
  echo "  Keychain SHA-1: $keychain_fp" >&2
  echo "" >&2
  echo "Edit or recreate the Mac App Store profile for com.gfelektro.portal at:" >&2
  echo "  https://developer.apple.com/account/resources/profiles/list" >&2
  echo "Select the Apple Distribution certificate Xcode uses now, download, and save as:" >&2
  echo "  build/embedded.provisionprofile" >&2
  exit 1
fi

echo "Provisioning profile matches keychain Apple Distribution ($profile_fp)."
