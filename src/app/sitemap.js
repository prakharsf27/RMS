const SITE_URL = 'https://talentflow.app';
const TODAY    = new Date().toISOString();

export default async function sitemap() {
  const staticPages = [
    { url: `${SITE_URL}/`, lastModified: TODAY, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/resume-ai`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/interview-simulator`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/salary`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/jobs`, lastModified: TODAY, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date('2026-04-01').toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: TODAY, changeFrequency: 'daily', priority: 0.7 },
  ];

  return [...staticPages];
}
