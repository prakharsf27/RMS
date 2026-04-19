import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Reports';

export const metadata = {
  title: 'Reports',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
