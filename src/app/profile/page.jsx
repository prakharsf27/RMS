import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Profile';

export const metadata = {
  title: 'Profile',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
