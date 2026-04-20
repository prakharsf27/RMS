import { AppLayout } from '../../components/layout/AppLayout';
import View from '../../views/ResumeAI';

export const metadata = {
  title: 'ResumeAI',
};

export default function Page() {
  return <AppLayout noPadding={true}><View /></AppLayout>;
}
