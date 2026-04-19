import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Company';

export const metadata = {
  title: 'Company',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
