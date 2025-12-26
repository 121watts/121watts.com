/**
 * Premium Resume - minimal client JS
 * - Render from single content model: src/content/resume.json
 * - Theme toggle (persisted)
 * - Sticky nav active section highlight
 * - Copy email with accessible confirmation
 * - Print: expand role details before printing
 */

const CONTENT_URL = './src/content/resume.json';
const THEME_KEY = 'resume_theme';

const DOT = ' ' + String.fromCharCode(0x2022) + ' ';
const NDASH = String.fromCharCode(0x2013);

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === 'class') node.className = String(v);
    else if (k === 'text') node.textContent = String(v);
    else if (k === 'html') node.innerHTML = String(v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function safeText(value, fallback = '') {
  return typeof value === 'string' && value.length ? value : fallback;
}

function getUi(data) {
  const ui = data?.ui ?? {};
  return {
    buttons: ui.buttons ?? {},
    labels: ui.labels ?? {},
    a11y: ui.a11y ?? {},
    announcements: ui.announcements ?? {},
  };
}

function getSections(data) {
  return data?.sections ?? {};
}

function setMeta(data) {
  const title = data?.meta?.siteTitle || data?.meta?.name || 'Resume';
  const desc = data?.meta?.description || '';

  document.title = title;

  const author = data?.meta?.name || '';
  document.querySelector('meta[name="author"]')?.setAttribute('content', author);

  const setContent = (id, value) => {
    const m = qs(`#${id}`);
    if (!m) return;
    if (m.tagName === 'LINK') m.setAttribute('href', value);
    else m.setAttribute('content', value);
  };

  const cleanUrl = new URL(window.location.href);
  cleanUrl.hash = '';

  qs('#meta-title') && (qs('#meta-title').textContent = title);
  qs('#meta-description')?.setAttribute('content', desc);

  setContent('og-title', title);
  setContent('og-description', desc);
  setContent('twitter-title', title);
  setContent('twitter-description', desc);
  setContent('og-url', cleanUrl.toString());

  const canonical = qs('#canonical');
  if (canonical) canonical.setAttribute('href', cleanUrl.toString());
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

function applyTheme(theme, { persist = false } = {}) {
  document.documentElement.setAttribute('data-theme', theme);

  const btn = qs('[data-action="theme-toggle"]');
  if (btn) {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (persist) storeTheme(theme);
}

function initTheme() {
  const stored = readStoredTheme();
  const initial = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

  const btn = qs('[data-action="theme-toggle"]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark', { persist: true });
  });
}

function announce(message) {
  const live = qs('#live-region');
  if (!live) return;
  live.textContent = '';
  window.setTimeout(() => {
    live.textContent = message;
  }, 20);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function formatDates(dates) {
  const start = dates?.start ?? '';
  const end = dates?.end ?? '';
  if (!start && !end) return '';
  if (start && end) return start + NDASH + end;
  return start || end;
}

function setA11yCopy(data) {
  const { buttons, a11y } = getUi(data);

  const skip = qs('.skip-link');
  if (skip) skip.textContent = safeText(a11y.skipToContent, skip.textContent || 'Skip to content');

  const themeText = safeText(buttons.theme, 'Theme');
  const themeSpan = qs('.icon-btn-text');
  if (themeSpan) themeSpan.textContent = themeText;
}

function renderHeader(data) {
  const mark = qs('#brand-mark');
  const name = qs('#brand-name');

  if (mark) mark.textContent = data?.brand?.mark ?? '';
  if (name) name.textContent = data?.brand?.name ?? 'Resume';

  const nav = qs('#site-nav');
  if (!nav) return;

  nav.innerHTML = '';
  const items = Array.isArray(data?.nav) ? data.nav : [];
  for (const item of items) {
    nav.appendChild(
      el('a', {
        class: 'nav-link',
        href: `#${item.id}`,
        'data-nav': item.id,
        text: item.label
      })
    );
  }
}

function renderHero(data) {
  const meta = data?.meta ?? {};
  const hero = data?.hero ?? {};
  const contact = data?.contact ?? {};
  const { buttons, labels } = getUi(data);

  const titleParts = (meta.name || '').split(' ');
  const accent = titleParts.length >= 2 ? titleParts[1] : '';

  const h1 = el('h1', { class: 'hero-title', id: 'hero-title' }, [
    el('span', { text: meta.name || 'Resume' }),
  ]);

  if (accent && meta.name) {
    const safe = meta.name.replace(accent, '__ACCENT__');
    const [before, after] = safe.split('__ACCENT__');
    h1.innerHTML = '';
    h1.appendChild(document.createTextNode(before));
    h1.appendChild(el('em', { text: accent }));
    h1.appendChild(document.createTextNode(after));
  }

  const primaryCtaLabel = hero?.cta?.primary?.label || labels.email || 'Email';
  const primaryCtaHref = hero?.cta?.primary?.href || (contact.email ? `mailto:${contact.email}` : '#');

  const ctaRow = el('div', { class: 'cta-row' }, [
    el('a', { class: 'btn btn-primary', href: primaryCtaHref, text: primaryCtaLabel }),
    el('button', {
      class: 'btn btn-quiet',
      type: 'button',
      'data-action': 'copy-email',
      'data-email': contact.email || '',
      text: buttons.copyEmail || 'Copy email'
    }),
    ...(Array.isArray(hero?.cta?.secondary) ? hero.cta.secondary.map((l) =>
      el('a', { class: 'btn btn-quiet', href: l.href, target: '_blank', rel: 'noopener noreferrer', text: l.label })
    ) : []),
    el('button', { class: 'btn btn-quiet', type: 'button', 'data-action': 'print', text: buttons.print || 'Print' })
  ]);

  const card = el('div', { class: 'hero-card reveal' }, [
    el('div', { class: 'hero-meta' }, [
      el('div', { class: 'meta-row' }, [
        el('span', { class: 'meta-label', text: labels.role || 'Role' }),
        el('span', { class: 'meta-value', text: meta.role || '' })
      ]),
      el('div', { class: 'meta-row' }, [
        el('span', { class: 'meta-label', text: labels.current || 'Current' }),
        el('span', { class: 'meta-value', text: hero.current || '' })
      ]),
      el('div', { class: 'meta-row' }, [
        el('span', { class: 'meta-label', text: labels.previously || 'Previously' }),
        el('span', { class: 'meta-value', text: (Array.isArray(hero.previous) ? hero.previous.join(DOT) : '') })
      ]),
      el('div', { class: 'meta-row' }, [
        el('span', { class: 'meta-label', text: labels.location || 'Location' }),
        el('span', { class: 'meta-value', text: [meta.location, meta.timezone].filter(Boolean).join(DOT) })
      ])
    ])
  ]);

  const prose = el('div', { class: 'hero-prose reveal' }, [
    ...(Array.isArray(hero.intro) ? hero.intro.map((p) => el('p', {}, [p])) : []),
    ctaRow,
    el('div', { class: 'toast', id: 'copy-toast', text: '' })
  ]);

  return el('section', { class: 'hero section', 'aria-labelledby': 'hero-title' }, [
    el('div', { class: 'hero-grid' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow reveal', text: (Array.isArray(hero.eyebrow) ? hero.eyebrow.join(DOT) : (hero.eyebrow || '')) }),
        el('div', { class: 'reveal' }, [h1]),
        el('p', { class: 'hero-subtitle reveal', text: meta.valueStatement || '' }),
        prose
      ]),
      card
    ])
  ]);
}

