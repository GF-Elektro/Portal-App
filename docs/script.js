document.addEventListener('DOMContentLoaded', () => {
    const btnWin = document.getElementById('btn-win');
    const btnMac = document.getElementById('btn-mac');
    const btnAppImage = document.getElementById('btn-linux-appimage');
    const btnDeb = document.getElementById('btn-linux-deb');
    const osHint = document.getElementById('os-hint');

    if (btnWin && btnMac && btnAppImage && btnDeb && osHint) {
        const userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
            btnMac.classList.add('active', 'btn-primary');
            btnMac.classList.remove('btn-secondary');
            btnWin.classList.replace('btn-primary', 'btn-secondary');
            btnAppImage.classList.add('btn-secondary');
            btnDeb.classList.add('btn-secondary');
            osHint.textContent = 'Es sieht so aus, als würdest du macOS nutzen. Lade das DMG herunter.';
        } else if (userAgent.indexOf('win') !== -1) {
            btnWin.classList.add('active');
            osHint.textContent = 'Es sieht so aus, als würdest du Windows nutzen. Lade das Setup herunter.';
        } else if (userAgent.indexOf('linux') !== -1) {
            btnAppImage.classList.add('active', 'btn-primary');
            btnAppImage.classList.remove('btn-secondary');
            btnWin.classList.replace('btn-primary', 'btn-secondary');
            osHint.textContent = 'Es sieht so aus, als würdest du Linux nutzen. Wähle AppImage oder Debian-Paket.';
        } else {
            osHint.textContent = 'Bitte lade die für dein Betriebssystem passende Datei herunter.';
        }
    }

    loadDesktopVersionLabel();
    loadLatestReleaseAssets();
});

function loadDesktopVersionLabel() {
    fetch('assets/desktop-version.json')
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
            const version = document.getElementById('app-version');
            if (version && data && typeof data.version === 'string') {
                version.textContent = 'Version ' + data.version;
            }
        })
        .catch(() => {
            // Keep the hardcoded fallback in index.html.
        });
}

function loadLatestReleaseAssets() {
    fetch('https://api.github.com/repos/GF-Elektro/Portal-App/releases/latest')
        .then((response) => (response.ok ? response.json() : null))
        .then((release) => {
            if (!release || !Array.isArray(release.assets)) return;

            const assets = release.assets;
            const bySuffix = (suffix) => assets.find((asset) => asset.name.endsWith(suffix));
            const setup = assets.find((asset) => asset.name.endsWith('-Setup.exe'));

            setDownloadHref('btn-win', setup);
            setDownloadHref('btn-mac', bySuffix('.dmg'));
            setDownloadHref('btn-linux-appimage', bySuffix('.AppImage'));
            setDownloadHref('btn-linux-deb', bySuffix('.deb'));
            setDownloadHref('btn-latest-dmg', bySuffix('.dmg'));
        })
        .catch(() => {
            // Keep the hardcoded release links already in the HTML.
        });
}

function setDownloadHref(id, asset) {
    const link = document.getElementById(id);
    if (link && asset && asset.browser_download_url) {
        link.href = asset.browser_download_url;
    }
}
