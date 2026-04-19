import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/Jobs';

export const metadata = {
  title: 'Jobs',
};

export default function Page() {
  return <AppLayout><View /></AppLayout>;
}
