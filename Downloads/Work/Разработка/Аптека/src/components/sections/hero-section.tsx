'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Данные популярных товаров
const popularProducts = [
  {
    id: 1,
    name: "Витамин D3 2000 МЕ",
    brand: "Solgar",
    description: "60 капсул",
    price: 650,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format",
    rating: 4.8
  },
  {
    id: 2,
    name: "Парацетамол 500мг",
    brand: "Медисорб",
    description: "20 таблеток",
    price: 120,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format",
    rating: 4.5
  },
  {
    id: 3,
    name: "Омега-3",
    brand: "Эвалар",
    description: "90 капсул",
    price: 890,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format",
    rating: 4.7
  },
  {
    id: 4,
    name: "Магний B6",
    brand: "Санофи",
    description: "50 таблеток",
    price: 340,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop&auto=format",
    rating: 4.6
  },
  {
    id: 5,
    name: "Аспирин Кардио",
    brand: "Байер",
    description: "28 таблеток",
    price: 280,
    image: "https://images.unsplash.com/photo-1550572017-45c77dc6f7db?w=400&h=300&fit=crop&auto=format",
    rating: 4.9
  },
  {
    id: 6,
    name: "Ибупрофен 400мг",
    brand: "Борисовский завод",
    description: "30 таблеток",
    price: 95,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&auto=format",
    rating: 4.4
  },
  {
    id: 7,
    name: "Цинк + Витамин C",
    brand: "Now Foods",
    description: "100 капсул",
    price: 520,
    image: "https://images.unsplash.com/photo-1607619662634-3ac55ec0119e?w=400&h=300&fit=crop&auto=format",
    rating: 4.7
  },
  {
    id: 8,
    name: "Но-шпа форте",
    brand: "Санофи",
    description: "20 таблеток",
    price: 180,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop&auto=format",
    rating: 4.8
  },
  {
    id: 9,
    name: "Глицин",
    brand: "Биотики",
    description: "50 таблеток",
    price: 65,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop&auto=format",
    rating: 4.3
  },
  {
    id: 10,
    name: "Кальций D3 Никомед",
    brand: "Takeda",
    description: "60 таблеток",
    price: 450,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&auto=format",
    rating: 4.6
  },
  {
    id: 11,
    name: "Мезим форте",
    brand: "Берлин-Хеми",
    description: "20 таблеток",
    price: 210,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031e3a4?w=400&h=300&fit=crop&auto=format",
    rating: 4.5
  },
  {
    id: 12,
    name: "Супрадин",
    brand: "Байер",
    description: "30 таблеток",
    price: 680,
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop&auto=format",
    rating: 4.7
  },
  {
    id: 13,
    name: "Лактофильтрум",
    brand: "АВВА РУС",
    description: "30 таблеток",
    price: 320,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop&auto=format",
    rating: 4.4
  },
  {
    id: 14,
    name: "Фестал",
    brand: "Санофи",
    description: "40 таблеток",
    price: 165,
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop&auto=format",
    rating: 4.3
  },
  {
    id: 15,
    name: "Компливит",
    brand: "Фармстандарт",
    description: "60 таблеток",
    price: 195,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&auto=format",
    rating: 4.2
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalProducts = popularProducts.length;
  const maxSlide = totalProducts - 5; // Показываем 5 элементов, можем сдвинуться максимум на (всего - 5)

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
      {/* Background декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-8 -right-8 sm:-top-16 sm:-right-16 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-brand-green/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-8 -left-8 sm:-bottom-16 sm:-left-16 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-brand-blue/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-brand-green/5 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Основной контент с заголовком и логотипом */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 sm:p-12 lg:p-16 mb-16 sm:mb-20 lg:mb-24 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <motion.div 
            className="text-center"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Основной layout с левой и правой частями */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center -mt-4 sm:-mt-6 lg:-mt-8">
              {/* Левая часть - только логотип */}
              <motion.div 
                className="flex items-center justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <div className="w-72 h-18 sm:w-96 sm:h-24 lg:w-[450px] lg:h-28 flex items-center justify-center lg:justify-start">
                  <Image
                    src="/assets/images/logos/horizontal-transparent.png"
                    alt="ЭкоЛайф - Аптечная сеть"
                    width={450}
                    height={112}
                    className="w-full h-auto object-contain drop-shadow-sm"
                    priority
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 450px"
                  />
                </div>
              </motion.div>

              {/* Правая часть - заголовок, описание и кнопки */}
              <motion.div 
                className="text-center lg:text-left space-y-6 lg:space-y-8 mt-4 sm:mt-6 lg:mt-8"
                variants={fadeInUp}
              >
                {/* Заголовок */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-black leading-tight font-vezitsa drop-shadow-sm">
                  Здоровье и качество жизни
                </h1>

                {/* Описание */}
                <p className="text-base sm:text-lg lg:text-xl text-brand-brown/90 font-vezitsa leading-relaxed">
                  Широкий ассортимент лекарственных препаратов, медицинских изделий и товаров для здоровья
                </p>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start pt-2">
                  <Button size="lg" className="group bg-brand-green hover:bg-brand-green/90 text-white font-vezitsa shadow-xl hover:shadow-2xl px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 text-base sm:text-lg lg:text-xl transition-all duration-300">
                    Каталог товаров
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white font-vezitsa shadow-md hover:shadow-lg px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 text-base sm:text-lg lg:text-xl transition-all duration-300">
                    Найти аптеку
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Карусель популярных товаров */}
        <motion.div 
          className="w-full"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-black font-vezitsa">
              Популярные товары
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide === maxSlide}
                className="p-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 20.1}%)`,
              }}
            >
              {popularProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-green/20 group"
                  style={{ 
                    flex: '0 0 19.6%',
                    minWidth: 0,
                    marginRight: index === popularProducts.length - 1 ? '0' : '0.5%'
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-bold text-brand-black font-vezitsa line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-brand-brown">
                      {product.brand} • {product.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-brand-brown">{product.rating}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm font-bold text-brand-green">{product.price}₽</span>
                      <Button 
                        size="sm" 
                        className="bg-brand-green hover:bg-brand-green/90 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
                        В корзину
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 