'use client';

import { motion } from 'framer-motion';
import { 
  Star, 
  Quote,
  Users,
  ThumbsUp,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const testimonials = [
  {
    id: 1,
    name: 'Мария Петрова',
    age: 34,
    location: 'Москва',
    rating: 5,
    text: 'Отличная аптека! Фармацевты всегда готовы помочь с выбором препаратов. Особенно нравится программа лояльности - экономлю на каждой покупке.',
    date: '2 дня назад',
    verified: true,
    helpful: 12
  },
  {
    id: 2,
    name: 'Александр Иванов',
    age: 45,
    location: 'СПб',
    rating: 5,
    text: 'Заказывал лекарства с доставкой несколько раз. Всё приходит быстро и в отличном состоянии. Цены конкурентные, качество на высоте.',
    date: '1 неделю назад',
    verified: true,
    helpful: 8
  },
  {
    id: 3,
    name: 'Елена Соколова',
    age: 28,
    location: 'Екатеринбург',
    rating: 5,
    text: 'Покупаю витамины для всей семьи только здесь. Широкий выбор, адекватные цены, грамотные консультации. Рекомендую всем!',
    date: '3 дня назад',
    verified: true,
    helpful: 15
  },
  {
    id: 4,
    name: 'Дмитрий Козлов',
    age: 52,
    location: 'Новосибирск',
    rating: 4,
    text: 'Хорошая сеть аптек. Удобно, что работают круглосуточно. Иногда бывают небольшие очереди, но персонал работает быстро.',
    date: '5 дней назад',
    verified: true,
    helpful: 6
  },
  {
    id: 5,
    name: 'Анна Волкова',
    age: 29,
    location: 'Казань',
    rating: 5,
    text: 'Заказала детские витамины, получила очень быстро. Упаковка была идеальной, сроки годности отличные. Буду заказывать ещё!',
    date: '1 день назад',
    verified: true,
    helpful: 9
  },
  {
    id: 6,
    name: 'Игорь Смирнов',
    age: 38,
    location: 'Ростов-на-Дону',
    rating: 5,
    text: 'Отличное приложение и сайт, удобно искать нужные препараты. Фармацевт по телефону дал подробную консультацию. Спасибо!',
    date: '4 дня назад',
    verified: true,
    helpful: 11
  }
];

const stats = [
  { number: '4.8', label: 'Средняя оценка', sublabel: 'из 5 звёзд', icon: Star },
  { number: '12k+', label: 'Отзывов', sublabel: 'от клиентов', icon: MessageCircle },
  { number: '98%', label: 'Довольных', sublabel: 'клиентов', icon: ThumbsUp },
  { number: '15k+', label: 'Постоянных', sublabel: 'покупателей', icon: Users },
];

export function TestimonialsSection() {
  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-3xl lg:text-4xl font-bold">
                Отзывы
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {' '}клиентов
                </span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Узнайте, что говорят о нас наши клиенты. Их доверие - наша главная награда
            </p>
          </motion.div>

          {/* Статистика */}
          <motion.div variants={fadeInUp} className="mb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="glass rounded-2xl p-6 hover:glass-strong transition-all duration-300">
                      <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-primary mb-1">
                        {stat.number}
                      </div>
                      <p className="text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Отзывы */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                          {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bento-item bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/20 group"
              >
                <div className="space-y-4">
                  {/* Рейтинг и дата */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {testimonial.date}
                    </div>
                  </div>

                  {/* Текст отзыва */}
                  <div className="relative">
                    <Quote className="w-6 h-6 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-sm leading-relaxed text-muted-foreground pl-4">
                      {testimonial.text}
                    </p>
                  </div>

                  {/* Информация о клиенте */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            ✓ Проверен
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.age} лет, {testimonial.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      {testimonial.helpful}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA для отзывов */}
          <motion.div variants={fadeInUp} className="text-center">
            <div className="glass-strong rounded-3xl p-8 max-w-2xl mx-auto">
              <MessageCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Поделитесь своим опытом
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Ваше мнение важно для нас! Оставьте отзыв и помогите другим клиентам 
                сделать правильный выбор
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
                  Оставить отзыв
                </button>
                <button className="px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-colors font-semibold">
                  Читать все отзывы
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                За каждый отзыв начисляем 50 бонусных баллов
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 