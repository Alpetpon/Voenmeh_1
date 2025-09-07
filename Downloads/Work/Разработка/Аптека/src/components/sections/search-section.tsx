'use client';

import { motion } from 'framer-motion';
import { Search, Pill, Heart, Shield } from 'lucide-react';
import SearchBar from '@/components/search/search-bar';

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

const quickSearchItems = [
  { id: 1, name: 'Анальгин', category: 'Обезболивающие', icon: Pill },
  { id: 2, name: 'Витамин D', category: 'Витамины', icon: Heart },
  { id: 3, name: 'Йод', category: 'Антисептики', icon: Shield },
  { id: 4, name: 'Парацетамол', category: 'Жаропонижающие', icon: Pill },
];

export function SearchSection() {
  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Search className="w-6 h-6 text-primary" />
              <h2 className="text-3xl lg:text-4xl font-bold">
                Найдите нужное
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {' '}лекарство
                </span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Быстрый поиск по названию, действующему веществу или симптомам. 
              Более 10 000 препаратов в наличии.
            </p>
          </motion.div>

          {/* Поисковая строка */}
          <motion.div variants={fadeInUp} className="mb-12">
            <div className="glass-strong rounded-2xl p-6">
              <SearchBar />
            </div>
          </motion.div>

          {/* Популярные запросы */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-xl font-semibold mb-6 text-center">
              Популярные запросы
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickSearchItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    variants={fadeInUp}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass rounded-xl p-4 text-left hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.div variants={fadeInUp} className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Не нашли нужный препарат? Обратитесь к нашим фармацевтам за консультацией
            </p>
            <button className="mt-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              Получить консультацию →
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 