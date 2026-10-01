document.addEventListener('DOMContentLoaded', () => {
    const btnWin = document.getElementById('btn-win');
    const btnMac = document.getElementById('btn-mac');
    const btnLinux = document.getElementById('btn-linux');
    const linuxPanel = document.getElementById('linux-options-panel');
    const osHint = document.getElementById('os-hint');

    if (btnLinux && linuxPanel) {
        btnLinux.addEventListener('click', () => {
            const open = btnLinux.getAttribute('aria-expanded') === 'true';
            setLinuxPanelOpen(!open);
        });
    }

    if (btnWin && btnMac && btnLinux && linuxPanel && osHint) {
        const userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
            btnMac.classList.add('active', 'btn-primary');
            btnMac.classList.remove('btn-secondary');
            btnWin.classList.replace('btn-primary', 'btn-secondary');
            btnWin.classList.remove('active');
            osHint.textContent = 'Es sieht so aus, als würdest du macOS nutzen. Lade das DMG herunter.';
        } else if (userAgent.indexOf('win') !== -1) {
            btnWin.classList.add('active');
            osHint.textContent = 'Es sieht so aus, als würdest du Windows nutzen. Lade das Setup herunter.';
        } else if (userAgent.indexOf('linux') !== -1) {
            btnWin.classList.replace('btn-primary', 'btn-secondary');
            btnWin.classList.remove('active');
            btnLinux.classList.add('active', 'btn-primary');
            btnLinux.classList.remove('btn-secondary');
            setLinuxPanelOpen(true);
            osHint.textContent = 'Linux erkannt — wähle AppImage, .deb, apt oder Arch pacman.';
        } else {
            osHint.textContent = 'Bitte lade die für dein Betriebssystem passende Datei herunter.';
        }
    }

    loadDesktopVersionLabel();
    loadLatestReleaseAssets();
});

function setLinuxPanelOpen(open) {
    const btnLinux = document.getElementById('btn-linux');
    const linuxPanel = document.getElementById('linux-options-panel');
    if (!btnLinux || !linuxPanel) return;

    btnLinux.setAttribute('aria-expanded', open ? 'true' : 'false');
    linuxPanel.hidden = !open;
}

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
