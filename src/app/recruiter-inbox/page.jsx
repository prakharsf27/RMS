import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/RecruiterInbox';

export const metadata = {
  title: 'ATS Validator',
  description: 'Test and optimize your resume against ATS systems to maximize interview chances.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
