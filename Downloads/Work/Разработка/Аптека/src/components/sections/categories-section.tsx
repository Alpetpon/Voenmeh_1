'use client';

import { motion } from 'framer-motion';
import { 
  Pill, 
  Heart, 
  Baby, 
  Sparkles, 
  Thermometer,
  Eye,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

const categories = [
  {
    id: 1,
    name: 'Лекарственные препараты',
    description: 'Рецептурные и безрецептурные препараты',
    icon: Pill,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    count: '2,500+ товаров',
    popular: true,
    href: '/catalog/medicines'
  },
  {
    id: 2,
    name: 'Витамины и БАДы',
    description: 'Комплексы витаминов и биологически активные добавки',
    icon: Heart,
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    count: '800+ товаров',
    popular: true,
    href: '/catalog/vitamins'
  },
  {
    id: 3,
    name: 'Детские товары',
    description: 'Все необходимое для здоровья малышей',
    icon: Baby,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
    count: '600+ товаров',
    popular: false,
    href: '/catalog/baby'
  },
  {
    id: 4,
    name: 'Косметика и гигиена',
    description: 'Средства ухода и личной гигиены',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    count: '1,200+ товаров',
    popular: true,
    href: '/catalog/cosmetics'
  },
  {
    id: 5,
    name: 'Медицинские изделия',
    description: 'Тонометры, термометры, глюкометры',
    icon: Stethoscope,
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    count: '300+ товаров',
    popular: false,
    href: '/catalog/medical-devices'
  },
  {
    id: 6,
    name: 'Оптика',
    description: 'Очки, линзы, средства ухода',
    icon: Eye,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
    count: '150+ товаров',
    popular: false,
    href: '/catalog/optics'
  }
];

export function CategoriesSection() {
  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-vezitsa">
              Популярные категории
            </h2>
            <p className="text-lg text-brand-brown max-w-2xl mx-auto">
              Найдите все необходимое для здоровья в нашем широком ассортименте товаров
            </p>
          </motion.div>

          {/* Сетка категорий */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.id}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link href={category.href}>
                    <div className={`bento-item bg-gradient-to-br ${category.bgColor} border-transparent hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden`}>
                      {/* Популярная метка */}
                      {category.popular && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                            Популярное
                          </div>
                        </div>
                      )}

                      {/* Декоративный элемент */}
                      <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${category.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />

                      <div className="relative z-10">
                        {/* Иконка */}
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8" />
                        </div>

                        {/* Контент */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {category.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              {category.count}
                            </span>
                            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Специальные предложения */}
          <motion.div variants={fadeInUp} className="mt-16">
            <div className="glass-strong rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Декоративные элементы */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <Thermometer className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  Не нашли нужную категорию?
                </h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Воспользуйтесь поиском или обратитесь к нашим фармацевтам. 
                  У нас более 10 000 наименований товаров для здоровья.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="group">
                    Посмотреть весь каталог
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Получить консультацию
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 