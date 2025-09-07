'use client';

import { useState } from 'react';
import { MapPin, Users, Plane, Utensils, Star, Building } from 'lucide-react';
import CustomAutocomplete from './ui/CustomAutocomplete';
import CustomDatePicker from './ui/CustomDatePicker';
import GuestSelector from './ui/GuestSelector';
import CustomDropdown from './ui/CustomDropdown';

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

interface CatalogFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  totalResults: number;
}

export default function CatalogFilters({ onFiltersChange, totalResults }: CatalogFiltersProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
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

  const tourTypes = ['Все типы', 'Отель', 'Вилла', 'Апартаменты'];
  const mealTypes = ['Все типы питания', 'Все включено', 'Полупансион', 'Завтраки', 'Без питания'];
  const ratings = [
    { value: 0, label: 'Любые звезды' },
    { value: 3, label: '3+ звезд' },
    { value: 4, label: '4+ звезд' },
    { value: 4.5, label: '4.5+ звезд' }
  ];
  const priceRanges = [
    { value: [0, 2000000], label: 'Любая цена' },
    { value: [0, 300000], label: 'До 300 000 ₽' },
    { value: [300000, 600000], label: '300 000 - 600 000 ₽' },
    { value: [600000, 1000000], label: '600 000 - 1 000 000 ₽' },
    { value: [1000000, 2000000], label: 'От 1 000 000 ₽' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
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
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Каталог туров
          </h1>
          <p className="text-lg text-gray-600">
            Найдите идеальный тур среди {totalResults} предложений
          </p>
        </div>

        {/* Форма фильтров в белой рамке */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Первая строка фильтров */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
            {/* Откуда */}
            <CustomAutocomplete
              value={filters.from}
              onChange={(value) => handleFilterChange('from', value)}
              placeholder="Откуда"
              type="from"
              icon={<MapPin size={18} />}
            />

            {/* Куда */}
            <CustomAutocomplete
              value={filters.to}
              onChange={(value) => handleFilterChange('to', value)}
              placeholder="Куда"
              type="to"
              icon={<Plane size={18} />}
            />

            {/* Дата отправления */}
            <CustomDatePicker
              value={filters.departureDate}
              onChange={(date) => handleFilterChange('departureDate', date)}
              placeholder="Дата отправления"
              minDate={new Date().toISOString().split('T')[0]}
            />

            {/* Количество людей */}
            <GuestSelector
              value={filters.guests}
              onChange={(totalGuests) => handleFilterChange('guests', totalGuests)}
              placeholder="Гости"
              icon={<Users size={18} />}
            />

            {/* Тип питания */}
            <CustomDropdown
              value={filters.mealType}
              onChange={(value) => handleFilterChange('mealType', value === 'Все типы питания' ? '' : value)}
              options={mealTypes}
              placeholder="Тип питания"
              icon={<Utensils size={18} />}
            />
          </div>

          {/* Вторая строка фильтров */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Тип отеля */}
            <CustomDropdown
              value={filters.tourType}
              onChange={(value) => handleFilterChange('tourType', value === 'Все типы' ? '' : value)}
              options={tourTypes}
              placeholder="Тип отеля"
              icon={<Building size={18} />}
            />

            {/* Цена */}
            <CustomDropdown
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              options={priceRanges.map(range => ({
                value: range.value,
                label: range.label
              }))}
              placeholder="Цена"
              icon={<span className="text-sm font-medium">₽</span>}
            />

            {/* Звезды */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 px-1">Рейтинг</label>
              <div className="flex items-center space-x-1 px-3 py-2 h-10 border border-gray-300 rounded-lg bg-white">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFilterChange('rating', star === filters.rating ? 0 : star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-colors duration-200"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= (hoveredRating || filters.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      } hover:text-yellow-400`}
                    />
                  </button>
                ))}
                {filters.rating > 0 && (
                  <span className="text-xs text-gray-500 ml-2">{filters.rating}+</span>
                )}
              </div>
            </div>

            {/* Кнопка сброса */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-all duration-200 border border-gray-200"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}