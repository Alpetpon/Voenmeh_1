'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';

interface AddChildSelectorProps {
  onAddChild: (age: number) => void;
  minAge?: number;
  maxAge?: number;
}

export default function AddChildSelector({ onAddChild, minAge = 1, maxAge = 17 }: AddChildSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection] = useState<'up' | 'down'>('up');
  const [mounted, setMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Функция для обновления позиции дропдауна
  const updateDropdownPosition = useCallback(() => {
    // Всегда открываем вверх, логика определения направления не нужна
  }, []);

  // Проверяем, что компонент смонтирован
  useEffect(() => {
    setMounted(true);
  }, []);

  // Обработчики событий
  useEffect(() => {
    if (!isOpen || !mounted) return;

    updateDropdownPosition();

    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mounted, updateDropdownPosition]);

  const handleAgeSelect = (age: number) => {
    onAddChild(age);
    setIsOpen(false);
  };

  const ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);

  const getAgeText = (age: number) => {
    if (age === 1) return `${age} год`;
    if (age < 5) return `${age} года`;
    return `${age} лет`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 font-medium bg-gray-50 hover:bg-white cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Plus size={16} className="text-gray-500" />
          <span>Добавить ребёнка</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              y: openDirection === 'up' ? 5 : -5
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              y: openDirection === 'up' ? 5 : -5
            }}
            transition={{ duration: 0.15 }}
            className={`absolute bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[10000] ${
              openDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ 
              maxHeight: '280px',
              left: '0',
              right: '0'
            }}
          >
            <div className="max-h-64 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Выберите возраст
              </div>
              {ages.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => handleAgeSelect(age)}
                  className="w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-600 text-gray-700 flex items-center justify-between group"
                >
                  <span>{getAgeText(age)}</span>
                  <Plus size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}