function renderImpact(data) {
  const impact = data?.impact ?? {};
  return el('section', { class: 'section', 'aria-labelledby': 'impact-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'impact-title', text: impact.title || 'Impact' }),
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: impact.kicker || '' }),
        el('ul', { class: 'chips reveal' }, (Array.isArray(impact.items) ? impact.items : []).map((t) =>
          el('li', { class: 'chip', text: t })
        ))
      ])
    ])
  ]);
}

function renderExperience(data) {
  const roles = Array.isArray(data?.experience) ? data.experience : [];
  const sec = getSections(data).experience ?? {};
  const headings = sec.headings ?? {};

  const list = el('div', { class: 'roles' }, roles.map((r, idx) => {
    return el('details', { class: 'role reveal', ...(idx === 0 ? { open: '' } : {}) }, [
      el('summary', {}, [
        el('div', {}, [
          el('span', { class: 'role-title', text: r.title || '' }),
          document.createTextNode(' '),
          el('span', { class: 'role-company', text: r.company || '' })
        ]),
        el('span', { class: 'role-dates', text: formatDates(r.dates) })
      ]),
      ...(r.subtitle ? [el('p', { class: 'role-subtitle', text: r.subtitle })] : []),
      el('div', { class: 'role-body' }, [
        el('div', { class: 'role-grid' }, [
          el('div', {}, [
            el('h3', { class: 'role-h', text: headings.scope || 'Scope' }),
            el('p', { class: 'role-p', text: r.scope || '' }),
            el('h3', { class: 'role-h', style: 'margin-top: 0.9rem', text: headings.highlights || 'Highlights' }),
            el('ul', { class: 'role-bullets' }, (Array.isArray(r.highlights) ? r.highlights : []).map((b) => el('li', {}, [b])))
          ]),
          el('div', {}, [
            el('h3', { class: 'role-h', text: headings.tech || 'Tech' }),
            el('p', { class: 'role-p', text: r.tech || '' }),
            el('h3', { class: 'role-h', style: 'margin-top: 0.9rem', text: headings.leadership || 'Leadership' }),
            el('ul', { class: 'role-bullets' }, (Array.isArray(r.leadership) ? r.leadership : []).map((b) => el('li', {}, [b])))
          ])
        ])
      ])
    ]);
  }));

  return el('section', { class: 'section', id: 'experience', 'aria-labelledby': 'experience-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'experience-title', text: sec.title || 'Experience' }),
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: sec.kicker || '' }),
        list,
        sec.note ? el('p', { class: 'note reveal', text: sec.note }) : null
      ])
    ])
  ]);
}

