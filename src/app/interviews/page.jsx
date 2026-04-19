import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Interviews';

export const metadata = {
  title: 'Interviews',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
