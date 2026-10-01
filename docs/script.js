function osHintMessage() {
    if (window.DocsI18n && typeof window.DocsI18n.t === 'function') {
        const t = window.DocsI18n.t.bind(window.DocsI18n);
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
            return t('index.osHintMac');
        }
        if (userAgent.indexOf('win') !== -1) {
            return t('index.osHintWin');
        }
        if (userAgent.indexOf('linux') !== -1) {
            return t('index.osHintLinux');
        }
        return t('index.osHintOther');
    }
    return '';
}

function applyOsHint() {
    const osHint = document.getElementById('os-hint');
    if (!osHint) return;
    const message = osHintMessage();
    if (message) osHint.textContent = message;
}

function initOsDownloadUi() {
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
        } else if (userAgent.indexOf('win') !== -1) {
            btnWin.classList.add('active');
        } else if (userAgent.indexOf('linux') !== -1) {
            btnWin.classList.replace('btn-primary', 'btn-secondary');
            btnWin.classList.remove('active');
            btnLinux.classList.add('active', 'btn-primary');
            btnLinux.classList.remove('btn-secondary');
            setLinuxPanelOpen(true);
        }
        applyOsHint();
    } else if (osHint && window.DocsI18n) {
        const defaultHint = window.DocsI18n.t('index.osHintDefault');
        if (defaultHint) osHint.textContent = defaultHint;
    }

    applyInstallHelpHighlight();
}

function applyInstallHelpHighlight() {
    const macCard = document.getElementById('resource-card-macos');
    const chips = document.querySelectorAll('.chip-link[data-install-os]');
    if (!macCard && chips.length === 0) return;

    macCard?.classList.remove('resource-card--active');
    chips.forEach((chip) => chip.classList.remove('active'));

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
        macCard?.classList.add('resource-card--active');
    } else if (userAgent.indexOf('win') !== -1) {
        document.getElementById('chip-chocolatey')?.classList.add('active');
    } else if (userAgent.indexOf('linux') !== -1) {
        document.getElementById('chip-debian')?.classList.add('active');
        document.getElementById('chip-arch')?.classList.add('active');
    }
}

function copyCodeLabel() {
    if (window.DocsI18n && typeof window.DocsI18n.t === 'function') {
        return window.DocsI18n.t('shared.copyCode') || 'Copy';
    }
    return 'Kopieren';
}

function copyDoneLabel() {
    if (window.DocsI18n && typeof window.DocsI18n.t === 'function') {
        return window.DocsI18n.t('shared.copyDone') || 'Copied!';
    }
    return 'Kopiert!';
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            resolve();
        } catch (error) {
            reject(error);
        } finally {
            document.body.removeChild(textarea);
        }
    });
}

function refreshCodeCopyButtons() {
    document.querySelectorAll('.code-block__copy').forEach((button) => {
        if (!button.classList.contains('is-done')) {
            button.textContent = copyCodeLabel();
        }
    });
}

function initCodeBlocks() {
    document.querySelectorAll('.hero-content pre').forEach((pre) => {
        if (pre.closest('.code-block')) return;

        const block = document.createElement('div');
        block.className = 'code-block';

        const bar = document.createElement('div');
        bar.className = 'code-block__bar';

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'code-block__copy';
        copyButton.textContent = copyCodeLabel();

        copyButton.addEventListener('click', async () => {
            const text = pre.textContent.replace(/\u00a0/g, ' ').trimEnd();
            try {
                await copyTextToClipboard(text);
                copyButton.classList.add('is-done');
                copyButton.textContent = copyDoneLabel();
                window.setTimeout(() => {
                    copyButton.classList.remove('is-done');
                    copyButton.textContent = copyCodeLabel();
                }, 2000);
            } catch {
                copyButton.textContent = '…';
            }
        });

        bar.appendChild(copyButton);
        pre.parentNode.insertBefore(block, pre);
        block.appendChild(bar);
        block.appendChild(pre);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCodeBlocks();
    initOsDownloadUi();
    loadDesktopVersionLabel();
    loadLatestReleaseAssets();
});

window.addEventListener('docs:language-changed', () => {
    applyOsHint();
    loadDesktopVersionLabel();
    refreshCodeCopyButtons();
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
                const prefix =
                    window.DocsI18n && typeof window.DocsI18n.t === 'function'
                        ? window.DocsI18n.t('shared.versionPrefix')
                        : 'Version ';
                version.textContent = prefix + data.version;
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
