import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Messages';

export const metadata = {
  title: 'Messages',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
