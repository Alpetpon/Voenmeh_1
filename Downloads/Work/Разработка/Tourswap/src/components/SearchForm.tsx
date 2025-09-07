'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Plane } from 'lucide-react';
import Button from './ui/Button';
import { SearchFilters } from '@/types';

export default function SearchForm() {
  const [filters, setFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    guests: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Поиск туров:', filters);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative">
      {/* Полноэкранный hero с высококачественным фоном */}
      <div className="relative h-screen min-h-[800px] overflow-hidden">
        {/* Многослойный градиентный оверлей для глубины */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Премиум фоновое изображение */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=1920&h=1080&fit=crop&auto=format&q=85')"
          }}
        ></div>
        
        {/* Контент по центру */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-center items-center text-center">
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Современная категория-бейдж */}
            <motion.div 
              className="inline-flex items-center gap-3 mb-8"
              variants={itemVariants}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-xl opacity-60"></div>
                <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-full px-8 py-4 shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-6 w-6 text-orange-300" />
                    <span className="text-white font-semibold text-lg tracking-wide">
                      Туры
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Заголовок с анимацией */}
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight"
              variants={itemVariants}
            >
              <span className="block text-white mb-2">Отказные туры</span>
              <span className="block text-white mb-2">со скидкой до</span>
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-300 to-pink-300"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 30px rgba(255,165,0,0.8)"
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                70%
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl md:text-3xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Роскошные путешествия мечты по невероятным ценам
            </motion.p>
            
            <motion.p 
              className="text-lg text-orange-200 mt-4 font-medium"
              variants={itemVariants}
            >
              ⏰ Успей забрать, пока не поздно!
            </motion.p>
          </motion.div>

          {/* Революционная форма поиска с glassmorphism */}
          <motion.div 
            className="w-full max-w-5xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="relative backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
              variants={itemVariants}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.2),
                  inset 0 1px 0 rgba(255,255,255,0.1),
                  inset 0 -1px 0 rgba(255,255,255,0.05)
                `
              }}
              whileHover={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: { duration: 0.3 }
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Сетка полей ввода */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Откуда */}
                  <motion.div 
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <label className="block text-sm font-semibold text-white/80 mb-4 tracking-wide">
                      Откуда
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-full overflow-hidden">
                        <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-300 h-5 w-5 group-hover:text-orange-200 transition-colors" />
                        <input
                          type="text"
                          placeholder="Город отправления"
                          value={filters.from}
                          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                          className="w-full pl-14 pr-6 py-5 bg-transparent text-white placeholder-white/50 focus:outline-none focus:placeholder-white/70 transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Куда */}
                  <motion.div 
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <label className="block text-sm font-semibold text-white/80 mb-4 tracking-wide">
                      Куда
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-full overflow-hidden">
                        <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 group-hover:text-blue-200 transition-colors" />
                        <input
                          type="text"
                          placeholder="Направление мечты"
                          value={filters.to}
                          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                          className="w-full pl-14 pr-6 py-5 bg-transparent text-white placeholder-white/50 focus:outline-none focus:placeholder-white/70 transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Дата вылета */}
                  <motion.div 
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <label className="block text-sm font-semibold text-white/80 mb-4 tracking-wide">
                      Дата вылета
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-full overflow-hidden">
                        <Calendar className="absolute left-6 top-1/2 transform -translate-y-1/2 text-green-300 h-5 w-5 pointer-events-none group-hover:text-green-200 transition-colors" />
                        <input
                          type="date"
                          value={filters.departureDate}
                          onChange={(e) => setFilters({ ...filters, departureDate: e.target.value })}
                          className="w-full pl-14 pr-6 py-5 bg-transparent text-white focus:outline-none transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Дата возвращения */}
                  <motion.div 
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <label className="block text-sm font-semibold text-white/80 mb-4 tracking-wide">
                      Дата возвращения
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-full overflow-hidden">
                        <Calendar className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5 pointer-events-none group-hover:text-purple-200 transition-colors" />
                        <input
                          type="date"
                          value={filters.returnDate}
                          onChange={(e) => setFilters({ ...filters, returnDate: e.target.value })}
                          className="w-full pl-14 pr-6 py-5 bg-transparent text-white focus:outline-none transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Дополнительные опции и кнопка поиска */}
                <motion.div 
                  className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10"
                  variants={itemVariants}
                >
                  <div className="flex items-center space-x-6">
                    {/* Гости */}
                    <div className="flex items-center space-x-4">
                      <Users className="h-6 w-6 text-white/70" />
                      <span className="text-white/80 font-medium text-lg">Гости:</span>
                      <motion.select
                        value={filters.guests}
                        onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) })}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white focus:outline-none focus:bg-white/15 transition-all duration-300 text-lg"
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num} className="bg-gray-800 text-white">
                            {num} {num === 1 ? 'гость' : num <= 4 ? 'гостя' : 'гостей'}
                          </option>
                        ))}
                      </motion.select>
                    </div>
                    
                    <motion.button 
                      type="button" 
                      className="text-orange-200 hover:text-orange-100 font-medium text-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Расширенный поиск →
                    </motion.button>
                  </div>

                  {/* Кнопка поиска с эффектами */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <button
                      type="submit"
                      className="relative group px-12 py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full text-white font-bold text-xl shadow-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="relative flex items-center space-x-3">
                        <Search className="h-6 w-6" />
                        <span>Найти туры мечты</span>
                      </div>
                    </button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}