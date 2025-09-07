'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Users, Plane } from 'lucide-react';
import { SearchFilters } from '@/types';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomAutocomplete from '@/components/ui/CustomAutocomplete';
import GuestSelector from '@/components/ui/GuestSelector';

export default function SearchForm() {
  const [filters, setFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    guests: 1,
  });

  // Убираем guestOptions, так как теперь используем GuestSelector

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Поиск туров:', filters);
  };

  return (
                    <div className="relative bg-white min-h-screen">
      {/* Белый фон с широким округлым фото контейнером */}
      <div className="relative min-h-screen bg-white overflow-hidden">
        
        {/* Широкий округлый контейнер с новым фото */}
        <div className="absolute inset-0 flex items-center justify-center pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-[98vw] mx-auto px-1 will-change-transform"
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
          >
            {/* Очень широкий округлый контейнер с фото */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
              {/* Новое фоновое изображение интерьера */}
              <div 
                className="h-[80vh] bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&auto=format&q=90')"
                }}
              />
              
              {/* Темный оверлей для читаемости текста */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Контент поверх фото */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
                
                {/* Заголовок */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-16 will-change-transform"
                  style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-tight font-sans tracking-tight">
                    Отказные туры<br/>
                    со скидкой до <span className="font-bold text-white">70%</span>
                  </h1>
                  
                  <p className="text-2xl md:text-3xl text-white/90 font-normal max-w-4xl mx-auto font-sans tracking-wide">
                    Мы поможем вам найти идеальное место для отдыха по доступным ценам
                  </p>
                </motion.div>

                {/* Форма поиска без табов */}
                <motion.div 
                  className="w-full max-w-6xl will-change-transform"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                >
                  {/* Форма поиска сразу без табов */}
                  <form onSubmit={handleSubmit}>
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                      
                      {/* Откуда */}
                      <CustomAutocomplete
                        value={filters.from}
                        onChange={(value) => setFilters({...filters, from: value})}
                        placeholder="Откуда"
                        type="from"
                        icon={<MapPin size={18} />}
                      />

                      {/* Куда */}
                      <CustomAutocomplete
                        value={filters.to}
                        onChange={(value) => setFilters({...filters, to: value})}
                        placeholder="Куда"
                        type="to"
                        icon={<Plane size={18} />}
                      />

                      {/* Дата отправления */}
                      <CustomDatePicker
                        value={filters.departureDate}
                        onChange={(date) => setFilters({...filters, departureDate: date})}
                        placeholder="Дата отправления"
                        minDate={new Date().toISOString().split('T')[0]}
                      />

                      {/* Выбор гостей с детальной настройкой */}
                      <GuestSelector
                        value={filters.guests}
                        onChange={(totalGuests) => setFilters({...filters, guests: totalGuests})}
                        placeholder="Гости"
                        icon={<Users size={18} />}
                      />

                      {/* Search Button */}
                      <motion.button
                        type="submit"
                                                            className="w-full px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:bg-orange-600 transition-all duration-300 text-base border-none backdrop-blur-xl relative overflow-hidden group"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 30px 60px rgba(251, 146, 60, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >

                        <div className="relative flex items-center justify-center space-x-3">
                                                                <Search size={18} className="group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-semibold tracking-wide">Найти туры</span>
                        </div>
                      </motion.button>

                    </div>
                  </form>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}