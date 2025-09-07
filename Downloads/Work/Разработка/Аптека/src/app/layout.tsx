import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

import { Toaster } from '@/components/ui/toaster';

const vezitsa = localFont({
  src: [
    {
      path: '../../public/assets/fonts/vezitsa-cyrillic.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-vezitsa',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ЭкоЛайф - Аптечная сеть',
    template: '%s | ЭкоЛайф',
  },
  description: 'Аптечная сеть ЭкоЛайф - здоровье и качество жизни. Широкий ассортимент лекарственных препаратов, медицинских изделий и товаров для здоровья.',
  keywords: ['аптека', 'лекарства', 'здоровье', 'медицина', 'ЭкоЛайф'],
  authors: [{ name: 'ЭкоЛайф' }],
  creator: 'ЭкоЛайф',
  publisher: 'ЭкоЛайф',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ecolife.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://ecolife.ru',
    siteName: 'ЭкоЛайф',
    title: 'ЭкоЛайф - Аптечная сеть',
    description: 'Аптечная сеть ЭкоЛайф - здоровье и качество жизни',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ЭкоЛайф - Аптечная сеть',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ЭкоЛайф - Аптечная сеть',
    description: 'Аптечная сеть ЭкоЛайф - здоровье и качество жизни',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body 
        className={`${vezitsa.variable} font-vezitsa antialiased min-h-screen bg-gradient-to-br from-white via-brand-blue/5 to-brand-green/10 dark:from-brand-black dark:via-brand-brown/20 dark:to-brand-green/10`}
      >
        <ThemeProvider
          defaultTheme="system"
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 