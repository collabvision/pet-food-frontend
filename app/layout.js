import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';
import TopBar from '../components/TopBar';

export const metadata = {
  title: {
    default: 'FurNest — Happy Pets. Happier Humans.',
    template: '%s · FurNest',
  },
  description:
    'Premium pet food, vet-approved products and expert care advice for dogs, cats and every member of the family with fur, feathers or fins.',
  manifest: '/manifest.json',
  applicationName: 'FurNest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FurNest',
  },
};

export const viewport = {
  themeColor: '#1B2559',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AuthProvider>
          <TopBar />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
