import View from '../views/LandingPage';

export const metadata = {
  title: 'TalentFlow — AI-Powered Recruitment Management System',
  description: 'TalentFlow connects candidates and recruiters with AI. Build ATS-optimized resumes, simulate real interviews, track job applications, and streamline your entire hiring pipeline — all in one platform.',
  keywords: [
    'recruitment management system', 'RMS', 'AI hiring platform',
    'ATS resume builder', 'mock interview simulator', 'job tracker',
    'candidate management', 'recruiter platform', 'talent acquisition software',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  openGraph: {
    title: 'TalentFlow — AI-Powered Recruitment Management System',
    description: 'Connect candidates and recruiters with AI. Build resumes, practice interviews, track applications, and close roles faster.',
    url: '/',
    type: 'website',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'TalentFlow — AI Recruitment Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentFlow — AI-Powered Recruitment Platform',
    description: 'Connect candidates and recruiters with AI. Build resumes, practice interviews, track applications.',
    images: ['/og/default.png'],
  },
};

export default function Page() {
  return <View />;
}
