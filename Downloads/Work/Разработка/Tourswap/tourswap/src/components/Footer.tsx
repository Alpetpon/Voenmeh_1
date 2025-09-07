'use client';
import Image from 'next/image';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 relative overflow-hidden border-t border-gray-200">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-gray-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-gray-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gray-400 rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center space-x-12 mb-6 -ml-24">
          <Image
            src="/logo.svg"
            alt="TourSwap"
            width={64}
            height={64}
            className="h-16 w-16 transform origin-left scale-[3.2] translate-y-1 flex-shrink-0"
            priority
          />
          <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
            Ведущая платформа для поиска и бронирования отказных туров 
            со скидками до 70%. Путешествуйте больше, платите меньше.
          </p>
        </div>
        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Логотип и описание */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
          </motion.div>

          {/* Быстрые ссылки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900">Быстрые ссылки</h3>
            <ul className="space-y-3">
              {[
                'О нас',
                'Как это работает', 
                'Партнерам',
                'Блог',
                'FAQ'
              ].map((link, index) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-orange-500/40 rounded-full mr-3 group-hover:bg-orange-500 transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Поддержка */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900">Поддержка</h3>
            <ul className="space-y-3">
              {[
                'Центр поддержки',
                'Связаться с нами',
                'Правила возврата',
                'Условия использования',
                'Политика конфиденциальности'
              ].map((link, index) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-orange-500/40 rounded-full mr-3 group-hover:bg-orange-500 transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>



        {/* Нижняя часть */}
        <motion.div 
          className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 TourSwap. Все права защищены.
          </p>
          
          <div className="flex space-x-4">
            {[
              { 
                name: 'VK', 
                color: 'bg-blue-600 hover:bg-blue-700',
                icon: 'VK',
                href: 'https://vk.com/tourswap'
              },
              { 
                name: 'TG', 
                color: 'bg-blue-500 hover:bg-blue-600',
                icon: 'TG',
                href: 'https://t.me/tourswap'
              }
            ].map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 ${social.color} text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <span className="text-sm font-semibold">{social.icon}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}