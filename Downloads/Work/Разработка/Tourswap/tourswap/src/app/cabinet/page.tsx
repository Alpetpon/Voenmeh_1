'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, BookOpen, Settings, LogOut } from 'lucide-react';

export default function CabinetPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow pt-20">
        {/* Хлебные крошки */}
        <motion.section 
          className="bg-white border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-orange-500 transition-colors">
                Главная
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Личный кабинет</span>
            </nav>
          </div>
        </motion.section>

        {/* Основной контент */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Боковая навигация */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Иван Петров</h3>
                    <p className="text-sm text-gray-500">ivan@example.com</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 text-orange-600 bg-orange-50 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                    <span>Мои бронирования</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Настройки</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Выйти</span>
                  </a>
                </nav>
              </div>
            </div>

            {/* Основной контент */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Мои бронирования</h1>
                
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет бронирований</h3>
                  <p className="text-gray-500 mb-6">
                    Начните поиск отказных туров со скидками до 70%
                  </p>
                  <Link 
                    href="/catalog"
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Найти тур
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}