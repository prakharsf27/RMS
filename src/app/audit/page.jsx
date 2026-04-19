import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Audit';

export const metadata = {
  title: 'Audit',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
