import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Applications';

export const metadata = {
  title: 'Applications',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