function renderProjects(data) {
  const items = Array.isArray(data?.projects) ? data.projects : [];
  const sec = getSections(data).projects ?? {};
  const cards = el('div', { class: 'cards' }, items.map((p) => {
    const links = Array.isArray(p.links) ? p.links : [];

    const headRight = el('div', {}, [
      p.year ? el('span', { class: 'card-meta', text: p.year }) : el('span', { class: 'card-meta', text: '' })
    ]);

    const title = el('h3', { class: 'card-title', text: p.name || '' });

    const metaLine = [p.role, links.length ? links.map(l => l.label).join(DOT) : ''].filter(Boolean).join(DOT);

    const linkRow = links.length
      ? el('div', { class: 'tag-row' }, links.map((l) => el('a', { class: 'tag', href: l.href, target: '_blank', rel: 'noopener noreferrer', text: l.label })))
      : null;

    return el('article', { class: 'card reveal' }, [
      el('div', { class: 'card-head' }, [
        el('div', {}, [title]),
        headRight
      ]),
      metaLine ? el('p', { class: 'card-meta', text: metaLine }) : null,
      el('p', { class: 'card-body', text: p.summary || '' }),
      el('ul', { class: 'card-bullets' }, (Array.isArray(p.highlights) ? p.highlights : []).map((h) => el('li', {}, [h]))),
      el('div', { class: 'tag-row' }, (Array.isArray(p.tags) ? p.tags : []).map((t) => el('span', { class: 'tag', text: t }))),
      linkRow
    ]);
  }));

  return el('section', { class: 'section', id: 'projects', 'aria-labelledby': 'projects-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'projects-title', text: sec.title || 'Projects' }),
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: sec.kicker || '' }),
        cards
      ])
    ])
  ]);
}

