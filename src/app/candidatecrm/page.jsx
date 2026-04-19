import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/CandidateCRM';

export const metadata = {
  title: 'CandidateCRM',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
