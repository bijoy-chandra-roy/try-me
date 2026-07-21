import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans_Bengali, Urbanist } from 'next/font/google';
import { auth } from '@/auth';
import { Header } from '@/shared/components/Header';
import { SessionSync } from '@/shared/components/SessionSync';
import { AuthRealtimeListener } from '@/shared/components/AuthRealtimeListener';
import { PreferencesHydrator } from '@/shared/components/PreferencesHydrator';
import { OnboardingTour } from '@/shared/components/OnboardingTour';
import { SessionProvider } from '@/shared/providers/SessionProvider';
import { PREFERENCES_BOOT_SCRIPT } from '@/shared/lib/preferences';
import { getSiteUrl } from '@/shared/lib/site-url';
import './globals.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'TryMe — Virtual Try-On Shopping',
  description: 'E-commerce with AI-powered virtual try-on. See clothes on you before you buy.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${cormorant.variable} ${notoBengali.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: PREFERENCES_BOOT_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <SessionProvider session={session}>
          <SessionSync />
          <AuthRealtimeListener />
          <PreferencesHydrator />
          <div className="ambient-bg" aria-hidden="true" />
          <Header />
          <main className="motion-fade-in">{children}</main>
          <OnboardingTour />
        </SessionProvider>
      </body>
    </html>
  );
}
