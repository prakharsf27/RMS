import { AppLayout } from '../../components/layout/AppLayout';
import Verification from '../../views/Verification';

export const metadata = {
  title: 'Company Verification',
  description: 'Admin portal for verifying recruiter company credentials and platform trust.',
  robots: { index: false, follow: false },
};

export default function VerificationPage() {
  return <AppLayout><Verification /></AppLayout>;
}