function renderSkills(data) {
  const groups = Array.isArray(data?.skills) ? data.skills : [];
  const sec = getSections(data).skills ?? {};

  const grid = el('div', { class: 'skill-grid' }, groups.map((g) =>
    el('section', { class: 'skill reveal', 'aria-label': g.group || sec.title || '' }, [
      el('h3', { class: 'skill-title', text: g.group || '' }),
      el('div', { class: 'tag-row', style: 'margin-top: 0.7rem' }, (Array.isArray(g.items) ? g.items : []).map((t) =>
        el('span', { class: 'tag', text: t })
      ))
    ])
  ));

  return el('section', { class: 'section', id: 'skills', 'aria-labelledby': 'skills-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'skills-title', text: sec.title || 'Skills' })
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: sec.kicker || '' }),
        grid
      ])
    ])
  ]);
}

function renderWriting(data) {
  const items = Array.isArray(data?.writing) ? data.writing : [];
  const sec = getSections(data).writing ?? {};

  const cards = el('div', { class: 'cards' }, items.map((w) => {
    const title = w.href
      ? el('a', { href: w.href, target: '_blank', rel: 'noopener noreferrer', text: w.title || '' })
      : el('span', { text: w.title || '' });

    return el('article', { class: 'card reveal' }, [
      el('h3', { class: 'card-title' }, [title]),
      el('p', { class: 'card-meta', text: w.meta || '' })
    ]);
  }));

  return el('section', { class: 'section', id: 'writing', 'aria-labelledby': 'writing-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'writing-title', text: sec.title || 'Writing' })
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: sec.kicker || '' }),
        cards
      ])
    ])
  ]);
}

function renderContact(data) {
  const contact = data?.contact ?? {};
  const note = data?.contactSection?.note ?? '';
  const hero = data?.hero ?? {};
  const sec = getSections(data).contact ?? {};
  const { buttons, labels } = getUi(data);

  const primaryCtaLabel = hero?.cta?.primary?.label || labels.email || 'Email';
  const primaryCtaHref = hero?.cta?.primary?.href || (contact.email ? `mailto:${contact.email}` : '#');

  const actions = el('div', { class: 'cta-row' }, [
    el('button', { class: 'btn btn-primary', type: 'button', 'data-action': 'copy-email', 'data-email': contact.email || '', text: buttons.copyEmail || 'Copy email' }),
    el('a', { class: 'btn btn-quiet', href: primaryCtaHref, text: primaryCtaLabel }),
    ...(Array.isArray(hero?.cta?.secondary) ? hero.cta.secondary.map((l) =>
      el('a', { class: 'btn btn-quiet', href: l.href, target: '_blank', rel: 'noopener noreferrer', text: l.label })
    ) : []),
    el('button', { class: 'btn btn-quiet', type: 'button', 'data-action': 'print', text: buttons.print || 'Print' })
  ]);

  return el('section', { class: 'section', id: 'contact', 'aria-labelledby': 'contact-title' }, [
    el('div', { class: 'section-grid' }, [
      el('div', { class: 'section-label reveal' }, [
        el('div', { class: 'section-title', id: 'contact-title', text: sec.title || 'Contact' })
      ]),
      el('div', {}, [
        el('p', { class: 'section-kicker reveal', text: sec.kicker || '' }),
        el('div', { class: 'contact-card reveal' }, [
          el('div', { class: 'contact-row' }, [
            el('span', { class: 'meta-label', text: labels.email || 'Email' }),
            el('a', { class: 'contact-link', href: contact.email ? `mailto:${contact.email}` : '#', text: contact.email || '' })
          ]),
          el('div', { style: 'margin-top: 0.85rem' }, [actions]),
          note ? el('p', { class: 'note', style: 'margin-top: 0.85rem', text: note }) : null
        ])
      ])
    ])
  ]);
}

