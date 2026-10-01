'use strict';

const DOCS_DEFAULT_LANG = 'de';
const DOCS_LANG_IDS = ['sk', 'cz', 'pl', 'hu', 'de', 'uk', 'en'];

const SHARED_DE = {
  navWebsite: 'Zur Webseite',
  navHome: 'Startseite',
  footerRights: '\u00a9 2026 G&F Elektro s.r.o. \u2014 Alle Rechte vorbehalten.',
  langSwitcherLabel: 'Sprache',
  backToDownload: 'Zur\u00fcck zum Download',
  backToOverview: 'Zur\u00fcck zur \u00dcbersicht',
  versionPrefix: 'Version ',
  copyCode: 'Kopieren',
  copyDone: 'Kopiert!',
};

const INDEX_DE = {
  metaDescription:
    'Lade die offizielle G&F Portal EU Desktop App f\u00fcr Windows, macOS und Linux herunter.',
  heroEyebrow: 'Offizieller Desktop-Client',
  heroSubtitle: 'Jetzt als rasante Desktop App.',
  heroDescription:
    'Schneller Zugriff, native Benachrichtigungen und absolut ablenkungsfrei. Installiere das Portal direkt auf deinem Desktop.',
  linuxLead: 'Direkt laden oder Paketquelle nutzen:',
  linuxAppImageDesc: 'Universell, ohne Installation',
  linuxDebDesc: 'Debian-Paket zum Installieren',
  linuxAptDesc: 'apt-Repository einrichten',
  linuxArchDesc: 'pacman-Repository',
  osHintDefault: 'W\u00e4hle deine Plattform',
  osHintMac: 'Es sieht so aus, als w\u00fcrdest du macOS nutzen. Lade das DMG herunter.',
  osHintWin: 'Es sieht so aus, als w\u00fcrdest du Windows nutzen. Lade das Setup herunter.',
  osHintLinux: 'Linux erkannt \u2014 w\u00e4hle AppImage, .deb, apt oder Arch pacman.',
  osHintOther: 'Bitte lade die f\u00fcr dein Betriebssystem passende Datei herunter.',
  installResourcesTitle: 'Installation & Hilfe',
  macosCardDesc:
    'DMG \u00f6ffnen und in Programme ziehen. Signiert mit dem Apple Developer Account von G&F Elektro \u2014 keine Zertifikatsdatei n\u00f6tig.',
  chipDebian: 'Debian / Ubuntu',
  chipArch: 'Arch Linux',
  chipWindows: 'Windows (Chocolatey)',
  chipPermissions: 'Berechtigungen',
  featuresTitle: 'Warum die Desktop App?',
  featuresIntro:
    'Alles, was du im Browser kennst \u2014 mit dem Komfort einer nativen Anwendung.',
  feature1Title: 'Ablenkungsfrei',
  feature1Desc:
    'Keine Browser-Tabs, keine Lesezeichenleiste. Fokussiere dich zu 100\u00a0% auf das Portal und deine Projekte.',
  feature2Title: 'Native Benachrichtigungen',
  feature2Desc:
    'Erhalte wichtige Portal-Updates direkt \u00fcber das Info-Center von Windows oder macOS.',
  feature3Title: 'Immer griffbereit',
  feature3Desc:
    'Die App minimiert sich in den System-Tray und ist jederzeit mit nur einem Klick wieder ge\u00f6ffnet.',
  feature4Title: 'Kamera, Mikrofon & Standort',
  feature4Desc:
    'Belegfotos, Sprachdiktat und optionale GPS-Koordinaten f\u00fcr Tagesberichte \u2013 nur wenn du sie im Portal nutzt.',
  footerSource: 'Quellcode',
  footerPermissions: 'Berechtigungen',
  roadmapEyebrow: 'Aktuelles',
  roadmapTitle: 'Portal \u00fcberall \u2014 Schritt f\u00fcr Schritt',
  roadmapIntro:
    'Die Desktop-Apps f\u00fcr Windows, macOS und Linux sind da. Parallel bauen wir die nativen Mobile-Clients und bereiten die Microsoft-Store-Version vor \u2014 damit du das Portal bald auf jedem Ger\u00e4t nutzen kannst.',
  roadmapBadgeLive: 'Verf\u00fcgbar',
  roadmapBadgeReview: 'In Pr\u00fcfung',
  roadmapBadgeSoon: 'Demn\u00e4chst',
  roadmapDesktopTitle: 'Desktop',
  roadmapDesktopDesc:
    'Electron-Client mit Tray, Updates und nativen Benachrichtigungen \u2014 jetzt per Download, apt, pacman oder Chocolatey.',
  roadmapIosTitle: 'iOS (Swift)',
  roadmapIosDesc:
    'Native App f\u00fcr iPhone und iPad in Swift. Build und Upload laufen; External TestFlight und App-Store-Review sind eingereicht \u2014 Release folgt in K\u00fcrze.',
  roadmapAndroidTitle: 'Android',
  roadmapAndroidDesc:
    'Der Android-Client ist in aktiver Entwicklung \u2014 gleiche Portal-Funktionen, optimiert f\u00fcr Baustelle und unterwegs.',
  roadmapStoreTitle: 'Microsoft Store',
  roadmapStoreDesc:
    'Dieselbe Windows-Desktop-App als MSIX f\u00fcr einfache Firmen-Rollouts \u2014 Paket und Store-Einreichung sind in Vorbereitung.',
  roadmapNote:
    'Mehr zu Kamera, Mikrofon und Benachrichtigungen auf allen Plattformen: <a href="permissions.html">Berechtigungen</a>.',
};

const MACOS_DE = {
  pageTitle: 'macOS-Installation \u2013 G&F Portal EU',
  metaDescription:
    'So installierst du G&F Portal EU auf dem Mac: DMG herunterladen, in Programme ziehen \u2013 sicher signiert, ohne Zertifikatsdateien.',
  h1: 'Installation auf macOS',
  h2: 'G&F Portal EU per DMG installieren',
  intro:
    'Die Desktop-App f\u00fcr Mac wird als <strong>DMG-Datei</strong> ausgeliefert. Du installierst nur diese App \u2013 keine zus\u00e4tzlichen Zertifikats- oder Schl\u00fcsseldateien. Welche Berechtigungen die App nutzt, steht auf der <a href="permissions.html">Berechtigungsseite</a>.',
  stepsTitle: 'Schritte',
  step1: 'Lade die neueste <strong>macOS-DMG</strong> von GitHub herunter (Button unten).',
  step2: '\u00d6ffne die heruntergeladene <code>.dmg</code>-Datei (Doppelklick).',
  step3:
    'Ziehe <strong>G&F Portal EU</strong> per Drag&nbsp;&amp;&nbsp;Drop in den Ordner <strong>Programme</strong> (Applications).',
  step4: 'Werfe das DMG-Fenster weg und starte die App aus Programme oder \u00fcber Spotlight.',
  signingPara:
    'Releases, die mit dem <strong>Developer-ID-Zertifikat</strong> von G&F Elektro signiert und von Apple <strong>notarisiert</strong> sind, \u00f6ffnen ohne die Warnung \u201enicht identifizierter Entwickler\u201c. Der private Apple-Schl\u00fcssel bleibt bei G&F Elektro und wird nicht zum Download angeboten. \u00c4ltere Releases k\u00f6nnen die Warnung noch zeigen \u2014 dann die neueste DMG laden.',
  securityTitle: 'Wichtig zur Sicherheit',
  securityP1:
    'Du installierst ausschlie\u00dflich die <strong>DMG</strong> mit der App. Du installierst <strong>keinen</strong> Apple-Privatschl\u00fcssel, keine <strong>.p12</strong>-Datei und keine <strong>.p8</strong>-Datei \u2013 weder von dieser Seite noch aus E-Mails oder anderen Quellen.',
  securityP2:
    '<strong>G&F Elektro</strong> signiert die App beim Build \u00fcber die Mitgliedschaft im <strong>Apple Developer Program</strong>. Der private Developer-ID-Schl\u00fcssel wird nur intern beim Erstellen der App verwendet und ist <strong>niemals</strong> auf dieser Website oder im \u00f6ffentlichen Git-Repository ver\u00f6ffentlicht.',
  securityP3:
    'Vertraue keinen Anleitungen, die dir zum Installieren der App ein Zertifikat oder einen Schl\u00fcssel zum Herunterladen anbieten \u2013 das ist nicht n\u00f6tig und unsicher.',
  downloadBtn: 'Neueste macOS-DMG laden',
  hint:
    'Der Button f\u00fchrt zur aktuellsten GitHub-Release-Seite; dort die passende <strong>.dmg</strong> f\u00fcr Mac ausw\u00e4hlen.',
  warningTitle: 'Warnung von macOS?',
  warningP1:
    'Wenn macOS beim \u00d6ffnen noch warnt, liegt oft eine <strong>\u00e4ltere, nicht signierte</strong> Version vor. <strong>Lade die neueste Version</strong> von der GitHub-Release-Seite (Link oben) und installiere sie erneut \u2013 das ist der empfohlene Weg.',
  warningP2:
    'Bitte <strong>deaktiviere Gatekeeper nicht</strong> und nutze keine Terminal-Befehle wie <code>xattr</code> als Standard-L\u00f6sung; bei aktuellen signierten Releases sind solche Workarounds nicht n\u00f6tig.',
  warningP3:
    'Hinweis: Sehr alte, unsignierte Test-Builds ben\u00f6tigten fr\u00fcher gelegentlich einen Quarant\u00e4ne-Workaround; ab den notarisierten Developer-ID-Releases entf\u00e4llt das.',
};

const LINUX_APT_DE = {
  pageTitle: 'Linux-Installation (apt) \u2013 G&F Portal EU',
  metaDescription: 'So installierst du G&F Portal EU auf Debian und Ubuntu mit apt.',
  h1: 'Installation mit apt',
  h2: 'Debian und Ubuntu',
  intro:
    'Das Paket-Repository ist unsigniert. Deshalb steht <strong>trusted=yes</strong> in der Quelle.',
  backLink: 'Zur\u00fcck zur \u00dcbersicht',
};

const LINUX_ARCH_DE = {
  pageTitle: 'Linux-Installation (Arch) \u2013 G&F Portal EU',
  metaDescription: 'So installierst du G&F Portal EU unter Arch Linux mit pacman oder yay.',
  h1: 'Installation unter Arch',
  h2: 'pacman-Repository und AUR',
  intro:
    'Trage dieses Repository in <code>/etc/pacman.conf</code> ein. Die Datenbank ist nicht signiert (<strong>SigLevel = Optional TrustAll</strong>).',
  aurNote: 'Alternativ \u00fcber das AUR, sobald das Paket dort ver\u00f6ffentlicht ist:',
  backLink: 'Zur\u00fcck zur \u00dcbersicht',
};

