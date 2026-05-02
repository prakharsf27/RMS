import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Company';

export const metadata = {
  title: 'Company Profile',
  description: 'Manage your company profile and recruiter information on TalentFlow.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
