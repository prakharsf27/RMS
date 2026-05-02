import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/CareerPath';

export const metadata = {
  title: 'Career Path Planner',
  description: 'Map your career trajectory and explore growth opportunities with AI-guided career planning.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
