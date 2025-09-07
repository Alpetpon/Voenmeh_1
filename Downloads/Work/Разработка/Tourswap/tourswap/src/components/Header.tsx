'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between px-6">
          
          {/* Только логотип TourSwap - большой и видный */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Image
                src="/logo.svg"
                alt="TourSwap"
                width={64}
                height={64}
                className="h-16 w-16 transform origin-left scale-[3.2] translate-y-1"
                priority
              />
            </div>
          </Link>

          {/* Только кнопки */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <motion.button
                className="px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Войти
              </motion.button>
            </Link>
            
            <Link href="/login">
              <motion.button
                className="px-6 py-2 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:border-orange-400 hover:text-orange-600 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05
                }}
                whileTap={{ scale: 0.95 }}
              >
                Регистрация
              </motion.button>
            </Link>
          </div>
        </div>
    </motion.header>
  );
}