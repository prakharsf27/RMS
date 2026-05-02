import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/InterviewSimulator';

export const metadata = {
  title: 'Mock Interview Simulator',
  description: 'Practice real-world interview questions with AI-powered feedback to ace your next interview.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
