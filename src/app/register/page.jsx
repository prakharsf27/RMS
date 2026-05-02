import View from '../../views/Login';

export const metadata = {
  title: 'Create Account — TalentFlow',
  description: 'Join TalentFlow to build your AI resume, practice mock interviews, and accelerate your career growth. Register today to start your journey.',
  alternates: { canonical: '/register' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Create Account — TalentFlow',
    description: 'Join TalentFlow to build your AI resume, practice mock interviews, and accelerate your career growth.',
    url: '/register',
    type: 'website',
  },
};

export default function RegisterPage() {
  return <View initialMode="register" />;
}
