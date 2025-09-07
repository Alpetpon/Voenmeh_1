'use client';

import { motion } from 'framer-motion';
import { mockTours } from '@/lib/mockData';
import TourCard from './TourCard';

export default function TourGrid() {
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
    <section className="pt-8 pb-16 bg-white">
      <div className="w-full mx-auto px-8 sm:px-12 lg:px-16">
        {/* Заголовок секции */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Найди свой тур мечты
          </h2>

          <motion.button
            className="flex items-center space-x-2 text-gray-900 hover:text-orange-500 transition-colors duration-300 group"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span className="font-medium">В каталог</span>
            <svg
              className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Сетка туров */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {mockTours.map((tour) => (
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

        {/* Кнопка загрузить больше */}
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <motion.button
            className="px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-orange-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            Показать больше туров
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}