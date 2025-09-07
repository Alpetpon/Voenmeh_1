'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import TourCard from './TourCard';
import { mockTours } from '@/lib/mockData';
import { Tour } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface CatalogGridProps {
  filters: FilterOptions;
  searchQuery?: string;
}

const TOURS_PER_PAGE = 8;

export default function CatalogGrid({ filters, searchQuery = '' }: CatalogGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Фильтрация туров
  const filteredTours = useMemo(() => {
    return mockTours.filter((tour) => {
      // Поиск по названию и локации
      const matchesSearch = searchQuery === '' || 
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Фильтр по цене
      const matchesPrice = tour.price >= filters.priceRange[0] && tour.price <= filters.priceRange[1];

      // Фильтр по локации
      const matchesLocation = !filters.location || tour.location.includes(filters.location);

      // Фильтр по типу тура
      const matchesType = !filters.tourType || tour.type === filters.tourType;

      // Фильтр по рейтингу
      const matchesRating = tour.rating >= filters.rating;

      // Фильтр по продолжительности (примерная логика)
      let matchesDuration = true;
      if (filters.duration) {
        const days = parseInt(tour.duration);
        if (filters.duration === '3-5 дней') {
          matchesDuration = days >= 3 && days <= 5;
        } else if (filters.duration === '6-10 дней') {
          matchesDuration = days >= 6 && days <= 10;
        } else if (filters.duration === '11+ дней') {
          matchesDuration = days >= 11;
        }
      }

      return matchesSearch && matchesPrice && matchesLocation && matchesType && matchesRating && matchesDuration;
    });
  }, [filters, searchQuery]);

  // Пагинация
  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOURS_PER_PAGE;
  const endIndex = startIndex + TOURS_PER_PAGE;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Результаты поиска */}
      <div className="mb-6">
        <p className="text-gray-600">
          Найдено {filteredTours.length} туров
          {searchQuery && (
            <span className="ml-2">
              по запросу "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Сетка туров */}
      {currentTours.length > 0 ? (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {currentTours.map((tour) => (
              <motion.div
                key={tour.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </motion.div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Предыдущая страница */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </button>

              {/* Номера страниц */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  
                  // Показываем только несколько страниц вокруг текущей
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Следующая страница */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        // Пустое состояние
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.956-6.062-2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Туры не найдены</h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      )}
    </div>
  );
}