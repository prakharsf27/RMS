/**
 * src/lib/seo.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central SEO configuration for TalentFlow (Next.js App Router).
 */

/* ── Site-wide constants ─────────────────────────────────────────────────── */
export const SITE_CONFIG = {
  name:           'TalentFlow',
  tagline:        'AI Resume Builder & Interview Simulator',
  url:            'https://talentflow.app',
  twitter:        '@TalentFlowApp',
  locale:         'en_US',
  defaultOGImage: '/og/default.png',
  themeColor:     '#6366f1',
  category:       'Career & Job Search',

  verification: {
    google: 'REPLACE_WITH_GOOGLE_VERIFICATION_CODE',
    yandex: 'REPLACE_WITH_YANDEX_CODE',
    bing:   'REPLACE_WITH_BING_CODE',
  },
};

export function buildMetadata({
  title,
  description,
  keywords,
  url         = '/',
  image,
  type        = 'website',
  noIndex     = false,
  article,
} = {}) {
  const { name, url: siteUrl, twitter, locale, defaultOGImage } = SITE_CONFIG;

  const fullTitle    = title ? `${title} | ${name}` : `${name} — AI Resume Builder & Interview Simulator`;
  const canonicalUrl = `${siteUrl}${url}`;
  const ogImage      = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
    : `${siteUrl}${defaultOGImage}`;

  return {
    title: {
      default:  fullTitle,
      template: `%s | ${name}`,
    },
    description,
    ...(keywords && { keywords: keywords.split(',').map(k => k.trim()) }),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index:    true,
          follow:   true,
          googleBot: {
            index:                true,
            follow:               true,
            'max-snippet':        -1,
            'max-image-preview':  'large',
            'max-video-preview':  -1,
          },
        },
    openGraph: {
      type,
      siteName:    name,
      title:       fullTitle,
      description,
      url:         canonicalUrl,
      locale,
      images: [
        {
          url:    ogImage,
          width:  1200,
          height: 630,
          alt:    fullTitle,
        },
      ],
      ...(type === 'article' && article && {
        publishedTime: article.publishedAt,
        modifiedTime:  article.updatedAt || article.publishedAt,
        authors:       [article.author],
        section:       article.section,
        tags:          article.tags,
      }),
    },
    twitter: {
      card:        'summary_large_image',
      site:        twitter,
      creator:     twitter,
      title:       fullTitle,
      description,
      images:      [ogImage],
    },
  };
}

export const SoftwareAppSchema = {
  '@context':             'https://schema.org',
  '@type':                'SoftwareApplication',
  name:                   'TalentFlow',
  url:                    'https://talentflow.app',
  applicationCategory:    'BusinessApplication',
  applicationSubCategory: 'CareerApplication',
  operatingSystem:        'Web, iOS, Android',
  description:            'AI-powered career platform that builds ATS-optimized resumes, simulates real job interviews, tracks applications, and provides salary intelligence.',
  inLanguage:             'en',
  isAccessibleForFree:    true,
  offers: [
    { '@type': 'Offer', name: 'Free',  price: '0',  priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro',   price: '19', priceCurrency: 'USD',
      priceSpecification: { '@type': 'RecurringChargeSpecification', billingDuration: 1 } },
  ],
  aggregateRating: {
    '@type':       'AggregateRating',
    ratingValue:   '4.8',
    bestRating:    '5',
    worstRating:   '1',
    ratingCount:   '2140',
    reviewCount:   '1380',
  },
  creator: {
    '@type': 'Organization',
    name:    'TalentFlow Inc.',
    url:     'https://talentflow.app',
    sameAs: [
      'https://twitter.com/TalentFlowApp',
      'https://linkedin.com/company/talentflow',
    ],
  },
};

export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:       'TalentFlow',
  url:        'https://talentflow.app',
  description: 'AI-powered career platform for job seekers.',
  foundingDate: '2024',
  contactPoint: {
    '@type':           'ContactPoint',
    contactType:       'customer support',
    email:             'hello@talentflow.app',
    availableLanguage: 'English',
  },
};

export const WebsiteSchema = {
  '@context':   'https://schema.org',
  '@type':      'WebSite',
  name:         'TalentFlow',
  url:          'https://talentflow.app',
  description:  'AI-powered career platform.',
  potentialAction: {
    '@type':       'SearchAction',
    target: {
      '@type':     'EntryPoint',
      urlTemplate: 'https://talentflow.app/jobs?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export function BreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      item.name,
      item:      `https://talentflow.app${item.url}`,
    })),
  };
}

export function FAQSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name:    q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function HowToSchema({ name, description, steps }) {
  return {
    '@context':  'https://schema.org',
    '@type':     'HowTo',
    name,
    description,
    step: steps.map((s, i) => ({
      '@type':  'HowToStep',
      position: i + 1,
      name:     s.name,
      text:     s.text,
    })),
  };
}

export function JobPostingSchema({ title, description, company, location, remote, salary, currency = 'USD', postedAt, validUntil, jobType = 'FULL_TIME' }) {
  return {
    '@context':    'https://schema.org',
    '@type':       'JobPosting',
    title,
    description,
    datePosted:    postedAt,
    validThrough:  validUntil,
    employmentType: jobType,
    hiringOrganization: { '@type': 'Organization', name: company },
    jobLocation: {
      '@type':  'Place',
      address: remote
        ? { '@type': 'PostalAddress', addressCountry: 'US' }
        : { '@type': 'PostalAddress', ...location },
    },
    ...(remote && { jobLocationType: 'TELECOMMUTE' }),
    ...(salary && {
      baseSalary: {
        '@type':    'MonetaryAmount',
        currency,
        value: { '@type': 'QuantitativeValue', value: salary, unitText: 'YEAR' },
      },
    }),
  };
}
