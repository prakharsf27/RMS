import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Reports';

export const metadata = {
  title: 'Recruitment Reports',
  description: 'Analytics and insights into your recruitment pipeline performance and hiring metrics.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
