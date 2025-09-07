'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  Truck, 
  Users, 
  Award, 
  Heart,
  Phone,
  MapPin 
} from 'lucide-react';

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

const benefits = [
  {
    icon: Shield,
    title: 'Качество и безопасность',
    description: 'Все препараты сертифицированы и проходят строгий контроль качества',
    color: 'bg-green-500',
    bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  {
    icon: Clock,
    title: 'Круглосуточная работа',
    description: '50+ аптек работают 24/7 для вашего удобства',
    color: 'bg-blue-500',
    bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'Доставка лекарств в течение 2-х часов по городу',
    color: 'bg-purple-500',
    bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    icon: Users,
    title: 'Опытные фармацевты',
    description: 'Профессиональные консультации от квалифицированных специалистов',
    color: 'bg-amber-500',
    bgColor: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  {
    icon: Award,
    title: 'Лучшие цены',
    description: 'Конкурентные цены и регулярные акции на популярные препараты',
    color: 'bg-red-500',
    bgColor: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  {
    icon: Heart,
    title: 'Забота о здоровье',
    description: 'Индивидуальный подход к каждому клиенту и заботливое обслуживание',
    color: 'bg-pink-500',
    bgColor: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
    borderColor: 'border-pink-200 dark:border-pink-800'
  }
];

const stats = [
  { number: '50+', label: 'Аптек по городу', icon: MapPin },
  { number: '10k+', label: 'Довольных клиентов', icon: Users },
  { number: '24/7', label: 'Круглосуточно', icon: Clock },
  { number: '2ч', label: 'Доставка', icon: Truck },
];

export function BenefitsSection() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Почему выбирают
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {' '}ЭкоЛайф?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы заботимся о вашем здоровье уже более 10 лет, предоставляя качественные 
              лекарства и профессиональные услуги
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
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Преимущества */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bento-item bg-gradient-to-br ${benefit.bgColor} ${benefit.borderColor} group`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className={`inline-flex p-3 rounded-xl ${benefit.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="text-center mt-16">
            <div className="glass-strong rounded-2xl p-8 max-w-2xl mx-auto">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Нужна консультация?
              </h3>
              <p className="text-muted-foreground mb-6">
                Наши опытные фармацевты готовы помочь вам с выбором препаратов 
                и ответить на все вопросы о здоровье
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
                  Позвонить: 8 (800) 123-45-67
                </button>
                <button className="px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-colors font-semibold">
                  Написать в чат
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 