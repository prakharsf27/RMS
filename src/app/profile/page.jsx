import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Profile';

export const metadata = {
  title: 'My Profile',
  description: 'Manage your TalentFlow profile, resume, and career preferences.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
