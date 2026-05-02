import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/ResumeAI';

export const metadata = {
  title: 'AI Resume Builder',
  description: 'Build an ATS-optimized resume with AI assistance tailored to any job posting.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout noPadding={true}><View /></AppLayout>;
}
