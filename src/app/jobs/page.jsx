import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Jobs';

export const metadata = {
  title: 'Browse Jobs',
  description: "Explore thousands of job opportunities curated to your skills and experience. Find your next role with TalentFlow's AI-powered job matching engine.",
  alternates: { canonical: '/jobs' },
  keywords: ['job search', 'recruitment', 'job openings', 'find jobs', 'career opportunities'],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Browse Jobs — TalentFlow',
    description: 'Explore thousands of job opportunities curated to your skills. AI-powered job matching for candidates and recruiters.',
    url: '/jobs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Jobs — TalentFlow',
    description: 'Find your next career opportunity with AI-powered job matching.',
  },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
