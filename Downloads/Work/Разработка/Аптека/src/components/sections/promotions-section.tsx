'use client';

import { motion } from 'framer-motion';
import { 
  Tag, 
  Clock,
  Percent,
  Gift,
  Star,
  ArrowRight,
  Timer,
  Sparkles,
  Truck,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const promotions = [
  {
    id: 1,
    title: 'Скидка на витамины',
    description: 'До 25% скидки на все витаминные комплексы и БАДы для укрепления иммунитета',
    discount: '25%',
    type: 'discount',
    timeLeft: '3 дня',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: true
  },
  {
    id: 2,
    title: '3+1 на детские товары',
    description: 'При покупке 3 товаров детского питания или лекарств - 4-й в подарок',
    discount: '3+1',
    type: 'gift',
    timeLeft: '5 дней',
    image: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: true
  },
  {
    id: 3,
    title: 'Бесплатная доставка',
    description: 'При заказе от 2000₽ доставка по городу бесплатно. Быстро и надежно',
    discount: '0₽',
    type: 'delivery',
    timeLeft: 'Постоянно',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: false
  },
  {
    id: 4,
    title: 'Скидка пенсионерам',
    description: '10% скидка на все лекарственные препараты для пенсионеров',
    discount: '10%',
    type: 'pensioner', 
    timeLeft: 'Постоянно',
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: false
  },
  {
    id: 5,
    title: 'Ночная аптека -15%',
    description: 'Скидка 15% на все товары с 22:00 до 6:00 каждую ночь',
    discount: '15%',
    type: 'night',
    timeLeft: 'Каждую ночь',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: false
  },
  {
    id: 6,
    title: 'Программа лояльности',
    description: 'Накапливайте баллы и получайте до 20% кэшбэка с каждой покупки',
    discount: '20%',
    type: 'loyalty',
    timeLeft: 'Постоянно',
    image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&h=400&fit=crop&auto=format',

    urgent: false,
    featured: false
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case 'discount': return Percent;
    case 'gift': return Gift;
    case 'delivery': return Truck;
    case 'pensioner': return Users;
    case 'night': return Timer;
    case 'loyalty': return Sparkles;
    default: return Tag;
  }
};

export function PromotionsSection() {
  const featuredPromotions = promotions.filter(p => p.featured);
  const regularPromotions = promotions.filter(p => !p.featured);

  return (
    <section className="py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-brand-green" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-black font-vezitsa">
                Актуальные акции
              </h2>
            </div>
            <p className="text-lg text-brand-brown max-w-2xl mx-auto leading-relaxed">
              Экономьте на покупках с нашими выгодными предложениями и специальными акциями
            </p>
          </motion.div>

          {/* Главные акции (большие карточки) */}
          <motion.div variants={fadeInUp} className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPromotions.map((promotion) => {
                const IconComponent = getIcon(promotion.type);
                return (
                  <motion.div
                    key={promotion.id}
                    variants={fadeInUp}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Фоновое изображение */}
                    <div className="relative h-80">
                      <Image
                        src={promotion.image}
                        alt={promotion.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      
                      {/* Градиентный оверлей */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Контент поверх изображения */}
                      <div className="absolute bottom-8 left-0 right-0 p-8 text-white">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold font-vezitsa mb-1">
                            {promotion.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Clock className="w-4 h-4" />
                            <span>Действует: {promotion.timeLeft}</span>
                          </div>
                        </div>

                        <p className="text-white/90 text-lg leading-relaxed mb-6">
                          {promotion.description}
                        </p>

                        <Button 
                          size="lg"
                          className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3 rounded-2xl font-semibold group/btn transition-all duration-300"
                        >
                          Подробнее
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Остальные акции (компактные карточки) */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularPromotions.map((promotion) => {
                const IconComponent = getIcon(promotion.type);
                return (
                  <motion.div
                    key={promotion.id}
                    variants={fadeInUp}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-green/20"
                  >
                    {/* Изображение */}
                    <div className="relative h-40 bg-gray-100">
                      <Image
                        src={promotion.image}
                        alt={promotion.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      
                    </div>

                    {/* Контент */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-brand-black font-vezitsa leading-tight group-hover:text-brand-green transition-colors">
                          {promotion.title}
                        </h3>
                        <p className="text-sm text-brand-brown mt-2 leading-relaxed">
                          {promotion.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-brand-brown">
                          <Clock className="w-3 h-3" />
                          <span>{promotion.timeLeft}</span>
                        </div>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-brand-green hover:bg-brand-green/10 px-3 py-1 h-8 group/btn"
                        >
                          <span className="text-sm font-medium">Узнать больше</span>
                          <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 