const WINDOWS_CHOCO_DE = {
  pageTitle: 'Windows-Installation \u2013 G&F Portal EU',
  metaDescription: 'So installierst du G&F Portal EU unter Windows mit Chocolatey.',
  h1: 'Installation unter Windows',
  h2: 'G&F Portal EU mit Chocolatey',
  intro:
    'Mit Chocolatey installierst du die Desktop-App in einem Befehl. Das Paket hei\u00dft <strong>gfe-portal-eu</strong>.',
  backLink: 'Zur\u00fcck zur \u00dcbersicht',
};

const PERMISSIONS_DE = {
  pageTitle: 'Berechtigungen \u2013 G&F Portal EU',
  metaDescription:
    'Warum G&F Portal EU Kamera, Mikrofon, Benachrichtigungen und Zwischenablage nutzt \u2013 macOS, Windows, iOS und Android.',
  h1: 'App-Berechtigungen',
  h2: 'Warum G&F Portal EU auf deinem Ger\u00e4t fragt',
  intro:
    'Die Portal-Apps sind H\u00fcllen um <strong>portal.gfelektro.com</strong> \u2013 das Mitarbeiterportal von G&F Elektro. F\u00fcr Baustellenfotos, Diktat, Chat-Benachrichtigungen und Einf\u00fcgen aus der Zwischenablage braucht das Betriebssystem deine Zustimmung.',
  macTitle: 'macOS-App',
  macLi1: '<strong>Kamera</strong> \u2013 Belegfotos und Fotodokumentation auf der Baustelle.',
  macLi2:
    '<strong>Mikrofon</strong> \u2013 Sprachnachrichten, Diktat und Audiofunktionen (z.&nbsp;B. f\u00fcr Admins).',
  macLi3: '<strong>Standort (optional)</strong> \u2013 nur wenn du GPS in Tagesberichten aktivierst.',
  macLi4: '<strong>Benachrichtigungen</strong> \u2013 neue Nachrichten und Hinweise wie bei E-Mail oder SMS.',
  macLi5: '<strong>Zwischenablage</strong> \u2013 Text einf\u00fcgen in Formularen im Portal.',
  macFooter:
    'Installation nur \u00fcber die <strong>DMG</strong> \u2013 siehe <a href="macos-install.html">macOS-Installationsanleitung</a>. Du l\u00e4dst <strong>kein</strong> Apple-Zertifikat und <strong>keinen</strong> privaten Schl\u00fcssel herunter; die App ist signiert und notarisiert.',
  winTitle: 'Windows-App',
  winLi1: 'Gleiche Zwecke: Kamera, Mikrofon, Benachrichtigungen, Zwischenablage.',
  winLi2:
    'Wenn Windows Mikrofon oder Kamera blockiert, bietet die App einen Dialog mit Link zu den <strong>Datenschutz-Einstellungen</strong>.',
  winLi3:
    'Benachrichtigungen laufen \u00fcber die Windows-Mitteilungszentrale (App-ID <code>com.gfelektro.portal</code>).',
  iosTitle: 'iOS-App (TestFlight / App Store)',
  iosBody:
    'Dieselben Funktionen \u00fcber die Systemdialoge von Apple. Benachrichtigungen erscheinen in der <strong>Mitteilungszentrale</strong>. Die App ist kein generischer Browser, sondern der offizielle Mitarbeiter-Client f\u00fcr das Portal.',
  androidTitle: 'Android-App',
  androidBody:
    'Kamera und Fotos f\u00fcr Baustellen-Uploads, Mikrofon f\u00fcr Diktat, Benachrichtigungen ab Android\u00a013 mit expliziter Erlaubnis. Wichtige Hinweise werden als System-Benachrichtigungen angezeigt.',
  storeTitle: 'Microsoft Store (geplant)',
  storeBody:
    'Dieselbe Windows-Desktop-App, sp\u00e4ter \u00fcber den Store verteilt. Das MSIX-Paket braucht u.&nbsp;a. <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> und optional <code>location</code>. Details: <a href="microsoft-store.html">Microsoft Store</a>.',
  devNote:
    'Technische Details zur nativen Schnittstelle (Entwickler): <a href="native-shell-bridge.html">Native Shell Bridge</a>.',
  backBtn: 'Zur\u00fcck zum Download',
};

function buildLocale(shared, index, macos, linuxApt, linuxArch, windowsChoco, permissions) {
  return {
    shared,
    index,
    macos,
    linuxApt,
    linuxArch,
    windowsChoco,
    permissions,
  };
}

