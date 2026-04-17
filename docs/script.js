document.addEventListener('DOMContentLoaded', () => {
    const btnWin = document.getElementById('btn-win');
    const btnMac = document.getElementById('btn-mac');
    const btnAppImage = document.getElementById('btn-linux-appimage');
    const btnDeb = document.getElementById('btn-linux-deb');
    const osHint = document.getElementById('os-hint');

    // Basic OS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
        // macOS detected
        btnMac.classList.add('active', 'btn-primary');
        btnMac.classList.remove('btn-secondary');
        
        btnWin.classList.replace('btn-primary', 'btn-secondary');
        btnAppImage.classList.add('btn-secondary');
        btnDeb.classList.add('btn-secondary');
        
        osHint.textContent = 'Es sieht so aus, als würdest du macOS nutzen. Lade das DMG herunter.';
    } else if (userAgent.indexOf('win') !== -1) {
        // Windows detected
        btnWin.classList.add('active');
        osHint.textContent = 'Es sieht so aus, als würdest du Windows nutzen. Lade das Setup herunter.';
    } else if (userAgent.indexOf('linux') !== -1) {
        // Linux detected
        btnAppImage.classList.add('active', 'btn-primary');
        btnAppImage.classList.remove('btn-secondary');
        btnWin.classList.replace('btn-primary', 'btn-secondary');
        osHint.textContent = 'Es sieht so aus, als würdest du Linux nutzen. Nähe AppImage oder Debian Paket.';
    } else {
        // Other
        osHint.textContent = 'Bitte lade die für dein Betriebssystem passende Datei herunter.';
    }
});

