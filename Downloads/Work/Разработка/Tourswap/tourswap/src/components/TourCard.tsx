'use client';

import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, Users, Utensils } from 'lucide-react';
import Link from 'next/link';
import { Tour } from '@/types';
import { formatPrice } from '@/lib/utils';
import Button from './ui/Button';

interface TourCardProps {
  tour: Tour;
}

// Mock images for tours
const tourImages = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop&auto=format&q=80'
];

export default function TourCard({ tour }: TourCardProps) {
  // Выбираем изображение на основе ID тура
  const imageUrl = tourImages[(parseInt(tour.id) - 1) % tourImages.length];

  // Вычисляем скидку
  const discount = Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group relative"
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
    >
      {/* Изображение */}
      <div className="relative h-48 overflow-hidden">
        <motion.div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url('${imageUrl}')`
          }}
        ></motion.div>

        {/* Скидка */}
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
            -{discount}%
          </div>
        </div>

        {/* Избранное */}
        <motion.button
          className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="h-3.5 w-3.5 text-gray-600 hover:text-red-500 transition-colors" />
        </motion.button>

        {/* Тип отеля */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">
            {tour.type}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        {/* Заголовок и локация */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {tour.title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
            <span>{tour.location}</span>
          </div>
        </div>

        {/* Рейтинг и продолжительность */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(tour.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1.5">{tour.rating}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md">
            <Clock className="h-3 w-3 mr-1" />
            <span>{tour.duration}</span>
          </div>
        </div>

        {/* Тип питания и количество людей */}
        <div className="mb-3 flex gap-1.5 flex-wrap">
          <div className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
            <Utensils className="h-3 w-3 mr-1" />
            {tour.mealType}
          </div>
          <div className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
            <Users className="h-3 w-3 mr-1" />
            до {tour.maxGuests} чел
          </div>
        </div>

        {/* Цены */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(tour.price)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(tour.originalPrice)}
            </span>
          </div>
        </div>

        {/* Кнопка */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Link href={`/tours/${tour.id}`} className="block">
            <Button
              variant="primary"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Подробнее
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}