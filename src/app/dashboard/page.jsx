import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Dashboard';

export const metadata = {
  title: 'Dashboard',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
