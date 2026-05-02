import View from '../../views/Login';

export const metadata = {
  title: 'Sign In — TalentFlow',
  description: 'Sign in to TalentFlow to manage your job applications, schedule interviews, and accelerate your recruitment journey.',
  alternates: { canonical: '/login' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sign In — TalentFlow',
    description: 'Sign in to TalentFlow to manage your job applications, schedule interviews, and accelerate your recruitment journey.',
    url: '/login',
    type: 'website',
  },
};

export default function Page() {
  return <View />;
}