const SHARED_CZ = {
  "navWebsite": "Na web",
  "navHome": "Domů",
  "footerRights": "© 2026 G&F Elektro s.r.o. — Všechna práva vyhrazena.",
  "langSwitcherLabel": "Jazyk",
  "backToDownload": "Zpět na stažení",
  "backToOverview": "Zpět na přehled",
  "versionPrefix": "Verze ",
  "copyCode": "Kopírovat",
  "copyDone": "Zkopírováno!"
};
const INDEX_CZ = {
  "metaDescription": "Stáhni si oficiální desktopovou aplikaci G&F Portal EU pro Windows, macOS a Linux.",
  "heroEyebrow": "Oficiální desktopový klient",
  "heroSubtitle": "Teď jako rychlá desktopová aplikace.",
  "heroDescription": "Rychlý přístup, nativní oznámení a žádné rozptylování. Nainstaluj portál přímo na počítač.",
  "linuxLead": "Stáhnout přímo nebo použít balíčkový zdroj:",
  "linuxAppImageDesc": "Univerzální, bez instalace",
  "linuxDebDesc": "Debian balíček k instalaci",
  "linuxAptDesc": "Nastavit apt repozitář",
  "linuxArchDesc": "pacman repozitář",
  "osHintDefault": "Vyber si platformu",
  "osHintMac": "Vypadá to, že používáš macOS. Stáhni si DMG.",
  "osHintWin": "Vypadá to, že používáš Windows. Stáhni si instalátor.",
  "osHintLinux": "Linux rozpoznán — vyber AppImage, .deb, apt nebo Arch pacman.",
  "osHintOther": "Stáhni soubor vhodný pro tvůj operační systém.",
  "installResourcesTitle": "Instalace a nápověda",
  "macosCardDesc": "Otevři DMG a přetáhni do Aplikací. Podepsáno Apple Developer účtem G&F Elektro — není potřeba soubor certifikátu.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Oprávnění",
  "featuresTitle": "Proč desktopová aplikace?",
  "featuresIntro": "Vše, co znáš z prohlížeče — s pohodlím nativní aplikace.",
  "feature1Title": "Bez rozptylování",
  "feature1Desc": "Žádné karty prohlížeče, žádný panel záložek. Soustřeď se na portál a své projekty.",
  "feature2Title": "Nativní oznámení",
  "feature2Desc": "Důležité aktualizace portálu přímo přes centrum oznámení Windows nebo macOS.",
  "feature3Title": "Vždy po ruce",
  "feature3Desc": "Aplikace se minimalizuje do systémové lišty a otevřeš ji jedním klikem.",
  "feature4Title": "Kamera, mikrofon a poloha",
  "feature4Desc": "Fotky dokladů, hlasové diktování a volitelné GPS v denních výkazech — jen když je v portálu používáš.",
  "footerSource": "Zdrojový kód",
  "footerPermissions": "Oprávnění",
  "roadmapEyebrow": "Novinky",
  "roadmapTitle": "Portál všude — krok za krokem",
  "roadmapIntro": "Desktopové aplikace pro Windows, macOS a Linux už jsou tady. Paralelně vyvíjíme nativní mobilní klienty a připravujeme verzi pro Microsoft Store — brzy portál na každém zařízení.",
  "roadmapBadgeLive": "K dispozici",
  "roadmapBadgeReview": "V recenzi",
  "roadmapBadgeSoon": "Již brzy",
  "roadmapDesktopTitle": "Desktop",
  "roadmapDesktopDesc": "Electron klient s tray, aktualizacemi a nativními oznámeními — stáhni přes instalátor, apt, pacman nebo Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Nativní aplikace pro iPhone a iPad ve Swiftu. Buildy běží; external TestFlight a App Store review jsou odeslané — vydání brzy.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "Android klient je v aktivním vývoji — stejné funkce portálu, vyladěné pro stavbu a cestu.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "Stejná windows desktopová app jako MSIX pro firemní nasazení — balení a odeslání do obchodu probíhá.",
  "roadmapNote": "Více o kameře, mikrofonu a oznámeních na všech platformách: <a href=\"permissions.html\">Oprávnění</a>."
};
const MACOS_CZ = {
  "pageTitle": "Instalace macOS – G&F Portal EU",
  "metaDescription": "Jak nainstalovat G&F Portal EU na Mac: stáhnout DMG, přetáhnout do Aplikací — bezpečně podepsáno, bez certifikátů.",
  "h1": "Instalace na macOS",
  "h2": "G&F Portal EU přes DMG",
  "intro": "Desktopová aplikace pro Mac se dodává jako <strong>soubor DMG</strong>. Instaluješ jen tuto aplikaci — žádné další certifikáty ani klíče. Jaká oprávnění aplikace používá, je na <a href=\"permissions.html\">stránce oprávnění</a>.",
  "stepsTitle": "Kroky",
  "step1": "Stáhni nejnovější <strong>macOS DMG</strong> z GitHubu (tlačítko níže).",
  "step2": "Otevři stažený soubor <code>.dmg</code> (dvojklik).",
  "step3": "Přetáhni <strong>G&F Portal EU</strong> do složky <strong>Aplikace</strong> (Applications).",
  "step4": "Zavři okno DMG a spusť aplikaci z Aplikací nebo přes Spotlight.",
  "signingPara": "Verze podepsané <strong>Developer ID certifikátem</strong> G&F Elektro a <strong>notarizované</strong> Apple se otevřou bez varování „neidentifikovaný vývojář“. Soukromý Apple klíč zůstává u G&F Elektro a není ke stažení. Starší verze mohou varovat — stáhni nejnovější DMG.",
  "securityTitle": "Důležité k bezpečnosti",
  "securityP1": "Instaluješ jen <strong>DMG</strong> s aplikací. Neinstaluješ <strong>soukromý</strong> Apple klíč, soubor <strong>.p12</strong> ani <strong>.p8</strong> — ani z této stránky, e-mailu ani jiných zdrojů.",
  "securityP2": "<strong>G&F Elektro</strong> aplikaci při buildu podepisuje díky členství v <strong>Apple Developer Program</strong>. Soukromý Developer ID klíč se používá jen interně a <strong>nikdy</strong> není na této stránce ani ve veřejném Git repozitáři.",
  "securityP3": "Nedůvěřuj návodům, které na instalaci žádají stáhnout certifikát nebo klíč — to není potřeba a není bezpečné.",
  "downloadBtn": "Stáhnout nejnovější macOS DMG",
  "hint": "Tlačítko vede na nejnovější GitHub release stránku; tam vyber vhodné <strong>.dmg</strong> pro Mac.",
  "warningTitle": "Varování od macOS?",
  "warningP1": "Pokud macOS při otevírání stále varuje, často máš <strong>starší, nepodepsanou</strong> verzi. <strong>Stáhni nejnovější verzi</strong> z GitHub release (odkaz výše) a znovu nainstaluj — to je doporučený postup.",
  "warningP2": "Prosím <strong>nevypínej Gatekeeper</strong> a nepoužívej příkazy jako <code>xattr</code> jako standardní řešení; u aktuálních podepsaných verzí to není potřeba.",
  "warningP3": "Poznámka: Velmi staré nepodepsané testovací buildy občas potřebovaly obejití karantény; u notarizovaných Developer ID verzí to už neplatí."
};
const LINUX_APT_CZ = {
  "pageTitle": "Instalace Linux (apt) – G&F Portal EU",
  "metaDescription": "Jak nainstalovat G&F Portal EU na Debian a Ubuntu přes apt.",
  "h1": "Instalace přes apt",
  "h2": "Debian a Ubuntu",
  "intro": "Balíčkový repozitář není podepsaný. Proto je ve zdroji uvedeno <strong>trusted=yes</strong>.",
  "backLink": "Zpět na přehled"
};
const LINUX_ARCH_CZ = {
  "pageTitle": "Instalace Linux (Arch) – G&F Portal EU",
  "metaDescription": "Jak nainstalovat G&F Portal EU na Arch Linux přes pacman nebo yay.",
  "h1": "Instalace na Arch",
  "h2": "pacman repozitář a AUR",
  "intro": "Přidej tento repozitář do <code>/etc/pacman.conf</code>. Databáze není podepsaná (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Alternativně přes AUR, až bude balíček tam zveřejněn:",
  "backLink": "Zpět na přehled"
};
const WINDOWS_CHOCO_CZ = {
  "pageTitle": "Instalace Windows – G&F Portal EU",
  "metaDescription": "Jak nainstalovat G&F Portal EU na Windows přes Chocolatey.",
  "h1": "Instalace na Windows",
  "h2": "G&F Portal EU s Chocolatey",
  "intro": "S Chocolatey nainstaluješ desktopovou aplikaci jedním příkazem. Balíček se jmenuje <strong>gfe-portal-eu</strong>.",
  "backLink": "Zpět na přehled"
};
const PERMISSIONS_CZ = {
  "pageTitle": "Oprávnění – G&F Portal EU",
  "metaDescription": "Proč G&F Portal EU používá kameru, mikrofon, oznámení a schránku — macOS, Windows, iOS a Android.",
  "h1": "Oprávnění aplikace",
  "h2": "Proč G&F Portal EU ptá na tvém zařízení",
  "intro": "Aplikace portálu jsou obaly kolem <strong>portal.gfelektro.com</strong> — zaměstnaneckého portálu G&F Elektro. Na fotky ze stavby, diktování, chatová oznámení a vkládání ze schránky potřebuje systém tvůj souhlas.",
  "macTitle": "macOS aplikace",
  "macLi1": "<strong>Kamera</strong> — fotky dokladů a fotodokumentace na stavbě.",
  "macLi2": "<strong>Mikrofon</strong> — hlasové zprávy, diktování a audio funkce (např. pro adminy).",
  "macLi3": "<strong>Poloha (volitelné)</strong> — jen pokud zapneš GPS v denních výkazech.",
  "macLi4": "<strong>Oznámení</strong> — nové zprávy a upozornění jako u e-mailu nebo SMS.",
  "macLi5": "<strong>Schránka</strong> — vkládání textu do formulářů v portálu.",
  "macFooter": "Instalace jen přes <strong>DMG</strong> — viz <a href=\"macos-install.html\">návod pro macOS</a>. Nestahuješ <strong>žádný</strong> Apple certifikát ani <strong>soukromý</strong> klíč; aplikace je podepsaná a notarizovaná.",
  "winTitle": "Windows aplikace",
  "winLi1": "Stejné účely: kamera, mikrofon, oznámení, schránka.",
  "winLi2": "Pokud Windows zablokuje mikrofon nebo kameru, aplikace zobrazí dialog s odkazem na <strong>nastavení soukromí</strong>.",
  "winLi3": "Oznámení jdou přes centrum oznámení Windows (ID aplikace <code>com.gfelektro.portal</code>).",
  "iosTitle": "iOS aplikace (TestFlight / App Store)",
  "iosBody": "Stejné funkce přes systémové dialogy Apple. Oznámení se zobrazí v <strong>centru oznámení</strong>. Aplikace není obecný prohlížeč, ale oficiální zaměstnanecký klient portálu.",
  "androidTitle": "Android aplikace",
  "androidBody": "Kamera a fotky pro nahrávání ze stavby, mikrofon pro diktování, od Androidu 13 oznámení s výslovným souhlasem. Důležité zprávy jako systémová oznámení.",
  "storeTitle": "Microsoft Store (plánováno)",
  "storeBody": "Stejná Windows desktopová aplikace, později přes Store. Balíček MSIX potřebuje mimo jiné <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> a volitelně <code>location</code>. Podrobnosti: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Technické detaily nativního mostu (vývojáři): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Zpět na stažení"
};
const SHARED_EN = {
  "navWebsite": "Visit website",
  "navHome": "Home",
  "footerRights": "© 2026 G&F Elektro s.r.o. — All rights reserved.",
  "langSwitcherLabel": "Language",
  "backToDownload": "Back to download",
  "backToOverview": "Back to overview",
  "versionPrefix": "Version ",
  "copyCode": "Copy",
  "copyDone": "Copied!"
};
const INDEX_EN = {
  "metaDescription": "Download the official G&F Portal EU desktop app for Windows, macOS, and Linux.",
  "heroEyebrow": "Official desktop client",
  "heroSubtitle": "Now as a fast desktop app.",
  "heroDescription": "Quick access, native notifications, and zero distractions. Install the portal directly on your desktop.",
  "linuxLead": "Download directly or use a package source:",
  "linuxAppImageDesc": "Universal, no installation required",
  "linuxDebDesc": "Debian package for installation",
  "linuxAptDesc": "Set up apt repository",
  "linuxArchDesc": "pacman repository",
  "osHintDefault": "Choose your platform",
  "osHintMac": "It looks like you are using macOS. Download the DMG.",
  "osHintWin": "It looks like you are using Windows. Download the installer.",
  "osHintLinux": "Linux detected — choose AppImage, .deb, apt, or Arch pacman.",
  "osHintOther": "Please download the file that matches your operating system.",
  "installResourcesTitle": "Installation & help",
  "macosCardDesc": "Open the DMG and drag to Applications. Signed with G&F Elektro’s Apple Developer account — no certificate file required.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Permissions",
  "featuresTitle": "Why the desktop app?",
  "featuresIntro": "Everything you know from the browser — with the comfort of a native application.",
  "feature1Title": "Distraction-free",
  "feature1Desc": "No browser tabs, no bookmark bar. Stay 100% focused on the portal and your projects.",
  "feature2Title": "Native notifications",
  "feature2Desc": "Get important portal updates through the Windows or macOS notification center.",
  "feature3Title": "Always at hand",
  "feature3Desc": "The app minimizes to the system tray and is one click away whenever you need it.",
  "feature4Title": "Camera, microphone & location",
  "feature4Desc": "Receipt photos, voice dictation, and optional GPS coordinates for daily reports — only when you use them in the portal.",
  "footerSource": "Source code",
  "footerPermissions": "Permissions",
  "roadmapEyebrow": "Latest",
  "roadmapTitle": "Portal everywhere — step by step",
  "roadmapIntro": "Desktop apps for Windows, macOS, and Linux are ready today. We are building native mobile clients and preparing the Microsoft Store release so you can use the portal on every device soon.",
  "roadmapBadgeLive": "Available",
  "roadmapBadgeReview": "In review",
  "roadmapBadgeSoon": "Coming soon",
  "roadmapDesktopTitle": "Desktop",
  "roadmapDesktopDesc": "Electron client with tray, updates, and native notifications — download now via direct installer, apt, pacman, or Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Native iPhone and iPad app in Swift. Builds are shipping; external TestFlight and App Store review are submitted — release is coming soon.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "The Android client is in active development — same portal features, tuned for the job site and on the go.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "The same Windows desktop app as MSIX for easy company rollouts — packaging and store submission are in progress.",
  "roadmapNote": "Learn more about camera, microphone, and notifications on every platform: <a href=\"permissions.html\">Permissions</a>."
};
const MACOS_EN = {
  "pageTitle": "macOS installation – G&F Portal EU",
  "metaDescription": "How to install G&F Portal EU on Mac: download the DMG, drag to Applications — securely signed, no certificate files.",
  "h1": "Installation on macOS",
  "h2": "Install G&F Portal EU via DMG",
  "intro": "The Mac desktop app is delivered as a <strong>DMG file</strong>. You only install this app — no extra certificate or key files. Which permissions the app uses is explained on the <a href=\"permissions.html\">permissions page</a>.",
  "stepsTitle": "Steps",
  "step1": "Download the latest <strong>macOS DMG</strong> from GitHub (button below).",
  "step2": "Open the downloaded <code>.dmg</code> file (double-click).",
  "step3": "Drag <strong>G&F Portal EU</strong> into the <strong>Applications</strong> folder.",
  "step4": "Close the DMG window and launch the app from Applications or Spotlight.",
  "signingPara": "Releases signed with G&F Elektro’s <strong>Developer ID certificate</strong> and <strong>notarized</strong> by Apple open without the “unidentified developer” warning. The private Apple key stays with G&F Elektro and is not offered for download. Older releases may still show the warning — download the latest DMG.",
  "securityTitle": "Important security information",
  "securityP1": "You install only the app <strong>DMG</strong>. You do <strong>not</strong> install an Apple private key, any <strong>.p12</strong> file, or any <strong>.p8</strong> file — not from this site, email, or other sources.",
  "securityP2": "<strong>G&F Elektro</strong> signs the app at build time through membership in the <strong>Apple Developer Program</strong>. The private Developer ID key is used only internally when building the app and is <strong>never</strong> published on this website or in the public Git repository.",
  "securityP3": "Do not trust instructions that ask you to download a certificate or key to install the app — that is unnecessary and unsafe.",
  "downloadBtn": "Download latest macOS DMG",
  "hint": "The button opens the latest GitHub release page; choose the appropriate <strong>.dmg</strong> for Mac there.",
  "warningTitle": "Warning from macOS?",
  "warningP1": "If macOS still warns when opening, you often have an <strong>older, unsigned</strong> version. <strong>Download the latest version</strong> from the GitHub release page (link above) and install again — that is the recommended approach.",
  "warningP2": "Please do <strong>not disable Gatekeeper</strong> and do not use Terminal commands such as <code>xattr</code> as your default fix; current signed releases do not need such workarounds.",
  "warningP3": "Note: Very old unsigned test builds occasionally needed a quarantine workaround; notarized Developer ID releases no longer require it."
};
const LINUX_APT_EN = {
  "pageTitle": "Linux installation (apt) – G&F Portal EU",
  "metaDescription": "How to install G&F Portal EU on Debian and Ubuntu with apt.",
  "h1": "Installation with apt",
  "h2": "Debian and Ubuntu",
  "intro": "The package repository is unsigned. That is why the source line includes <strong>trusted=yes</strong>.",
  "backLink": "Back to overview"
};
const LINUX_ARCH_EN = {
  "pageTitle": "Linux installation (Arch) – G&F Portal EU",
  "metaDescription": "How to install G&F Portal EU on Arch Linux with pacman or yay.",
  "h1": "Installation on Arch",
  "h2": "pacman repository and AUR",
  "intro": "Add this repository to <code>/etc/pacman.conf</code>. The database is not signed (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Alternatively via the AUR once the package is published there:",
  "backLink": "Back to overview"
};
const WINDOWS_CHOCO_EN = {
  "pageTitle": "Windows installation – G&F Portal EU",
  "metaDescription": "How to install G&F Portal EU on Windows with Chocolatey.",
  "h1": "Installation on Windows",
  "h2": "G&F Portal EU with Chocolatey",
  "intro": "With Chocolatey you install the desktop app in one command. The package name is <strong>gfe-portal-eu</strong>.",
  "backLink": "Back to overview"
};
const PERMISSIONS_EN = {
  "pageTitle": "Permissions – G&F Portal EU",
  "metaDescription": "Why G&F Portal EU uses camera, microphone, notifications, and clipboard — macOS, Windows, iOS, and Android.",
  "h1": "App permissions",
  "h2": "Why G&F Portal EU asks on your device",
  "intro": "The portal apps are shells around <strong>portal.gfelektro.com</strong> — the G&F Elektro employee portal. For site photos, dictation, chat notifications, and paste from the clipboard, the operating system needs your consent.",
  "macTitle": "macOS app",
  "macLi1": "<strong>Camera</strong> — receipt photos and photo documentation on site.",
  "macLi2": "<strong>Microphone</strong> — voice messages, dictation, and audio features (e.g. for admins).",
  "macLi3": "<strong>Location (optional)</strong> — only if you enable GPS in daily reports.",
  "macLi4": "<strong>Notifications</strong> — new messages and alerts like email or SMS.",
  "macLi5": "<strong>Clipboard</strong> — paste text into forms in the portal.",
  "macFooter": "Install only via the <strong>DMG</strong> — see the <a href=\"macos-install.html\">macOS installation guide</a>. You do <strong>not</strong> download an Apple certificate or private key; the app is signed and notarized.",
  "winTitle": "Windows app",
  "winLi1": "Same purposes: camera, microphone, notifications, clipboard.",
  "winLi2": "If Windows blocks microphone or camera, the app shows a dialog with a link to <strong>Privacy settings</strong>.",
  "winLi3": "Notifications use the Windows notification center (app ID <code>com.gfelektro.portal</code>).",
  "iosTitle": "iOS app (TestFlight / App Store)",
  "iosBody": "The same features through Apple’s system dialogs. Notifications appear in the <strong>Notification Center</strong>. The app is not a generic browser but the official employee client for the portal.",
  "androidTitle": "Android app",
  "androidBody": "Camera and photos for site uploads, microphone for dictation, notifications from Android 13 onward with explicit permission. Important alerts appear as system notifications.",
  "storeTitle": "Microsoft Store (planned)",
  "storeBody": "The same Windows desktop app, distributed via the Store later. The MSIX package requires <code>internetClient</code>, <code>microphone</code>, <code>webcam</code>, and optionally <code>location</code>. Details: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Technical details on the native bridge (developers): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Back to download"
};
const SHARED_HU = {
  "navWebsite": "Weboldal",
  "navHome": "Kezdőlap",
  "footerRights": "© 2026 G&F Elektro s.r.o. — Minden jog fenntartva.",
  "langSwitcherLabel": "Nyelv",
  "backToDownload": "Vissza a letöltéshez",
  "backToOverview": "Vissza az áttekintéshez",
  "versionPrefix": "Verzió ",
  "copyCode": "Másolás",
  "copyDone": "Másolva!"
};
const INDEX_HU = {
  "metaDescription": "Töltsd le a hivatalos G&F Portal EU asztali alkalmazást Windowsra, macOS-re és Linuxra.",
  "heroEyebrow": "Hivatalos asztali kliens",
  "heroSubtitle": "Most gyors asztali alkalmazásként.",
  "heroDescription": "Gyors hozzáférés, natív értesítések és zéró zavaró tényező. Telepítsd a portált közvetlenül az asztalodra.",
  "linuxLead": "Letöltés közvetlenül vagy csomagforrás használata:",
  "linuxAppImageDesc": "Univerzális, telepítés nélkül",
  "linuxDebDesc": "Debian csomag telepítéshez",
  "linuxAptDesc": "apt tároló beállítása",
  "linuxArchDesc": "pacman tároló",
  "osHintDefault": "Válaszd ki a platformodat",
  "osHintMac": "Úgy tűnik, macOS-et használsz. Töltsd le a DMG-t.",
  "osHintWin": "Úgy tűnik, Windowst használsz. Töltsd le a telepítőt.",
  "osHintLinux": "Linux észlelve — válassz AppImage-et, .deb-et, apt-et vagy Arch pacman-et.",
  "osHintOther": "Töltsd le az operációs rendszerednek megfelelő fájlt.",
  "installResourcesTitle": "Telepítés és súgó",
  "macosCardDesc": "Nyisd meg a DMG-t, és húzd az Alkalmazások mappába. A G&F Elektro Apple Developer fiókjával aláírva — nincs szükség tanúsítványfájlra.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Engedélyek",
  "featuresTitle": "Miért az asztali alkalmazás?",
  "featuresIntro": "Minden, amit a böngészőből ismersz — natív alkalmazás kényelmével.",
  "feature1Title": "Zavarásmentes",
  "feature1Desc": "Nincs böngészőlap, nincs könyvjelzősáv. Fókuszálj teljesen a portálra és a projekteidre.",
  "feature2Title": "Natív értesítések",
  "feature2Desc": "Fontos portálfrissítések közvetlenül a Windows vagy macOS értesítési központjában.",
  "feature3Title": "Mindig kéznél",
  "feature3Desc": "Az alkalmazás a tálcára minimalizálódik, és egy kattintással újra megnyitható.",
  "feature4Title": "Kamera, mikrofon és hely",
  "feature4Desc": "Bizonylatfotók, hangdiktálás és opcionális GPS a napi jelentésekhez — csak ha a portálban használod.",
  "footerSource": "Forráskód",
  "footerPermissions": "Engedélyek",
  "roadmapEyebrow": "Hírek",
  "roadmapTitle": "Portál mindenhol — lépésről lépésre",
  "roadmapIntro": "A Windows, macOS és Linux asztali appok már elérhetők. Párhuzamosan készülnek a natív mobil kliensek és a Microsoft Store kiadás — hamarosan minden eszközön.",
  "roadmapBadgeLive": "Elérhető",
  "roadmapBadgeReview": "Felülvizsgálat alatt",
  "roadmapBadgeSoon": "Hamarosan",
  "roadmapDesktopTitle": "Asztali",
  "roadmapDesktopDesc": "Electron kliens tálcával, frissítésekkel és natív értesítésekkel — letöltés, apt, pacman vagy Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Natív iPhone és iPad app Swiftben. A buildek futnak; external TestFlight és App Store felülvizsgálat benyújtva — a kiadás hamarosan.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "Az Android kliens aktív fejlesztés alatt — ugyanaz a portál, építkezésre és útközben optimalizálva.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "Ugyanaz a Windows asztali app MSIX-ben vállalati telepítéshez — csomagolás és Store beküldés folyamatban.",
  "roadmapNote": "Kamera, mikrofon és értesítések minden platformon: <a href=\"permissions.html\">Engedélyek</a>."
};
const MACOS_HU = {
  "pageTitle": "macOS telepítés – G&F Portal EU",
  "metaDescription": "G&F Portal EU telepítése Macen: DMG letöltése, húzás az Alkalmazásokba — biztonságosan aláírva, tanúsítványfájlok nélkül.",
  "h1": "Telepítés macOS-en",
  "h2": "G&F Portal EU DMG-vel",
  "intro": "A Mac asztali alkalmazás <strong>DMG fájlban</strong> érkezik. Csak ezt az alkalmazást telepíted — nincs extra tanúsítvány vagy kulcsfájl. Az alkalmazás engedélyeiről az <a href=\"permissions.html\">engedélyek oldalon</a> olvashatsz.",
  "stepsTitle": "Lépések",
  "step1": "Töltsd le a legújabb <strong>macOS DMG</strong>-t a GitHubról (gomb lent).",
  "step2": "Nyisd meg a letöltött <code>.dmg</code> fájlt (dupla kattintás).",
  "step3": "Húzd a <strong>G&F Portal EU</strong> alkalmazást az <strong>Alkalmazások</strong> (Applications) mappába.",
  "step4": "Zárd be a DMG ablakot, és indítsd az alkalmazást az Alkalmazásokból vagy Spotlightból.",
  "signingPara": "A G&F Elektro <strong>Developer ID tanúsítványával</strong> aláírt és Apple által <strong>notarizált</strong> kiadások az „azonosítatlan fejlesztő” figyelmeztetés nélkül nyílnak meg. A privát Apple kulcs a G&F Elektro-nál marad, letöltésre nem kínáljuk. Régebbi kiadások még figyelmeztethetnek — töltsd le a legújabb DMG-t.",
  "securityTitle": "Fontos biztonsági információ",
  "securityP1": "Kizárólag az alkalmazás <strong>DMG</strong>-jét telepíted. Nem telepítesz Apple privát kulcsot, <strong>.p12</strong> vagy <strong>.p8</strong> fájlt — sem erről az oldalról, e-mailből vagy más forrásból.",
  "securityP2": "A <strong>G&F Elektro</strong> az alkalmazást build közben írja alá az <strong>Apple Developer Program</strong> tagságával. A privát Developer ID kulcs csak belsőleg használatos, és <strong>soha</strong> nem jelenik meg ezen a weboldalon vagy a nyilvános Git tárolóban.",
  "securityP3": "Ne bízz olyan útmutatókban, amelyek tanúsítvány vagy kulcs letöltését kérik a telepítéshez — ez nem szükséges és nem biztonságos.",
  "downloadBtn": "Legújabb macOS DMG letöltése",
  "hint": "A gomb a legfrissebb GitHub release oldalra visz; ott válaszd ki a Machez illő <strong>.dmg</strong> fájlt.",
  "warningTitle": "Figyelmeztetés macOS-től?",
  "warningP1": "Ha macOS még mindig figyelmeztet megnyitáskor, gyakran egy <strong>régebbi, alá nem írt</strong> verziód van. <strong>Töltsd le a legújabb verziót</strong> a GitHub release oldalról (fenti link), és telepítsd újra — ez az ajánlott út.",
  "warningP2": "Kérjük, <strong>ne kapcsold ki a Gatekeeperet</strong>, és ne használj olyan terminálparancsokat, mint az <code>xattr</code> alapértelmezett megoldásként; a jelenlegi aláírt kiadásokhoz nincs szükség ilyen trükkökre.",
  "warningP3": "Megjegyzés: Nagyon régi, alá nem írt teszt buildekhez néha karantén-megkerülés kellett; a notarizált Developer ID kiadásoktól kezdve ez már nem."
};
const LINUX_APT_HU = {
  "pageTitle": "Linux telepítés (apt) – G&F Portal EU",
  "metaDescription": "G&F Portal EU telepítése Debianon és Ubuntun apt-tel.",
  "h1": "Telepítés apt-tel",
  "h2": "Debian és Ubuntu",
  "intro": "A csomagtároló nincs aláírva. Ezért a forrásban <strong>trusted=yes</strong> áll.",
  "backLink": "Vissza az áttekintéshez"
};
const LINUX_ARCH_HU = {
  "pageTitle": "Linux telepítés (Arch) – G&F Portal EU",
  "metaDescription": "G&F Portal EU telepítése Arch Linuxon pacman-nel vagy yay-jal.",
  "h1": "Telepítés Archon",
  "h2": "pacman tároló és AUR",
  "intro": "Add hozzá ezt a tárolót a <code>/etc/pacman.conf</code> fájlhoz. Az adatbázis nincs aláírva (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Alternatívaként az AUR-on, amint a csomag ott megjelenik:",
  "backLink": "Vissza az áttekintéshez"
};
const WINDOWS_CHOCO_HU = {
  "pageTitle": "Windows telepítés – G&F Portal EU",
  "metaDescription": "G&F Portal EU telepítése Windows-on Chocolatey-vel.",
  "h1": "Telepítés Windows-on",
  "h2": "G&F Portal EU Chocolatey-vel",
  "intro": "Chocolatey-vel egy paranccsal telepítheted az asztali alkalmazást. A csomag neve: <strong>gfe-portal-eu</strong>.",
  "backLink": "Vissza az áttekintéshez"
};
const PERMISSIONS_HU = {
  "pageTitle": "Engedélyek – G&F Portal EU",
  "metaDescription": "Miért használ a G&F Portal EU kamerát, mikrofont, értesítéseket és vágólapot — macOS, Windows, iOS és Android.",
  "h1": "Alkalmazásengedélyek",
  "h2": "Miért kérdez a G&F Portal EU az eszközödön",
  "intro": "A portálalkalmazások a <strong>portal.gfelektro.com</strong> körül épülnek — a G&F Elektro munkatársi portálja. Építési fotókhoz, diktáláshoz, chatértesítésekhez és vágólapról beillesztéshez az operációs rendszernek szüksége van a hozzájárulásodra.",
  "macTitle": "macOS alkalmazás",
  "macLi1": "<strong>Kamera</strong> — bizonylatfotók és fotódokumentáció a helyszínen.",
  "macLi2": "<strong>Mikrofon</strong> — hangüzenetek, diktálás és hangfunkciók (pl. adminoknak).",
  "macLi3": "<strong>Hely (opcionális)</strong> — csak ha GPS-t engedélyezed a napi jelentésekben.",
  "macLi4": "<strong>Értesítések</strong> — új üzenetek és figyelmeztetések, mint e-mail vagy SMS.",
  "macLi5": "<strong>Vágólap</strong> — szöveg beillesztése űrlapokba a portálban.",
  "macFooter": "Telepítés csak a <strong>DMG</strong>-vel — lásd a <a href=\"macos-install.html\">macOS telepítési útmutatót</a>. Nem töltesz le <strong>Apple tanúsítványt</strong> és <strong>privát kulcsot</strong>; az alkalmazás aláírt és notarizált.",
  "winTitle": "Windows alkalmazás",
  "winLi1": "Ugyanazok a célok: kamera, mikrofon, értesítések, vágólap.",
  "winLi2": "Ha a Windows blokkolja a mikrofont vagy a kamerát, az alkalmazás párbeszédablakot mutat linkkel az <strong>adatvédelmi beállításokhoz</strong>.",
  "winLi3": "Az értesítések a Windows értesítési központján futnak (alkalmazásazonosító: <code>com.gfelektro.portal</code>).",
  "iosTitle": "iOS alkalmazás (TestFlight / App Store)",
  "iosBody": "Ugyanazok a funkciók az Apple rendszerpárbeszédein keresztül. Az értesítések az <strong>Értesítésközpontban</strong> jelennek meg. Nem általános böngésző, hanem a portál hivatalos munkatársi kliense.",
  "androidTitle": "Android alkalmazás",
  "androidBody": "Kamera és fotók helyszíni feltöltésekhez, mikrofon diktáláshoz, Android 13-tól értesítések kifejezett engedéllyel. Fontos üzenetek rendszerértesítésként.",
  "storeTitle": "Microsoft Store (tervezett)",
  "storeBody": "Ugyanaz a Windows asztali alkalmazás, később a Store-on keresztül. Az MSIX csomagnak többek között <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> és opcionálisan <code>location</code> kell. Részletek: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Technikai részletek a natív hídról (fejlesztőknek): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Vissza a letöltéshez"
};
const SHARED_PL = {
  "navWebsite": "Strona WWW",
  "navHome": "Start",
  "footerRights": "© 2026 G&F Elektro s.r.o. — Wszelkie prawa zastrzeżone.",
  "langSwitcherLabel": "Język",
  "backToDownload": "Wróć do pobierania",
  "backToOverview": "Wróć do przeglądu",
  "versionPrefix": "Wersja ",
  "copyCode": "Kopiuj",
  "copyDone": "Skopiowano!"
};
const INDEX_PL = {
  "metaDescription": "Pobierz oficjalną aplikację desktopową G&F Portal EU na Windows, macOS i Linux.",
  "heroEyebrow": "Oficjalny klient desktopowy",
  "heroSubtitle": "Teraz jako szybka aplikacja desktopowa.",
  "heroDescription": "Szybki dostęp, natywne powiadomienia i zero rozpraszaczy. Zainstaluj portal bezpośrednio na komputerze.",
  "linuxLead": "Pobierz bezpośrednio lub użyj źródła pakietów:",
  "linuxAppImageDesc": "Uniwersalny, bez instalacji",
  "linuxDebDesc": "Pakiet Debian do instalacji",
  "linuxAptDesc": "Skonfiguruj repozytorium apt",
  "linuxArchDesc": "repozytorium pacman",
  "osHintDefault": "Wybierz platformę",
  "osHintMac": "Wygląda na to, że używasz macOS. Pobierz plik DMG.",
  "osHintWin": "Wygląda na to, że używasz Windows. Pobierz instalator.",
  "osHintLinux": "Wykryto Linux — wybierz AppImage, .deb, apt lub Arch pacman.",
  "osHintOther": "Pobierz plik odpowiedni dla swojego systemu operacyjnego.",
  "installResourcesTitle": "Instalacja i pomoc",
  "macosCardDesc": "Otwórz DMG i przeciągnij do Aplikacje. Podpisane kontem Apple Developer G&F Elektro — bez pliku certyfikatu.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Uprawnienia",
  "featuresTitle": "Dlaczego aplikacja desktopowa?",
  "featuresIntro": "Wszystko, co znasz z przeglądarki — z wygodą natywnej aplikacji.",
  "feature1Title": "Bez rozpraszaczy",
  "feature1Desc": "Bez kart przeglądarki i paska zakładek. Skup się w 100% na portalu i swoich projektach.",
  "feature2Title": "Natywne powiadomienia",
  "feature2Desc": "Ważne aktualizacje portalu bezpośrednio w centrum powiadomień Windows lub macOS.",
  "feature3Title": "Zawsze pod ręką",
  "feature3Desc": "Aplikacja minimalizuje się do zasobnika systemowego i otwiera się jednym kliknięciem.",
  "feature4Title": "Aparat, mikrofon i lokalizacja",
  "feature4Desc": "Zdjęcia dokumentów, dyktowanie głosowe i opcjonalne współrzędne GPS w raportach dziennych — tylko gdy używasz ich w portalu.",
  "footerSource": "Kod źródłowy",
  "footerPermissions": "Uprawnienia",
  "roadmapEyebrow": "Aktualności",
  "roadmapTitle": "Portal wszędzie — krok po kroku",
  "roadmapIntro": "Aplikacje desktopowe na Windows, macOS i Linux są już dostępne. Równolegle budujemy natywne klienty mobilne i przygotowujemy wersję w Microsoft Store — wkrótce portal na każdym urządzeniu.",
  "roadmapBadgeLive": "Dostępne",
  "roadmapBadgeReview": "W recenzji",
  "roadmapBadgeSoon": "Wkrótce",
  "roadmapDesktopTitle": "Desktop",
  "roadmapDesktopDesc": "Klient Electron z zasobnikiem, aktualizacjami i natywnymi powiadomieniami — pobierz przez instalator, apt, pacman lub Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Natywna aplikacja na iPhone i iPad w Swift. Buildy są wysyłane; external TestFlight i recenzja App Store złożone — premiera już wkrótce.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "Klient Android jest w aktywnym rozwoju — te same funkcje portalu, pod budowę i w drogę.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "Ta sama aplikacja Windows jako MSIX do wdrożeń firmowych — pakowanie i wysyłka do sklepu w toku.",
  "roadmapNote": "Więcej o kamerze, mikrofonie i powiadomieniach na wszystkich platformach: <a href=\"permissions.html\">Uprawnienia</a>."
};
const MACOS_PL = {
  "pageTitle": "Instalacja macOS – G&F Portal EU",
  "metaDescription": "Jak zainstalować G&F Portal EU na Macu: pobierz DMG, przeciągnij do Aplikacje — bezpiecznie podpisane, bez plików certyfikatów.",
  "h1": "Instalacja na macOS",
  "h2": "G&F Portal EU przez DMG",
  "intro": "Aplikacja desktopowa na Mac jest dostarczana jako <strong>plik DMG</strong>. Instalujesz tylko tę aplikację — bez dodatkowych certyfikatów ani kluczy. Jakie uprawnienia wykorzystuje aplikacja, opisano na <a href=\"permissions.html\">stronie uprawnień</a>.",
  "stepsTitle": "Kroki",
  "step1": "Pobierz najnowsze <strong>macOS DMG</strong> z GitHub (przycisk poniżej).",
  "step2": "Otwórz pobrany plik <code>.dmg</code> (dwuklik).",
  "step3": "Przeciągnij <strong>G&F Portal EU</strong> do folderu <strong>Aplikacje</strong> (Applications).",
  "step4": "Zamknij okno DMG i uruchom aplikację z Aplikacji lub przez Spotlight.",
  "signingPara": "Wydania podpisane <strong>certyfikatem Developer ID</strong> G&F Elektro i <strong>notaryzowane</strong> przez Apple otwierają się bez ostrzeżenia „niezidentyfikowany deweloper”. Prywatny klucz Apple pozostaje w G&F Elektro i nie jest udostępniany do pobrania. Starsze wydania mogą nadal ostrzegać — pobierz najnowsze DMG.",
  "securityTitle": "Ważne informacje o bezpieczeństwie",
  "securityP1": "Instalujesz wyłącznie <strong>DMG</strong> z aplikacją. Nie instalujesz prywatnego klucza Apple, pliku <strong>.p12</strong> ani <strong>.p8</strong> — ani z tej strony, e-maila ani innych źródeł.",
  "securityP2": "<strong>G&F Elektro</strong> podpisuje aplikację podczas budowania dzięki członkostwu w <strong>Apple Developer Program</strong>. Prywatny klucz Developer ID jest używany tylko wewnętrznie i <strong>nigdy</strong> nie jest publikowany na tej stronie ani w publicznym repozytorium Git.",
  "securityP3": "Nie ufaj instrukcjom, które proszą o pobranie certyfikatu lub klucza do instalacji aplikacji — to nie jest potrzebne i jest niebezpieczne.",
  "downloadBtn": "Pobierz najnowsze macOS DMG",
  "hint": "Przycisk prowadzi do najnowszej strony wydania na GitHub; tam wybierz odpowiednie <strong>.dmg</strong> dla Maca.",
  "warningTitle": "Ostrzeżenie od macOS?",
  "warningP1": "Jeśli macOS nadal ostrzega przy otwieraniu, często masz <strong>starszą, niepodpisaną</strong> wersję. <strong>Pobierz najnowszą wersję</strong> ze strony wydania GitHub (link powyżej) i zainstaluj ponownie — to zalecany sposób.",
  "warningP2": "Prosimy <strong>nie wyłączać Gatekeepera</strong> i nie używać poleceń terminala takich jak <code>xattr</code> jako standardowego rozwiązania; aktualne podpisane wydania nie wymagają takich obejść.",
  "warningP3": "Uwaga: Bardzo stare niepodpisane buildy testowe czasem wymagały obejścia kwarantanny; przy notaryzowanych wydaniach Developer ID już nie."
};
const LINUX_APT_PL = {
  "pageTitle": "Instalacja Linux (apt) – G&F Portal EU",
  "metaDescription": "Jak zainstalować G&F Portal EU na Debianie i Ubuntu przez apt.",
  "h1": "Instalacja przez apt",
  "h2": "Debian i Ubuntu",
  "intro": "Repozytorium pakietów nie jest podpisane. Dlatego w źródle jest <strong>trusted=yes</strong>.",
  "backLink": "Wróć do przeglądu"
};
const LINUX_ARCH_PL = {
  "pageTitle": "Instalacja Linux (Arch) – G&F Portal EU",
  "metaDescription": "Jak zainstalować G&F Portal EU na Arch Linux przez pacman lub yay.",
  "h1": "Instalacja na Arch",
  "h2": "repozytorium pacman i AUR",
  "intro": "Dodaj to repozytorium do <code>/etc/pacman.conf</code>. Baza nie jest podpisana (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Alternatywnie przez AUR, gdy pakiet zostanie tam opublikowany:",
  "backLink": "Wróć do przeglądu"
};
const WINDOWS_CHOCO_PL = {
  "pageTitle": "Instalacja Windows – G&F Portal EU",
  "metaDescription": "Jak zainstalować G&F Portal EU na Windows przez Chocolatey.",
  "h1": "Instalacja na Windows",
  "h2": "G&F Portal EU z Chocolatey",
  "intro": "Z Chocolatey instalujesz aplikację desktopową jednym poleceniem. Pakiet nazywa się <strong>gfe-portal-eu</strong>.",
  "backLink": "Wróć do przeglądu"
};
const PERMISSIONS_PL = {
  "pageTitle": "Uprawnienia – G&F Portal EU",
  "metaDescription": "Dlaczego G&F Portal EU używa aparatu, mikrofonu, powiadomień i schowka — macOS, Windows, iOS i Android.",
  "h1": "Uprawnienia aplikacji",
  "h2": "Dlaczego G&F Portal EU pyta na Twoim urządzeniu",
  "intro": "Aplikacje portalu to powłoki wokół <strong>portal.gfelektro.com</strong> — portalu pracowniczego G&F Elektro. Do zdjęć z budowy, dyktowania, powiadomień z czatu i wklejania ze schowka system potrzebuje Twojej zgody.",
  "macTitle": "Aplikacja macOS",
  "macLi1": "<strong>Aparat</strong> — zdjęcia dokumentów i fotodokumentacja na budowie.",
  "macLi2": "<strong>Mikrofon</strong> — wiadomości głosowe, dyktowanie i funkcje audio (np. dla administratorów).",
  "macLi3": "<strong>Lokalizacja (opcjonalnie)</strong> — tylko gdy włączysz GPS w raportach dziennych.",
  "macLi4": "<strong>Powiadomienia</strong> — nowe wiadomości i alerty jak e-mail lub SMS.",
  "macLi5": "<strong>Schowek</strong> — wklejanie tekstu w formularzach w portalu.",
  "macFooter": "Instalacja tylko przez <strong>DMG</strong> — zobacz <a href=\"macos-install.html\">instrukcję macOS</a>. Nie pobierasz <strong>żadnego</strong> certyfikatu Apple ani <strong>prywatnego</strong> klucza; aplikacja jest podpisana i notaryzowana.",
  "winTitle": "Aplikacja Windows",
  "winLi1": "Te same cele: aparat, mikrofon, powiadomienia, schowek.",
  "winLi2": "Gdy Windows zablokuje mikrofon lub aparat, aplikacja pokaże dialog z linkiem do <strong>ustawień prywatności</strong>.",
  "winLi3": "Powiadomienia działają przez centrum powiadomień Windows (ID aplikacji <code>com.gfelektro.portal</code>).",
  "iosTitle": "Aplikacja iOS (TestFlight / App Store)",
  "iosBody": "Te same funkcje przez systemowe okna Apple. Powiadomienia pojawiają się w <strong>centrum powiadomień</strong>. To nie ogólna przeglądarka, lecz oficjalny klient pracowniczy portalu.",
  "androidTitle": "Aplikacja Android",
  "androidBody": "Aparat i zdjęcia do uploadów z budowy, mikrofon do dyktowania, od Androida 13 powiadomienia z wyraźną zgodą. Ważne komunikaty jako powiadomienia systemowe.",
  "storeTitle": "Microsoft Store (planowane)",
  "storeBody": "Ta sama aplikacja desktopowa Windows, później przez Store. Pakiet MSIX wymaga m.in. <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> i opcjonalnie <code>location</code>. Szczegóły: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Szczegóły techniczne mostu natywnego (dla deweloperów): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Wróć do pobierania"
};
const SHARED_SK = {
  "navWebsite": "Na web",
  "navHome": "Domov",
  "footerRights": "© 2026 G&F Elektro s.r.o. — Všetky práva vyhradené.",
  "langSwitcherLabel": "Jazyk",
  "backToDownload": "Späť na stiahnutie",
  "backToOverview": "Späť na prehľad",
  "versionPrefix": "Verzia ",
  "copyCode": "Kopírovať",
  "copyDone": "Skopírované!"
};
const INDEX_SK = {
  "metaDescription": "Stiahni si oficiálnu desktopovú aplikáciu G&F Portal EU pre Windows, macOS a Linux.",
  "heroEyebrow": "Oficiálny desktopový klient",
  "heroSubtitle": "Teraz ako rýchla desktopová aplikácia.",
  "heroDescription": "Rýchly prístup, natívne upozornenia a žiadne rozptyľovanie. Nainštaluj si portál priamo na počítač.",
  "linuxLead": "Stiahnuť priamo alebo použiť balíkový zdroj:",
  "linuxAppImageDesc": "Univerzálne, bez inštalácie",
  "linuxDebDesc": "Debian balík na inštaláciu",
  "linuxAptDesc": "Nastaviť apt repozitár",
  "linuxArchDesc": "pacman repozitár",
  "osHintDefault": "Vyber si platformu",
  "osHintMac": "Zdá sa, že používaš macOS. Stiahni si DMG.",
  "osHintWin": "Zdá sa, že používaš Windows. Stiahni si inštalátor.",
  "osHintLinux": "Linux rozpoznaný — vyber AppImage, .deb, apt alebo Arch pacman.",
  "osHintOther": "Stiahni si súbor vhodný pre tvoj operačný systém.",
  "installResourcesTitle": "Inštalácia a pomoc",
  "macosCardDesc": "Otvor DMG a presuň do Aplikácie. Podpísané Apple Developer účtom G&F Elektro — netreba súbor certifikátu.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Povolenia",
  "featuresTitle": "Prečo desktopová aplikácia?",
  "featuresIntro": "Všetko, čo poznáš z prehliadača — s pohodlím natívnej aplikácie.",
  "feature1Title": "Bez rozptyľovania",
  "feature1Desc": "Žiadne karty prehliadača, žiadny panel záložiek. Sústred sa na portál a svoje projekty.",
  "feature2Title": "Natívne upozornenia",
  "feature2Desc": "Dôležité aktualizácie portálu priamo cez informačné centrum Windows alebo macOS.",
  "feature3Title": "Vždy po ruke",
  "feature3Desc": "Aplikácia sa minimalizuje do systémovej lišty a otvoríš ju jedným klikom.",
  "feature4Title": "Kamera, mikrofón a poloha",
  "feature4Desc": "Fotky dokladov, hlasové diktovanie a voliteľné GPS v denných správach — len keď ich v portáli používaš.",
  "footerSource": "Zdrojový kód",
  "footerPermissions": "Povolenia",
  "roadmapEyebrow": "Novinky",
  "roadmapTitle": "Portál všade — krok za krokom",
  "roadmapIntro": "Desktopové aplikácie pre Windows, macOS a Linux už sú tu. Paralelne vyvíjame natívne mobilné klienty a pripravujeme Microsoft Store — čoskoro portál na každom zariadení.",
  "roadmapBadgeLive": "Dostupné",
  "roadmapBadgeReview": "V recenzii",
  "roadmapBadgeSoon": "Čoskoro",
  "roadmapDesktopTitle": "Desktop",
  "roadmapDesktopDesc": "Electron klient s tray, aktualizáciami a natívnymi upozorneniami — stiahni cez inštalátor, apt, pacman alebo Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Natívna aplikácia pre iPhone a iPad vo Swift. Buildy bežia; external TestFlight a App Store review sú odoslané — vydanie čoskoro.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "Android klient je v aktívnom vývoji — rovnaké funkcie portálu, vyladené pre stavbu a cestu.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "Rovnaká windows desktopová app ako MSIX pre firemné nasadenie — balenie a odoslanie do obchodu prebieha.",
  "roadmapNote": "Viac o kamere, mikrofóne a upozorneniach na všetkých platformách: <a href=\"permissions.html\">Povolenia</a>."
};
const MACOS_SK = {
  "pageTitle": "Inštalácia macOS – G&F Portal EU",
  "metaDescription": "Ako nainštalovať G&F Portal EU na Mac: stiahnuť DMG, presunúť do Aplikácie — bezpečne podpísané, bez certifikátov.",
  "h1": "Inštalácia na macOS",
  "h2": "G&F Portal EU cez DMG",
  "intro": "Desktopová aplikácia pre Mac sa dodáva ako <strong>súbor DMG</strong>. Inštaluješ len túto aplikáciu — žiadne ďalšie certifikáty ani kľúče. Aké povolenia aplikácia používa, nájdeš na <a href=\"permissions.html\">stránke povolení</a>.",
  "stepsTitle": "Kroky",
  "step1": "Stiahni najnovšie <strong>macOS DMG</strong> z GitHubu (tlačidlo nižšie).",
  "step2": "Otvor stiahnutý súbor <code>.dmg</code> (dvojklik).",
  "step3": "Presuň <strong>G&F Portal EU</strong> do priečinka <strong>Aplikácie</strong> (Applications).",
  "step4": "Zavri okno DMG a spusti aplikáciu z Aplikácií alebo cez Spotlight.",
  "signingPara": "Verzie podpísané <strong>Developer ID certifikátom</strong> G&F Elektro a <strong>notarizované</strong> Apple sa otvoria bez varovania „neidentifikovaný vývojár“. Súkromný Apple kľúč zostáva u G&F Elektro a nie je na stiahnutie. Staršie verzie môžu varovať — stiahni najnovšie DMG.",
  "securityTitle": "Dôležité o bezpečnosti",
  "securityP1": "Inštaluješ len <strong>DMG</strong> s aplikáciou. Neinštaluješ <strong>súkromný</strong> Apple kľúč, súbor <strong>.p12</strong> ani <strong>.p8</strong> — ani z tejto stránky, e-mailu ani iných zdrojov.",
  "securityP2": "<strong>G&F Elektro</strong> aplikáciu pri builde podpisuje vďaka členstvu v <strong>Apple Developer Program</strong>. Súkromný Developer ID kľúč sa používa len interne a <strong>nikdy</strong> nie je na tejto stránke ani vo verejnom Git repozitári.",
  "securityP3": "Nedôveruj návodom, ktoré na inštaláciu žiadajú stiahnuť certifikát alebo kľúč — to nie je potrebné a nie je bezpečné.",
  "downloadBtn": "Stiahnuť najnovšie macOS DMG",
  "hint": "Tlačidlo vedie na najnovšiu GitHub release stránku; tam vyber vhodné <strong>.dmg</strong> pre Mac.",
  "warningTitle": "Varovanie od macOS?",
  "warningP1": "Ak macOS pri otváraní stále varuje, často máš <strong>staršiu, nepodpísanú</strong> verziu. <strong>Stiahni najnovšiu verziu</strong> z GitHub release (odkaz vyššie) a znova nainštaluj — to je odporúčaný postup.",
  "warningP2": "Prosím <strong>nevypínaj Gatekeeper</strong> a nepoužívaj príkazy ako <code>xattr</code> ako štandardné riešenie; pri aktuálnych podpísaných verziách to netreba.",
  "warningP3": "Poznámka: Veľmi staré nepodpísané testovacie buildy občas potrebovali obídenie karantény; pri notarizovaných Developer ID verziách to už neplatí."
};
const LINUX_APT_SK = {
  "pageTitle": "Inštalácia Linux (apt) – G&F Portal EU",
  "metaDescription": "Ako nainštalovať G&F Portal EU na Debian a Ubuntu cez apt.",
  "h1": "Inštalácia cez apt",
  "h2": "Debian a Ubuntu",
  "intro": "Balíkový repozitár nie je podpísaný. Preto je v zdroji uvedené <strong>trusted=yes</strong>.",
  "backLink": "Späť na prehľad"
};
const LINUX_ARCH_SK = {
  "pageTitle": "Inštalácia Linux (Arch) – G&F Portal EU",
  "metaDescription": "Ako nainštalovať G&F Portal EU na Arch Linux cez pacman alebo yay.",
  "h1": "Inštalácia na Arch",
  "h2": "pacman repozitár a AUR",
  "intro": "Pridaj tento repozitár do <code>/etc/pacman.conf</code>. Databáza nie je podpísaná (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Alternatívne cez AUR, keď bude balík tam zverejnený:",
  "backLink": "Späť na prehľad"
};
const WINDOWS_CHOCO_SK = {
  "pageTitle": "Inštalácia Windows – G&F Portal EU",
  "metaDescription": "Ako nainštalovať G&F Portal EU na Windows cez Chocolatey.",
  "h1": "Inštalácia na Windows",
  "h2": "G&F Portal EU s Chocolatey",
  "intro": "S Chocolatey nainštaluješ desktopovú aplikáciu jedným príkazom. Balík sa volá <strong>gfe-portal-eu</strong>.",
  "backLink": "Späť na prehľad"
};
const PERMISSIONS_SK = {
  "pageTitle": "Povolenia – G&F Portal EU",
  "metaDescription": "Prečo G&F Portal EU používa kameru, mikrofón, upozornenia a schránku — macOS, Windows, iOS a Android.",
  "h1": "Povolenia aplikácie",
  "h2": "Prečo G&F Portal EU pýta na tvojom zariadení",
  "intro": "Aplikácie portálu sú obaly okolo <strong>portal.gfelektro.com</strong> — zamestnaneckého portálu G&F Elektro. Na fotky zo stavby, diktovanie, chatové upozornenia a vkladanie zo schránky potrebuje systém tvoj súhlas.",
  "macTitle": "macOS aplikácia",
  "macLi1": "<strong>Kamera</strong> — fotky dokladov a fotodokumentácia na stavbe.",
  "macLi2": "<strong>Mikrofón</strong> — hlasové správy, diktovanie a audio funkcie (napr. pre adminov).",
  "macLi3": "<strong>Poloha (voliteľné)</strong> — len ak zapneš GPS v denných správach.",
  "macLi4": "<strong>Upozornenia</strong> — nové správy a upozornenia ako pri e-mailu alebo SMS.",
  "macLi5": "<strong>Schránka</strong> — vkladanie textu do formulárov v portáli.",
  "macFooter": "Inštalácia len cez <strong>DMG</strong> — pozri <a href=\"macos-install.html\">návod pre macOS</a>. Nestiahneš <strong>žiadny</strong> Apple certifikát ani <strong>súkromný</strong> kľúč; aplikácia je podpísaná a notarizovaná.",
  "winTitle": "Windows aplikácia",
  "winLi1": "Rovnaké účely: kamera, mikrofón, upozornenia, schránka.",
  "winLi2": "Ak Windows zablokuje mikrofón alebo kameru, aplikácia zobrazí dialóg s odkazom na <strong>nastavenia súkromia</strong>.",
  "winLi3": "Upozornenia idú cez centrum oznámení Windows (ID aplikácie <code>com.gfelektro.portal</code>).",
  "iosTitle": "iOS aplikácia (TestFlight / App Store)",
  "iosBody": "Rovnaké funkcie cez systémové dialógy Apple. Upozornenia sa zobrazia v <strong>centre oznámení</strong>. Aplikácia nie je generický prehliadač, ale oficiálny zamestnanecký klient portálu.",
  "androidTitle": "Android aplikácia",
  "androidBody": "Kamera a fotky na nahrávanie zo stavby, mikrofón na diktovanie, od Androidu 13 upozornenia s výslovným súhlasom. Dôležité správy ako systémové upozornenia.",
  "storeTitle": "Microsoft Store (plánované)",
  "storeBody": "Rovnaká Windows desktopová aplikácia, neskôr cez Store. Balík MSIX potrebuje okrem iného <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> a voliteľne <code>location</code>. Podrobnosti: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Technické detaily natívneho mostu (vývojári): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Späť na stiahnutie"
};
const SHARED_UK = {
  "navWebsite": "На сайт",
  "navHome": "Головна",
  "footerRights": "© 2026 G&F Elektro s.r.o. — Усі права захищені.",
  "langSwitcherLabel": "Мова",
  "backToDownload": "Назад до завантаження",
  "backToOverview": "Назад до огляду",
  "versionPrefix": "Версія ",
  "copyCode": "Копіювати",
  "copyDone": "Скопійовано!"
};
const INDEX_UK = {
  "metaDescription": "Завантаж офіційний десктопний додаток G&F Portal EU для Windows, macOS і Linux.",
  "heroEyebrow": "Офіційний десктопний клієнт",
  "heroSubtitle": "Тепер як швидкий десктопний додаток.",
  "heroDescription": "Швидкий доступ, нативні сповіщення й жодних відволікань. Встанови портал прямо на робочий стіл.",
  "linuxLead": "Завантажити напряму або скористатися джерелом пакетів:",
  "linuxAppImageDesc": "Універсально, без інсталяції",
  "linuxDebDesc": "Пакет Debian для встановлення",
  "linuxAptDesc": "Налаштувати репозиторій apt",
  "linuxArchDesc": "репозиторій pacman",
  "osHintDefault": "Обери свою платформу",
  "osHintMac": "Схоже, ти користуєшся macOS. Завантаж DMG.",
  "osHintWin": "Схоже, ти користуєшся Windows. Завантаж інсталятор.",
  "osHintLinux": "Виявлено Linux — обери AppImage, .deb, apt або Arch pacman.",
  "osHintOther": "Завантаж файл, що підходить для твоєї операційної системи.",
  "installResourcesTitle": "Встановлення та допомога",
  "macosCardDesc": "Відкрий DMG і перетягни в Програми. Підписано обліковим записом Apple Developer G&F Elektro — файл сертифіката не потрібен.",
  "chipDebian": "Debian / Ubuntu",
  "chipArch": "Arch Linux",
  "chipWindows": "Windows (Chocolatey)",
  "chipPermissions": "Дозволи",
  "featuresTitle": "Навіщо десктопний додаток?",
  "featuresIntro": "Усе, що ти знаєш із браузера — з комфортом нативного застосунку.",
  "feature1Title": "Без відволікань",
  "feature1Desc": "Жодних вкладок браузера й панелі закладок. Зосередься на порталі та своїх проєктах.",
  "feature2Title": "Нативні сповіщення",
  "feature2Desc": "Важливі оновлення порталу прямо через центр сповіщень Windows або macOS.",
  "feature3Title": "Завжди під рукою",
  "feature3Desc": "Додаток згортається в системний трей і відкривається одним кліком.",
  "feature4Title": "Камера, мікрофон і геолокація",
  "feature4Desc": "Фото чеків, голосове диктування та опційні GPS-координати для щоденних звітів — лише коли ти користуєшся ними в порталі.",
  "footerSource": "Вихідний код",
  "footerPermissions": "Дозволи",
  "roadmapEyebrow": "Новини",
  "roadmapTitle": "Портал скрізь — крок за кроком",
  "roadmapIntro": "Десктопні застосунки для Windows, macOS і Linux уже доступні. Паралельно робимо нативні мобільні клієнти та готуємо Microsoft Store — незабаром портал на кожному пристрої.",
  "roadmapBadgeLive": "Доступно",
  "roadmapBadgeReview": "На перевірці",
  "roadmapBadgeSoon": "Незабаром",
  "roadmapDesktopTitle": "Десктоп",
  "roadmapDesktopDesc": "Клієнт Electron із треєм, оновленнями та нативними сповіщеннями — завантаж через інсталятор, apt, pacman або Chocolatey.",
  "roadmapIosTitle": "iOS (Swift)",
  "roadmapIosDesc": "Нативний застосунок для iPhone та iPad на Swift. Збірки виходять; external TestFlight і перевірка App Store подані — реліз незабаром.",
  "roadmapAndroidTitle": "Android",
  "roadmapAndroidDesc": "Клієнт Android у активній розробці — ті самі функції порталу для об’єкта та в дорозі.",
  "roadmapStoreTitle": "Microsoft Store",
  "roadmapStoreDesc": "Той самий Windows-десктоп як MSIX для корпоративного розгортання — пакування та подання в Store у процесі.",
  "roadmapNote": "Докладніше про камеру, мікрофон і сповіщення на всіх платформах: <a href=\"permissions.html\">Дозволи</a>."
};
const MACOS_UK = {
  "pageTitle": "Встановлення macOS – G&F Portal EU",
  "metaDescription": "Як установити G&F Portal EU на Mac: завантаж DMG, перетягни в Програми — безпечно підписано, без файлів сертифікатів.",
  "h1": "Встановлення на macOS",
  "h2": "G&F Portal EU через DMG",
  "intro": "Десктопний додаток для Mac постачається як <strong>файл DMG</strong>. Ти встановлюєш лише цей додаток — без додаткових сертифікатів чи ключів. Які дозволи використовує додаток, описано на <a href=\"permissions.html\">сторінці дозволів</a>.",
  "stepsTitle": "Кроки",
  "step1": "Завантаж найновіший <strong>macOS DMG</strong> з GitHub (кнопка нижче).",
  "step2": "Відкрий завантажений файл <code>.dmg</code> (подвійний клік).",
  "step3": "Перетягни <strong>G&F Portal EU</strong> до папки <strong>Програми</strong> (Applications).",
  "step4": "Закрий вікно DMG і запусти додаток із Програм або через Spotlight.",
  "signingPara": "Релізи, підписані <strong>сертифікатом Developer ID</strong> G&F Elektro та <strong>нотаризовані</strong> Apple, відкриваються без попередження «невідомий розробник». Приватний ключ Apple залишається в G&F Elektro і не пропонується для завантаження. Старіші релізи можуть ще попереджати — завантаж найновіший DMG.",
  "securityTitle": "Важливо щодо безпеки",
  "securityP1": "Ти встановлюєш лише <strong>DMG</strong> з додатком. Ти <strong>не</strong> встановлюєш приватний ключ Apple, файл <strong>.p12</strong> чи <strong>.p8</strong> — ні з цього сайту, ні з e-mail чи інших джерел.",
  "securityP2": "<strong>G&F Elektro</strong> підписує додаток під час збірки завдяки участі в <strong>Apple Developer Program</strong>. Приватний ключ Developer ID використовується лише внутрішньо і <strong>ніколи</strong> не публікується на цьому сайті чи у публічному Git-репозиторії.",
  "securityP3": "Не довіряй інструкціям, які пропонують завантажити сертифікат або ключ для встановлення додатка — це не потрібно й небезпечно.",
  "downloadBtn": "Завантажити найновіший macOS DMG",
  "hint": "Кнопка веде на найновішу сторінку релізу GitHub; там обери відповідний <strong>.dmg</strong> для Mac.",
  "warningTitle": "Попередження від macOS?",
  "warningP1": "Якщо macOS досі попереджає під час відкриття, часто це <strong>стара, непідписана</strong> версія. <strong>Завантаж найновішу версію</strong> зі сторінки релізу GitHub (посилання вище) й установи знову — це рекомендований шлях.",
  "warningP2": "Будь ласка, <strong>не вимикай Gatekeeper</strong> і не використовуй команди на кшталт <code>xattr</code> як стандартне рішення; для актуальних підписаних релізів обхідні шляхи не потрібні.",
  "warningP3": "Примітка: Дуже старі непідписані тестові збірки іноді потребували обходу карантину; для нотаризованих релізів Developer ID це вже не актуально."
};
const LINUX_APT_UK = {
  "pageTitle": "Встановлення Linux (apt) – G&F Portal EU",
  "metaDescription": "Як установити G&F Portal EU на Debian і Ubuntu через apt.",
  "h1": "Встановлення через apt",
  "h2": "Debian і Ubuntu",
  "intro": "Репозиторій пакетів не підписаний. Тому в джерелі вказано <strong>trusted=yes</strong>.",
  "backLink": "Назад до огляду"
};
const LINUX_ARCH_UK = {
  "pageTitle": "Встановлення Linux (Arch) – G&F Portal EU",
  "metaDescription": "Як установити G&F Portal EU на Arch Linux через pacman або yay.",
  "h1": "Встановлення на Arch",
  "h2": "репозиторій pacman і AUR",
  "intro": "Додай цей репозиторій до <code>/etc/pacman.conf</code>. База не підписана (<strong>SigLevel = Optional TrustAll</strong>).",
  "aurNote": "Альтернативно через AUR, коли пакет там з’явиться:",
  "backLink": "Назад до огляду"
};
const WINDOWS_CHOCO_UK = {
  "pageTitle": "Встановлення Windows – G&F Portal EU",
  "metaDescription": "Як установити G&F Portal EU на Windows через Chocolatey.",
  "h1": "Встановлення на Windows",
  "h2": "G&F Portal EU з Chocolatey",
  "intro": "З Chocolatey ти встановлюєш десктопний додаток однією командою. Пакет називається <strong>gfe-portal-eu</strong>.",
  "backLink": "Назад до огляду"
};
const PERMISSIONS_UK = {
  "pageTitle": "Дозволи – G&F Portal EU",
  "metaDescription": "Чому G&F Portal EU використовує камеру, мікрофон, сповіщення та буфер обміну — macOS, Windows, iOS і Android.",
  "h1": "Дозволи додатка",
  "h2": "Чому G&F Portal EU запитує на твоєму пристрої",
  "intro": "Додатки порталу — обгортки навколо <strong>portal.gfelektro.com</strong> — порталу співробітників G&F Elektro. Для фото з об’єкта, диктування, сповіщень у чаті та вставки з буфера обміну операційній системі потрібна твоя згода.",
  "macTitle": "Додаток macOS",
  "macLi1": "<strong>Камера</strong> — фото чеків і фотодокументація на об’єкті.",
  "macLi2": "<strong>Мікрофон</strong> — голосові повідомлення, диктування та аудіофункції (наприклад, для адмінів).",
  "macLi3": "<strong>Геолокація (опційно)</strong> — лише якщо вмикаєш GPS у щоденних звітах.",
  "macLi4": "<strong>Сповіщення</strong> — нові повідомлення та нагадування, як e-mail або SMS.",
  "macLi5": "<strong>Буфер обміну</strong> — вставлення тексту в форми порталу.",
  "macFooter": "Встановлення лише через <strong>DMG</strong> — див. <a href=\"macos-install.html\">інструкцію для macOS</a>. Ти <strong>не</strong> завантажуєш сертифікат Apple й <strong>приватний</strong> ключ; додаток підписаний і нотаризований.",
  "winTitle": "Додаток Windows",
  "winLi1": "Ті самі цілі: камера, мікрофон, сповіщення, буфер обміну.",
  "winLi2": "Якщо Windows блокує мікрофон або камеру, додаток показує діалог із посиланням на <strong>налаштування конфіденційності</strong>.",
  "winLi3": "Сповіщення йдуть через центр сповіщень Windows (ID додатка <code>com.gfelektro.portal</code>).",
  "iosTitle": "Додаток iOS (TestFlight / App Store)",
  "iosBody": "Ті самі функції через системні діалоги Apple. Сповіщення з’являються в <strong>Центрі сповіщень</strong>. Це не універсальний браузер, а офіційний клієнт порталу для співробітників.",
  "androidTitle": "Додаток Android",
  "androidBody": "Камера й фото для завантажень з об’єкта, мікрофон для диктування, від Android 13 — сповіщення з явним дозволом. Важливі повідомлення як системні сповіщення.",
  "storeTitle": "Microsoft Store (заплановано)",
  "storeBody": "Той самий десктопний додаток Windows, згодом через Store. Пакет MSIX потребує зокрема <code>internetClient</code>, <code>microphone</code>, <code>webcam</code> та опційно <code>location</code>. Деталі: <a href=\"microsoft-store.html\">Microsoft Store</a>.",
  "devNote": "Технічні деталі нативного мосту (для розробників): <a href=\"native-shell-bridge.html\">Native Shell Bridge</a>.",
  "backBtn": "Назад до завантаження"
};

