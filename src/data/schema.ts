import { site } from './site';

const ID = {
  physician: `${site.url}/#physician`,
  website: `${site.url}/#website`,
  org: `${site.url}/#organization`,
};

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: `${site.clinic.name}, ${site.clinic.street}`,
  addressLocality: site.clinic.locality,
  addressRegion: site.clinic.region,
  postalCode: site.clinic.postalCode,
  addressCountry: site.clinic.country,
};

const openingHours = site.hours.map((h) => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: h.days,
  opens: h.opens,
  closes: h.closes,
}));

/** Physician + MedicalBusiness — the entity Google uses for the local pack,
 *  knowledge panel and "urologist near me" results. */
export function physicianSchema(photo?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Physician', 'MedicalBusiness'],
    '@id': ID.physician,
    name: site.name,
    alternateName: 'Dr Raghavendra Kulkarni',
    url: site.url,
    ...(photo ? { image: photo, logo: photo } : {}),
    telephone: site.phone,
    email: site.email,
    medicalSpecialty: site.medicalSpecialty,
    address: postalAddress,
    geo: { '@type': 'GeoCoordinates', latitude: site.clinic.lat, longitude: site.clinic.lng },
    openingHoursSpecification: openingHours,
    areaServed: site.areaServed.map((n) => ({ '@type': 'City', name: n })),
    sameAs: Object.values(site.social),
    availableService: [
      'Prostate Treatment', 'Kidney Stone Treatment', 'Urologic Oncology',
      'Laparoscopic Urology', 'Andrology', 'Female Urology',
    ].map((n) => ({ '@type': 'MedicalProcedure', name: n })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ID.website,
    url: site.url,
    name: site.name,
    publisher: { '@id': ID.physician },
    inLanguage: 'en-IN',
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: new URL(t.url, site.url).href,
    })),
  };
}

/** MedicalWebPage beats plain Article for health content — it is the type
 *  Google's YMYL/health systems actually look for. */
export function articleSchema(o: {
  title: string; description: string; url: string; image: string;
  published: Date; modified?: Date; section: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalWebPage', 'Article'],
    headline: o.title,
    description: o.description,
    image: o.image,
    url: o.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': o.url },
    datePublished: o.published.toISOString(),
    dateModified: (o.modified ?? o.published).toISOString(),
    articleSection: o.section,
    inLanguage: 'en-IN',
    author: { '@type': 'Person', name: site.name, url: site.url, jobTitle: 'Consultant Urologist' },
    reviewedBy: { '@id': ID.physician },
    publisher: { '@id': ID.physician },
    about: { '@type': 'MedicalCondition', name: o.section },
  };
}

export function serviceSchema(o: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: o.name,
    description: o.description,
    url: o.url,
    performer: { '@id': ID.physician },
    bodyLocation: 'Urinary tract',
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}