function renderFooter(data) {
  const f = data?.footer ?? {};
  const node = qs('#footer');
  if (!node) return;
  node.innerHTML = '';
  node.appendChild(el('div', { text: f.line1 || '' }));
  node.appendChild(el('div', { text: f.line2 || '' }));
}

function initReveals() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((n) => n.classList.add('is-in'));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      }
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  document.querySelectorAll('.reveal').forEach((n) => obs.observe(n));
}

function initActiveNav(sectionIds) {
  const nav = qs('#site-nav');
  if (!nav) return;

  const links = new Map();
  for (const a of nav.querySelectorAll('a[data-nav]')) {
    links.set(a.getAttribute('data-nav'), a);
  }

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length === 0) return;

  const setActive = (id) => {
    for (const [k, a] of links.entries()) {
      if (k === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));

      if (visible.length) setActive(visible[0].target.id);
    },
    { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0.01 }
  );

  for (const s of sections) obs.observe(s);

  const fromHash = window.location.hash ? window.location.hash.slice(1) : '';
  if (fromHash && links.has(fromHash)) setActive(fromHash);
  else for (const [, a] of links.entries()) a.removeAttribute('aria-current');
}

function initExclusiveDetails() {
  document.addEventListener('toggle', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLDetailsElement)) return;
    if (!target.classList.contains('role')) return;
    if (!target.open) return;

    document.querySelectorAll('details.role[open]').forEach((d) => {
      if (d !== target) d.open = false;
    });
  }, true);
}

function initPrintHandling() {
  let opened = [];

  const openAll = () => {
    opened = [];
    document.querySelectorAll('details.role').forEach((d) => {
      if (d.open) opened.push(d);
      d.open = true;
    });
  };

  const restore = () => {
    document.querySelectorAll('details.role').forEach((d) => { d.open = false; });
    opened.forEach((d) => { d.open = true; });
  };

  window.addEventListener('beforeprint', openAll);
  window.addEventListener('afterprint', restore);

  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-action="print"]') : null;
    if (!btn) return;
    openAll();
    window.print();
  });
}

function initActions(data) {
  const { announcements } = getUi(data);
  const okMsg = announcements.emailCopied || 'Email copied.';
  const failMsg = announcements.emailCopyFailed || 'Could not copy email.';

  document.addEventListener('click', async (e) => {
    const target = e.target instanceof Element ? e.target.closest('[data-action="copy-email"]') : null;
    if (!target) return;

    const email = target.getAttribute('data-email') || '';
    if (!email) return;

    try {
      await copyText(email);
      const toast = qs('#copy-toast');
      if (toast) toast.textContent = okMsg;
      announce(okMsg);
      window.setTimeout(() => { if (toast) toast.textContent = ''; }, 1400);
    } catch {
      announce(failMsg);
    }
  });
}

async function loadContent() {
  const res = await fetch(CONTENT_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
  return await res.json();
}

function renderApp(data) {
  setA11yCopy(data);
  renderHeader(data);
  setMeta(data);

  const app = qs('#app');
  if (!app) return;

  app.innerHTML = '';
  app.appendChild(renderHero(data));
  app.appendChild(renderImpact(data));
  app.appendChild(renderExperience(data));
  app.appendChild(renderProjects(data));
  app.appendChild(renderSkills(data));
  app.appendChild(renderWriting(data));
  app.appendChild(renderContact(data));

  renderFooter(data);

  initExclusiveDetails();
  initReveals();
  initActiveNav((Array.isArray(data?.nav) ? data.nav : []).map((i) => i.id));
}

async function main() {
  initTheme();
  initPrintHandling();

  try {
    const data = await loadContent();
    renderApp(data);
    initActions(data);
  } catch (err) {
    console.error(err);
    const app = qs('#app');
    if (app) {
      app.innerHTML = '';
      app.appendChild(el('div', { class: 'noscript' }, [
        el('p', {}, ['Could not load resume content.']),
        el('p', { class: 'note' }, ['Check that ', CONTENT_URL, ' is present and valid JSON.'])
      ]));
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}






