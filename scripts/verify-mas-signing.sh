#!/usr/bin/env bash
# Verify Mac App Store .app signing matches embedded.provisionprofile (avoids ITMS-90284).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-}"

if [[ -z "$APP" ]]; then
  for candidate in \
    "$ROOT/release/mas-arm64/G&F Portal EU.app" \
    "$ROOT/release/mas-arm64/GF Portal EU.app" \
    "$ROOT/release/mas/G&F Portal EU.app"
  do
    if [[ -d "$candidate" ]]; then
      APP="$candidate"
      break
    fi
  done
fi

if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "Usage: $0 [path/to/App.app]" >&2
  echo "No MAS .app found under release/mas-arm64/." >&2
  exit 1
fi

PROFILE="$APP/Contents/embedded.provisionprofile"
if [[ ! -f "$PROFILE" ]]; then
  echo "Missing embedded.provisionprofile in $APP" >&2
  exit 1
fi

cert_sha1() {
  openssl x509 -inform der -noout -fingerprint -sha1 "$1" 2>/dev/null | sed 's/sha1 Fingerprint=//'
}

profile_cert_sha1() {
  python3 - "$1" <<'PY'
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
}

profile_meta=()
while IFS= read -r line; do profile_meta+=("$line"); done < <(profile_cert_sha1 "$PROFILE")
profile_fp="${profile_meta[0]}"
profile_subject="${profile_meta[1]}"

echo "Profile certificate: $profile_subject"
echo "Profile cert SHA-1: $profile_fp"

keychain_line="$(security find-identity -v -p codesigning 2>/dev/null | grep 'Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)' | head -1 || true)"
if [[ -z "$keychain_line" ]]; then
  echo "ERROR: No Apple Distribution identity for G&F Elektro in the login keychain." >&2
  exit 1
fi

identity_hash="${keychain_line%% *}"
identity_hash="${identity_hash#\)}"
identity_hash="${identity_hash//)/}"
identity_hash="$(echo "$identity_hash" | awk '{print $1}')"

keychain_fp="$(security find-certificate -a -c "Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)" -Z 2>/dev/null \
  | awk -v want="$identity_hash" '
    /^SHA-1 hash:/ { fp=$3; gsub(":", "", fp); fp=toupper(fp); getline; if ($0 ~ want) { print fp; exit } }
  ')"
# security -Z prints colon-free uppercase hex
profile_fp_norm="$(echo "$profile_fp" | tr '[:lower:]' '[:upper:]' | tr -d ':')"

if [[ -z "$keychain_fp" ]]; then
  keychain_fp="$(security find-certificate -c "Apple Distribution: G&F Elektro s.r.o. (3DKACDD8PH)" -p 2>/dev/null \
    | openssl x509 -noout -fingerprint -sha1 | sed 's/sha1 Fingerprint=//' | tr '[:lower:]' '[:upper:]' | tr -d ':')"
fi

echo "Keychain Apple Distribution SHA-1: ${keychain_fp:-unknown} (identity $identity_hash)"

BIN_DIR="$APP/Contents/MacOS"
MAIN_BIN="$(find "$BIN_DIR" -maxdepth 1 -type f | head -1)"
if [[ -z "$MAIN_BIN" ]]; then
  echo "No executable in $BIN_DIR" >&2
  exit 1
fi

PAK="$(find "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources" -name locale.pak 2>/dev/null | head -1 || true)"
if [[ -z "$PAK" ]]; then
  echo "No locale.pak under Electron Framework; skipping inner-file check." >&2
  PAK="$MAIN_BIN"
fi

sign_authority() {
  codesign -dv --verbose=4 "$1" 2>&1 | awk -F= '/^Authority=/{print $2}' | head -1
}

main_auth="$(sign_authority "$MAIN_BIN")"
pak_auth="$(sign_authority "$PAK")"

echo "Main binary Authority: $main_auth"
echo "Sample locale.pak Authority: $pak_auth"

fail=0
if [[ "$main_auth" != *"Apple Distribution"* ]]; then
  echo "ERROR: Main binary must be signed with Apple Distribution (Mac App Store), not Development or Developer ID." >&2
  fail=1
fi
if [[ "$pak_auth" != *"Apple Distribution"* ]]; then
  echo "ERROR: Inner files must use Apple Distribution (ITMS-90284)." >&2
  fail=1
fi
if [[ "$main_auth" != "$pak_auth" ]]; then
  echo "ERROR: Main binary and locale.pak use different signing identities." >&2
  fail=1
fi

if [[ -n "$keychain_fp" && "$profile_fp_norm" != "$keychain_fp" ]]; then
  echo "ERROR: embedded.provisionprofile lists a different Apple Distribution certificate than the one in your keychain." >&2
  echo "  Profile SHA-1:  $profile_fp" >&2
  echo "  Keychain SHA-1: $(echo "$keychain_fp" | sed 's/\(..\)/\1:/g; s/:$//')" >&2
  echo "Regenerate the Mac App Store profile for com.gfelektro.portal with the current Apple Distribution cert," >&2
  echo "save it as build/embedded.provisionprofile, then rebuild (npm run build:mac:mas)." >&2
  fail=1
fi

if [[ $fail -ne 0 ]]; then
  exit 1
fi

echo "MAS signing check passed for $APP"
