document.addEventListener('DOMContentLoaded', () => {
    const btnWin = document.getElementById('btn-win');
    const btnMac = document.getElementById('btn-mac');
    const osHint = document.getElementById('os-hint');

    // Basic OS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('mac') !== -1 || userAgent.indexOf('darwin') !== -1) {
        // macOS detected
        btnMac.classList.add('active');
        btnMac.classList.add('btn-primary');
        btnMac.classList.remove('btn-secondary');
        
        btnWin.classList.add('btn-secondary');
        btnWin.classList.remove('btn-primary');
        
        // Reorder visually so Mac is first if on desktop, or just leave as is.
        // We'll just update the hint text.
        osHint.textContent = 'Es sieht so aus, als würdest du macOS nutzen. Lade das DMG herunter.';
    } else if (userAgent.indexOf('win') !== -1) {
        // Windows detected
        btnWin.classList.add('active');
        osHint.textContent = 'Es sieht so aus, als würdest du Windows nutzen. Lade das Setup herunter.';
    } else {
        // Linux / Mobile / Other
        osHint.textContent = 'Bitte lade die für dein Betriebssystem passende Datei herunter.';
    }
});
