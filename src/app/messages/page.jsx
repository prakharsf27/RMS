import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Messages';

export const metadata = {
  title: 'Messages',
  description: 'Communicate with candidates and recruiters through TalentFlow's secure messaging platform.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
