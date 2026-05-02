import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Interviews';

export const metadata = {
  title: 'Interviews',
  description: 'Schedule, manage, and track candidate interviews across your recruitment pipeline.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
