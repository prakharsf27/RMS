const SITE_URL = 'https://talentflow.app';

export default function robots() {
  const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === 'production';

  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', '/jobs', '/jobs/', '/resume-ai', '/interview-simulator',
          '/salary', '/pricing', '/blog', '/blog/', '/about', '/contact',
        ],
        disallow: [
          '/dashboard', '/applications', '/messages', '/interviews',
          '/profile', '/settings', '/onboarding', '/login', '/register',
          '/api/', '/_next/', '/jobs?*page=', '/search?',
        ],
      },
      {
        userAgent:  'Googlebot-Image',
        allow:      ['/og/', '/images/', '/assets/'],
        disallow:   ['/dashboard', '/profile', '/applications'],
      },
      {
        userAgent: 'GPTBot',
        allow:     ['/blog/', '/'],
      },
      { userAgent: 'AhrefsBot',  crawlDelay: 10 },
      { userAgent: 'SemrushBot', crawlDelay: 10 },
      { userAgent: 'MJ12bot',  disallow: '/' },
      { userAgent: 'DotBot',   disallow: '/' },
      { userAgent: 'BLEXBot',  disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
