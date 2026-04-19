import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Candidates';

export const metadata = {
  title: 'Candidates',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
