import type { Metadata } from 'next';
import { Cormorant_Garamond, Urbanist } from 'next/font/google';
import { auth } from '@/auth';
import { Header } from '@/shared/components/Header';
import { SessionSync } from '@/shared/components/SessionSync';
import { AuthRealtimeListener } from '@/shared/components/AuthRealtimeListener';
import { SessionProvider } from '@/shared/providers/SessionProvider';
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

export const metadata: Metadata = {
  title: 'TryMe — Virtual Try-On Shopping',
  description: 'E-commerce with AI-powered virtual try-on. See clothes on you before you buy.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" className={`${urbanist.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t==='system'||!t)&&matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <SessionProvider session={session}>
          <SessionSync />
          <AuthRealtimeListener />
          <div className="ambient-bg" aria-hidden="true" />
          <Header />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