const DOCS_LOCALES = {
  de: buildLocale(SHARED_DE, INDEX_DE, MACOS_DE, LINUX_APT_DE, LINUX_ARCH_DE, WINDOWS_CHOCO_DE, PERMISSIONS_DE),
  en: buildLocale(SHARED_EN, INDEX_EN, MACOS_EN, LINUX_APT_EN, LINUX_ARCH_EN, WINDOWS_CHOCO_EN, PERMISSIONS_EN),
  sk: buildLocale(SHARED_SK, INDEX_SK, MACOS_SK, LINUX_APT_SK, LINUX_ARCH_SK, WINDOWS_CHOCO_SK, PERMISSIONS_SK),
  cz: buildLocale(SHARED_CZ, INDEX_CZ, MACOS_CZ, LINUX_APT_CZ, LINUX_ARCH_CZ, WINDOWS_CHOCO_CZ, PERMISSIONS_CZ),
  pl: buildLocale(SHARED_PL, INDEX_PL, MACOS_PL, LINUX_APT_PL, LINUX_ARCH_PL, WINDOWS_CHOCO_PL, PERMISSIONS_PL),
  hu: buildLocale(SHARED_HU, INDEX_HU, MACOS_HU, LINUX_APT_HU, LINUX_ARCH_HU, WINDOWS_CHOCO_HU, PERMISSIONS_HU),
  uk: buildLocale(SHARED_UK, INDEX_UK, MACOS_UK, LINUX_APT_UK, LINUX_ARCH_UK, WINDOWS_CHOCO_UK, PERMISSIONS_UK),
};


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DOCS_DEFAULT_LANG, DOCS_LANG_IDS, DOCS_LOCALES };
}

if (typeof window !== 'undefined') {
  window.DOCS_DEFAULT_LANG = DOCS_DEFAULT_LANG;
  window.DOCS_LANG_IDS = DOCS_LANG_IDS;
  window.DOCS_LOCALES = DOCS_LOCALES;
}
