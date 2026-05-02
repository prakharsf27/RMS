const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rms-blush-iota.vercel.app';
const TODAY    = new Date().toISOString();

export default async function sitemap() {
  const staticPages = [
    { url: `${SITE_URL}/`,         lastModified: TODAY, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/login`,    lastModified: TODAY, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/register`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/jobs`,     lastModified: TODAY, changeFrequency: 'daily',   priority: 0.9 },
  ];

  return [...staticPages];
}

