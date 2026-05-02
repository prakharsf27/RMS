import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Applications';

export const metadata = {
  title: 'Applications',
  description: 'Review and manage all job applications in your recruitment pipeline.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
