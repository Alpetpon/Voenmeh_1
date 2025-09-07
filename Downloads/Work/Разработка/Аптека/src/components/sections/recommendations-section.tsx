'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Анимации
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Данные товаров
const recommendedProducts = [
  {
    id: 1,
    name: "Канефрон Н таблетки п/о 60шт",
    price: 805,
    originalPrice: null,
    discount: null,
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop&auto=format",
    badge: null,
    delivery: "Доставка и самовывоз"
  },
  {
    id: 2,
    name: "Бак-Сет Форте капсулы 20шт",
    price: 727,
    originalPrice: null,
    discount: null,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&auto=format",
    badge: null,
    delivery: "Доставка и самовывоз"
  },
  {
    id: 3,
    name: "Лимфомиозот капли для приема внутрь гомеопатические 30мл",
    price: 941,
    originalPrice: 1110.38,
    discount: "-169.38 ₽",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1607619662634-3ac55ec0119e?w=400&h=300&fit=crop&auto=format",
    badge: null,
    delivery: "Самовывоз"
  },
  {
    id: 4,
    name: "Гептрал таблетки кишечнорастворимые п/о плен. 400мг 20шт",
    price: 1627.75,
    originalPrice: 1915,
    discount: "-287.25 ₽",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop&auto=format",
    badge: "СКИДКА",
    delivery: "Доставка и самовывоз"
  },
  {
    id: 5,
    name: "Дюспаталин Дуо таблетки п/о плен. 135мг+84,43мг 10шт",
    price: 369,
    originalPrice: 435.42,
    discount: "-66.42 ₽",
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&auto=format",
    badge: null,
    delivery: "Доставка и самовывоз"
  },
  {
    id: 6,
    name: "Магне B6 раствор для приема внутрь амп. 10мл№10шт№10мг",
    price: 528,
    originalPrice: null,
    discount: null,
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop&auto=format",
    badge: "СКИДКА",
    delivery: "Доставка и самовывоз"
  },
  {
    id: 7,
    name: "Магний цитрат Solgar/ Солгар таблетки 117мг 60шт",
    price: 1250,
    originalPrice: null,
    discount: null,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&auto=format",
    badge: null,
    delivery: "Доставка и самовывоз"
  },
  {
    id: 8,
    name: "Магне B6 форте таблетки п/о плен. 100мг+10мг 60шт",
    price: 895,
    originalPrice: null,
    discount: null,
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop&auto=format",
    badge: "СКИДКА",
    delivery: "Самовывоз"
  },
  {
    id: 9,
    name: "Бифиформ капсулы кишечнорастворимые 30шт",
    price: 589,
    originalPrice: null,
    discount: null,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031e3a4?w=400&h=300&fit=crop&auto=format",
    badge: "ХИТ ПРОДАЖ",
    delivery: "Доставка и самовывоз"
  },
  {
    id: 10,
    name: "Хилак Форте капли для приема внутрь 100мл",
    price: 487,
    originalPrice: null,
    discount: null,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop&auto=format",
    badge: "АКЦИЯ",
    delivery: "Доставка и самовывоз"
  }
];

export function RecommendationsSection() {
  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Заголовок */}
          <motion.h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black mb-8 lg:mb-12 font-vezitsa"
            variants={fadeInUp}
          >
            Подобрали для вас
          </motion.h2>

          {/* Сетка товаров */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={fadeInUp}
          >
            {recommendedProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-green/20 group"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Изображение товара */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                </div>

                {/* Информация о товаре */}
                <div className="p-5 space-y-4">
                  {/* Название */}
                  <h3 className="text-sm font-bold text-brand-black font-vezitsa line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Рейтинг */}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-brand-brown">{product.rating}</span>
                  </div>

                  {/* Цена и кнопка */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-brand-green">{product.price}₽</span>
                    <Button 
                      size="sm" 
                      className="bg-brand-green hover:bg-brand-green/90 text-white px-4 py-2 rounded-xl"
                    >
                      В корзину
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 