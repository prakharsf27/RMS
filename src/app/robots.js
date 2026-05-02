const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rms-blush-iota.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/jobs',
          '/jobs/',
          '/login',
          '/register',
        ],
        disallow: [
          '/dashboard',
          '/applications',
          '/messages',
          '/interviews',
          '/profile',
          '/candidates',
          '/reports',
          '/verification',
          '/company',
          '/resume-ai',
          '/recruiter-inbox',
          '/interview-simulator',
          '/career-path',
          '/api/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/og/', '/images/', '/'],
      },
      { userAgent: 'AhrefsBot',  crawlDelay: 10 },
      { userAgent: 'SemrushBot', crawlDelay: 10 },
      { userAgent: 'MJ12bot',  disallow: '/' },
      { userAgent: 'DotBot',   disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

