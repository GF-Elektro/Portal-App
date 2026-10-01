'use strict';

const DOCS_LANG_STORAGE_KEY = 'docs-lang';
const DOCS_HTML_LANG = { sk: 'sk', cz: 'cs', pl: 'pl', hu: 'hu', de: 'de', uk: 'uk', en: 'en' };
const DOCS_LANG_TITLES = {
  sk: 'Slovenčina',
  cz: 'Čeština',
  pl: 'Polski',
  hu: 'Magyar',
  de: 'Deutsch',
  uk: 'Українська',
  en: 'English',
};

const PAGE_TITLE_KEYS = {
  macos: 'macos.pageTitle',
  linuxApt: 'linuxApt.pageTitle',
  linuxArch: 'linuxArch.pageTitle',
  windowsChoco: 'windowsChoco.pageTitle',
  permissions: 'permissions.pageTitle',
};

const PAGE_DESC_KEYS = {
  index: 'index.metaDescription',
  macos: 'macos.metaDescription',
  linuxApt: 'linuxApt.metaDescription',
  linuxArch: 'linuxArch.metaDescription',
  windowsChoco: 'windowsChoco.metaDescription',
  permissions: 'permissions.metaDescription',
};

let activeLang = DOCS_DEFAULT_LANG;

function resolveLangId(candidate) {
  if (candidate && DOCS_LANG_IDS.includes(candidate)) return candidate;
  return null;
}

function detectBrowserLang() {
  const raw = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (raw.startsWith('sk')) return 'sk';
  if (raw.startsWith('cs') || raw.startsWith('cz')) return 'cz';
  if (raw.startsWith('pl')) return 'pl';
  if (raw.startsWith('hu')) return 'hu';
  if (raw.startsWith('de')) return 'de';
  if (raw.startsWith('uk')) return 'uk';
  if (raw.startsWith('en')) return 'en';
  return DOCS_DEFAULT_LANG;
}

function getMessage(path) {
  const parts = path.split('.');
  if (parts.length < 2) return '';
  const [ns, ...rest] = parts;
  const locale = DOCS_LOCALES[activeLang];
  if (!locale || !locale[ns]) return '';
  let value = locale[ns];
  for (const key of rest) {
    if (value == null || typeof value !== 'object') return '';
    value = value[key];
  }
  return typeof value === 'string' ? value : '';
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = getMessage(el.getAttribute('data-i18n'));
    if (text) el.textContent = text;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const html = getMessage(el.getAttribute('data-i18n-html'));
    if (html) el.innerHTML = html;
  });

  const page = document.body.getAttribute('data-docs-page');
  const descKey = page && PAGE_DESC_KEYS[page];
  if (descKey) {
    const description = getMessage(descKey);
    if (description) {
      document.querySelectorAll('meta[name="description"]').forEach((meta) => {
        meta.setAttribute('content', description);
      });
      document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => {
        meta.setAttribute('content', description);
      });
    }
  }

  const titleKey = page && PAGE_TITLE_KEYS[page];
  if (titleKey) {
    const title = getMessage(titleKey);
    if (title) document.title = title;
  }

  document.documentElement.lang = DOCS_HTML_LANG[activeLang] || activeLang;

  const switcher = document.getElementById('lang-switcher');
  if (switcher) {
    switcher.setAttribute('aria-label', getMessage('shared.langSwitcherLabel'));
    switcher.querySelectorAll('button[data-lang]').forEach((btn) => {
      const pressed = btn.getAttribute('data-lang') === activeLang;
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
  }

  window.dispatchEvent(new CustomEvent('docs:language-changed', { detail: { lang: activeLang } }));
}

function setDocsLanguage(langId) {
  const next = resolveLangId(langId);
  if (!next || next === activeLang) return;
  activeLang = next;
  try {
    localStorage.setItem(DOCS_LANG_STORAGE_KEY, activeLang);
  } catch {
    // Private mode or blocked storage — session-only language still works.
  }
  applyTranslations();
}

function buildLangSwitcher() {
  const container = document.getElementById('lang-switcher');
  if (!container) return;

  DOCS_LANG_IDS.forEach((langId) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-lang', langId);
    btn.setAttribute('title', DOCS_LANG_TITLES[langId] || langId);
    btn.setAttribute('aria-label', DOCS_LANG_TITLES[langId] || langId);

    const img = document.createElement('img');
    img.src = `assets/flags/${langId}.svg`;
    img.alt = '';
    img.width = 28;
    img.height = 19;
    img.decoding = 'async';
    btn.appendChild(img);

    btn.addEventListener('click', () => setDocsLanguage(langId));
    container.appendChild(btn);
  });

  container.hidden = false;
}

function initDocsI18n() {
  if (typeof DOCS_LOCALES === 'undefined') return;

  try {
    const stored = resolveLangId(localStorage.getItem(DOCS_LANG_STORAGE_KEY));
    activeLang = stored || detectBrowserLang();
  } catch {
    activeLang = detectBrowserLang();
  }

  buildLangSwitcher();
  applyTranslations();
}

window.DocsI18n = {
  getLang: () => activeLang,
  setLang: setDocsLanguage,
  t: getMessage,
};

document.addEventListener('DOMContentLoaded', initDocsI18n);
