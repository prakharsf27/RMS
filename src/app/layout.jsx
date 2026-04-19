import { Analytics } from "@vercel/analytics/next"
import { SITE_CONFIG, OrganizationSchema, WebsiteSchema } from '../lib/seo';
import JsonLd from '../components/JsonLd';
import Providers from '../components/Providers';
import './globals.css';

export const metadata = {
  title: {
    default:  `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: 'TalentFlow uses AI to build ATS-optimized resumes, simulate real job interviews, track applications, and deliver salary intelligence.',
  keywords:    ['AI resume builder', 'mock interview practice', 'ATS resume checker', 'job application tracker'],
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  robots: {
    index:     true,
    follow:    true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-snippet':       -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type:        'website',
    siteName:    SITE_CONFIG.name,
    locale:      SITE_CONFIG.locale,
    url:         SITE_CONFIG.url,
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: 'AI-powered career platform. Build your resume, ace interviews, track applications.',
    images: [
      {
        url:    '/og/default.png',
        width:  1200,
        height: 630,
        alt:    `${SITE_CONFIG.name} — AI Career Platform`,
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    site:        SITE_CONFIG.twitter,
    creator:     SITE_CONFIG.twitter,
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: 'AI-powered career platform. Build your resume, ace interviews, track applications.',
    images:      ['/og/default.png'],
  },
  applicationName:  SITE_CONFIG.name,
  category:         SITE_CONFIG.category,
  verification: SITE_CONFIG.verification,
};

export const viewport = {
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <JsonLd schema={[OrganizationSchema, WebsiteSchema]} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
