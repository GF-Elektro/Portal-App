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

stage_arch() {
  local arch_dir appimage version app_sha icon_sha
  arch_dir="$(mktemp -d)"
  if ! gh release download --repo GF-Elektro/Portal-App --pattern 'GFElektroPortal-*.AppImage' --dir "$arch_dir" --clobber; then
    echo "No AppImage; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  appimage="$(ls "$arch_dir"/GFElektroPortal-*.AppImage 2>/dev/null | head -n 1 || true)"
  if [ -z "${appimage:-}" ] || [ ! -f "$appimage" ]; then
    echo "AppImage missing; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  version="$(basename "$appimage" | sed -E 's/GFElektroPortal-(.*)\.AppImage/\1/')"
  if ! curl -fsSL -o "$arch_dir/icon-512.png" https://raw.githubusercontent.com/GF-Elektro/Portal-App/main/icon-512.png; then
    echo "Icon download failed; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  cp "$ROOT/packaging/arch/PKGBUILD" "$arch_dir/PKGBUILD"
  app_sha="$(sha256sum "$appimage" | awk '{print $1}')"
  icon_sha="$(sha256sum "$arch_dir/icon-512.png" | awk '{print $1}')"
  if ! python3 - "$arch_dir/PKGBUILD" "$version" "$app_sha" "$icon_sha" << 'PY'
import sys
from pathlib import Path
path, version, app_sha, icon_sha = sys.argv[1:]
text = Path(path).read_text()
text = text.replace("pkgver=1.0.17", f"pkgver={version}", 1)
text = text.replace("sha256sums=('SKIP' 'SKIP')", f"sha256sums=('{app_sha}' '{icon_sha}')", 1)
if "SKIP" in text:
    raise SystemExit("SKIP checksum remains")
Path(path).write_text(text)
PY
  then
    echo "PKGBUILD checksum update failed; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  if ! docker run --rm -v "$arch_dir:/pkg" -w /pkg archlinux:base-devel \
    bash -lc 'pacman -Sy --noconfirm base-devel && useradd -m builder && chown -R builder /pkg && su builder -c "makepkg -sf --noconfirm"'; then
    echo "makepkg failed; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  mkdir -p "$SITE/arch"
  if ! cp "$arch_dir"/gfe-portal-eu-*.pkg.tar.zst "$SITE/arch/"; then
    echo "Package file missing; skipping pacman database."
    rm -rf "$SITE/arch"
    rm -rf "$arch_dir"
    return 0
  fi
  if ! docker run --rm -v "$SITE/arch:/pkg-out" -w /pkg-out archlinux:base-devel \
    bash -lc 'pacman -Sy --noconfirm base-devel && repo-add /pkg-out/gf-elektro.db.tar.zst /pkg-out/gfe-portal-eu-*.pkg.tar.zst'; then
    echo "repo-add failed; removing incomplete arch index."
    rm -rf "$SITE/arch"
    rm -rf "$arch_dir"
    return 0
  fi
  rm -rf "$arch_dir"
  echo "Staged pacman database."
}

if ! stage_arch; then
  echo "Arch staging failed; apt index remains."
  rm -rf "$SITE/arch"
fi
exit 0
