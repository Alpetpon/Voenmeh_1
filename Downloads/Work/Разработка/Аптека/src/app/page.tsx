import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero-section';
import { RecommendationsSection } from '@/components/sections/recommendations-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { PromotionsSection } from '@/components/sections/promotions-section';

export const metadata: Metadata = {
  title: 'ЭкоЛайф - Аптечная сеть | Здоровье и качество жизни',
  description: 'Аптечная сеть ЭкоЛайф предлагает широкий ассортимент лекарственных препаратов, медицинских изделий и товаров для здоровья. Профессиональные консультации, доставка, онлайн-запись к фармацевту.',
  keywords: [
    'аптека',
    'лекарства',
    'здоровье',
    'медицина',
    'фармацевт',
    'консультация',
    'доставка лекарств',
    'ЭкоЛайф'
  ],
  openGraph: {
    title: 'ЭкоЛайф - Аптечная сеть | Здоровье и качество жизни',
    description: 'Аптечная сеть ЭкоЛайф предлагает широкий ассортимент лекарственных препаратов и товаров для здоровья',
    type: 'website',
    url: 'https://ecolife.ru',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'ЭкоЛайф - Аптечная сеть',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ЭкоЛайф - Аптечная сеть',
    description: 'Здоровье и качество жизни - широкий ассортимент лекарств и медицинских товаров',
    images: ['/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://ecolife.ru',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section с Bento Grid */}
      <HeroSection />

      {/* Рекомендации */}
      <RecommendationsSection />

      {/* Актуальные акции */}
      <PromotionsSection />

      {/* Популярные категории */}
      <CategoriesSection />
    </div>
  );
} 