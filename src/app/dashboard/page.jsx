import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Dashboard';

export const metadata = {
  title: 'Dashboard',
  description: 'Your TalentFlow recruitment dashboard — track applications, interviews, job matches, and hiring pipeline activity in real time.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
