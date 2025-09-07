'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogFilters from '@/components/CatalogFilters';
import CatalogGrid from '@/components/CatalogGrid';
import { mockTours } from '@/lib/mockData';

interface FilterOptions {
  priceRange: [number, number];
  location: string;
  duration: string;
  rating: number;
  tourType: string;
  from: string;
  to: string;
  departureDate: string;
  guests: number;
  mealType: string;
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 2000000],
    location: '',
    duration: '',
    rating: 0,
    tourType: '',
    from: '',
    to: '',
    departureDate: '',
    guests: 1,
    mealType: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-grow pt-20">
        {/* Хлебные крошки */}
        <motion.section 
          className="bg-white border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-orange-500 transition-colors">
                Главная
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Каталог туров</span>
            </nav>
          </div>
        </motion.section>

        {/* Фильтры и поиск */}
        <CatalogFilters 
          onFiltersChange={handleFiltersChange}
          totalResults={mockTours.length}
        />

        {/* Сетка туров */}
        <CatalogGrid 
          filters={filters}
          searchQuery={searchQuery}
        />
      </main>

      <Footer />
    </div>
  );
}