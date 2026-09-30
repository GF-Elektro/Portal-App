#!/usr/bin/env bash
# Build hosting-dist/ for Firebase Hosting. Never commit that directory.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/hosting-dist"
rm -rf "$SITE"
mkdir -p "$SITE"
printf '%s\n' 'G&F Portal EU packages' > "$SITE/index.html"

TMP="$(mktemp -d)"
if ! gh release download --repo GF-Elektro/Portal-App --pattern 'GFElektroPortal-*.deb' --dir "$TMP" --clobber; then
  echo "No .deb on the latest release; deploying the placeholder page only."
  rm -rf "$TMP"
  exit 0
fi

DEB="$(ls "$TMP"/GFElektroPortal-*.deb | head -n 1)"
if [ -z "${DEB:-}" ] || [ ! -f "$DEB" ]; then
  echo "Download did not include a .deb; deploying the placeholder page only."
  rm -rf "$TMP"
  exit 0
fi

mkdir -p "$SITE/apt/pool/main" "$SITE/apt/dists/stable/main/binary-amd64"
cp "$DEB" "$SITE/apt/pool/main/"
rm -rf "$TMP"

(
  cd "$SITE/apt"
  dpkg-scanpackages --multiversion pool /dev/null > dists/stable/main/binary-amd64/Packages
  gzip -9c dists/stable/main/binary-amd64/Packages > dists/stable/main/binary-amd64/Packages.gz
)

CONF="$SITE/apt/release.conf"
cat > "$CONF" << 'EOF'
APT::FTPArchive::Release::Origin "G&F Elektro";
APT::FTPArchive::Release::Label "G&F Portal EU";
APT::FTPArchive::Release::Suite "stable";
APT::FTPArchive::Release::Codename "stable";
APT::FTPArchive::Release::Architectures "amd64";
APT::FTPArchive::Release::Components "main";
EOF
apt-ftparchive -c "$CONF" release "$SITE/apt/dists/stable" > "$SITE/apt/dists/stable/Release"
rm -f "$CONF"
echo "Staged apt index."
exit 0
