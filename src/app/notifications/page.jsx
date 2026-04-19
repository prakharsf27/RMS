import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Notifications';

export const metadata = {
  title: 'Notifications',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
