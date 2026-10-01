#!/usr/bin/env bash
# Build hosting-dist/ for Firebase Hosting. Never commit that directory.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/hosting-dist"
REPO="${GITHUB_REPOSITORY:-GF-Elektro/Portal-App}"
RELEASE_TAG="${RELEASE_TAG:-}"

download_release() {
  local pattern="$1"
  local dest="$2"
  if [ -n "$RELEASE_TAG" ]; then
    gh release download "$RELEASE_TAG" --repo "$REPO" --pattern "$pattern" --dir "$dest" --clobber
  else
    gh release download --repo "$REPO" --pattern "$pattern" --dir "$dest" --clobber
  fi
}

rm -rf "$SITE"
mkdir -p "$SITE"
printf '%s\n' 'G&F Portal EU packages' > "$SITE/index.html"

TMP="$(mktemp -d)"
if ! download_release 'GFElektroPortal-*.deb' "$TMP"; then
  echo "No .deb on the release; deploying the placeholder page only."
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
  local arch_dir appimage version app_sha icon_sha pkg_file
  arch_dir="$(mktemp -d)"
  if ! download_release 'GFElektroPortal-*.AppImage' "$arch_dir"; then
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
  if ! curl -fsSL -o "$arch_dir/icon-512.png" \
    "https://raw.githubusercontent.com/GF-Elektro/Portal-App/v${version}/icon-512.png"; then
    curl -fsSL -o "$arch_dir/icon-512.png" \
      "https://raw.githubusercontent.com/GF-Elektro/Portal-App/main/icon-512.png" || {
      echo "Icon download failed; skipping pacman database."
      rm -rf "$arch_dir"
      return 0
    }
  fi
  cp "$ROOT/packaging/arch/PKGBUILD" "$arch_dir/PKGBUILD"
  dest_app="$arch_dir/GFElektroPortal-${version}.AppImage"
  if [ "$appimage" != "$dest_app" ]; then
    cp "$appimage" "$dest_app"
  fi
  app_sha="$(sha256sum "$dest_app" | awk '{print $1}')"
  icon_sha="$(sha256sum "$arch_dir/icon-512.png" | awk '{print $1}')"
  if ! python3 - "$arch_dir/PKGBUILD" "$version" "$app_sha" "$icon_sha" << 'PY'
import re
import sys
from pathlib import Path
path, version, app_sha, icon_sha = sys.argv[1:]
text = Path(path).read_text()
text = re.sub(r'^pkgver=.*$', f'pkgver={version}', text, count=1, flags=re.M)
text = re.sub(
    r"source=\(\n(?:[^\)]*\n)*\)",
    f'source=(\n  "GFElektroPortal-{version}.AppImage"\n  "icon-512.png"\n)',
    text,
    count=1,
    flags=re.M,
)
text = re.sub(
    r"sha256sums=\('SKIP' 'SKIP'\)",
    f"sha256sums=('{app_sha}' '{icon_sha}')",
    text,
    count=1,
)
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
    bash -lc 'pacman -Sy --noconfirm base-devel fuse2 && useradd -m builder && chown -R builder /pkg && su builder -c "cd /pkg && env PKGDEST=/pkg makepkg -f --noconfirm --noprogressbar"'; then
    echo "makepkg failed; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  pkg_file="$(find "$arch_dir" -maxdepth 2 -type f \( -name 'gfe-portal-eu-*.pkg.tar.zst' -o -name 'gfe-portal-eu-*.pkg.tar' \) | head -n 1 || true)"
  if [ -z "${pkg_file:-}" ] || [ ! -f "$pkg_file" ]; then
    echo "Package file missing after makepkg; skipping pacman database."
    rm -rf "$arch_dir"
    return 0
  fi
  mkdir -p "$SITE/arch"
  cp "$pkg_file" "$SITE/arch/"
  if ! docker run --rm -v "$SITE/arch:/pkg-out" -w /pkg-out archlinux:base-devel \
    bash -lc 'pacman -Sy --noconfirm pacman-contrib && repo-add gf-elektro.db.tar.zst gfe-portal-eu-*.pkg.tar.zst'; then
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
