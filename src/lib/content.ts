export type ResumeData = {
  meta: {
    name: string;
    role: string;
    valueStatement: string;
    location?: string;
    timezone?: string;
    siteTitle?: string;
    description?: string;
  };
  brand?: {
    mark?: string;
    name?: string;
  };
  ui?: {
    a11y?: { skipToContent?: string };
    buttons?: Record<string, string>;
    labels?: Record<string, string>;
  };
  sections?: {
    experience?: { title?: string; kicker?: string; headings?: Record<string, string> };
    contact?: { title?: string; kicker?: string };
  };
  contact: {
    email: string;
    linkedin?: string;
    github?: string;
  };
  nav?: Array<{ id: string; label: string }>;
  hero?: {
    eyebrow?: string[];
    intro?: string[];
    current?: string;
    previous?: string[];
  };
  experience?: Array<{
    company: string;
    title: string;
    subtitle?: string;
    dates?: { start?: string; end?: string };
    scope?: string;
    highlights?: string[];
    tech?: string;
    leadership?: string[];
  }>;
  contactSection?: { note?: string };
  footer?: { line1?: string; line2?: string };
};

export type ResumeViewModel = {
  meta: {
    name: string;
    role: string;
    valueStatement: string;
    location: string;
    timezone: string;
    siteTitle: string;
    description: string;
  };
  brand: {
    mark: string;
    name: string;
  };
  a11y: {
    skipToContent: string;
  };
  sections: {
    experience: { title: string; kicker: string };
    contact: { title: string; kicker: string };
  };
  contact: {
    email: string;
    emailHref: string;
    linkedin?: string;
    github?: string;
  };
  hero: {
    eyebrow: string[];
    intro: string[];
    current: string;
    previous: string[];
  };
  experience: Array<{
    company: string;
    title: string;
    subtitle?: string;
    datesLabel: string;
    scope?: string;
    highlights: string[];
    tech?: string;
    leadership: string[];
  }>;
  footer: { line1: string; line2: string };
  contactSection?: { note?: string };
};

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

function joinDates(start?: string, end?: string): string {
  const s = asNonEmptyString(start);
  const e = asNonEmptyString(end);
  if (s && e) return `${s}—${e}`;
  if (s && !e) return `${s}—`;
  if (!s && e) return e;
  return '';
}

export function toResumeViewModel(data: ResumeData): ResumeViewModel {
  const name = asNonEmptyString(data?.meta?.name) ?? 'Your Name';
  const role = asNonEmptyString(data?.meta?.role) ?? 'Role';
  const valueStatement = asNonEmptyString(data?.meta?.valueStatement) ?? 'A short value statement.';
  const location = asNonEmptyString(data?.meta?.location) ?? '';
  const timezone = asNonEmptyString(data?.meta?.timezone) ?? '';
  const siteTitle = asNonEmptyString(data?.meta?.siteTitle) ?? `${name} — ${role}`;
  const description = asNonEmptyString(data?.meta?.description) ?? valueStatement;

  const mark = asNonEmptyString(data?.brand?.mark) ?? name.split(/\s+/)[0].slice(0, 3).toUpperCase();
  const brandName = asNonEmptyString(data?.brand?.name) ?? role.toUpperCase();

  const skipToContent = asNonEmptyString(data?.ui?.a11y?.skipToContent) ?? 'Skip to content';

  const experienceTitle = asNonEmptyString(data?.sections?.experience?.title) ?? 'Experience';
  const experienceKicker = asNonEmptyString(data?.sections?.experience?.kicker) ?? '';
  const contactTitle = asNonEmptyString(data?.sections?.contact?.title) ?? 'Contact';
  const contactKicker = asNonEmptyString(data?.sections?.contact?.kicker) ?? '';

  const email = asNonEmptyString(data?.contact?.email) ?? '';
  const emailHref = email ? `mailto:${email}` : 'mailto:';

  const eyebrow = Array.isArray(data?.hero?.eyebrow) ? data.hero!.eyebrow!.filter((x) => typeof x === 'string' && x.trim()) : [];
  const intro = Array.isArray(data?.hero?.intro) ? data.hero!.intro!.filter((x) => typeof x === 'string' && x.trim()) : [];
  const current = asNonEmptyString(data?.hero?.current) ?? '';
  const previous = Array.isArray(data?.hero?.previous) ? data.hero!.previous!.filter((x) => typeof x === 'string' && x.trim()) : [];

  const experience = Array.isArray(data?.experience) ? data.experience! : [];
  const expVm = experience
    .filter((e) => e && asNonEmptyString(e.company) && asNonEmptyString(e.title))
    .map((e) => {
      const highlights = Array.isArray(e.highlights) ? e.highlights.filter((x) => typeof x === 'string' && x.trim()) : [];
      const leadership = Array.isArray(e.leadership) ? e.leadership.filter((x) => typeof x === 'string' && x.trim()) : [];
      const datesLabel = joinDates(e.dates?.start, e.dates?.end);
      return {
        company: e.company.trim(),
        title: e.title.trim(),
        subtitle: asNonEmptyString(e.subtitle) ?? undefined,
        datesLabel,
        scope: asNonEmptyString(e.scope) ?? undefined,
        highlights,
        tech: asNonEmptyString(e.tech) ?? undefined,
        leadership,
      };
    });

  const footerLine1 = asNonEmptyString(data?.footer?.line1) ?? '';
  const footerLine2 = asNonEmptyString(data?.footer?.line2) ?? '';

  return {
    meta: { name, role, valueStatement, location, timezone, siteTitle, description },
    brand: { mark, name: brandName },
    a11y: { skipToContent },
    sections: {
      experience: { title: experienceTitle, kicker: experienceKicker },
      contact: { title: contactTitle, kicker: contactKicker },
    },
    contact: {
      email,
      emailHref,
      linkedin: asNonEmptyString(data?.contact?.linkedin) ?? undefined,
      github: asNonEmptyString(data?.contact?.github) ?? undefined,
    },
    hero: {
      eyebrow,
      intro,
      current,
      previous,
    },
    experience: expVm,
    footer: { line1: footerLine1, line2: footerLine2 },
    contactSection: data?.contactSection,
  };
}

export async function loadResume(): Promise<ResumeViewModel> {
  const mod = await import('../content/resume.json');
  const data = (mod as any).default ?? mod;
  return toResumeViewModel(data as ResumeData);
}
