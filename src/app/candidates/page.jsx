import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Candidates';

export const metadata = {
  title: 'Candidates & Users',
  description: 'Manage candidate profiles and user accounts across the recruitment platform.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
