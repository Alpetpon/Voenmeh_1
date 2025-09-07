'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AgeSelectorProps {
  value: number;
  onChange: (age: number) => void;
  minAge?: number;
  maxAge?: number;
}

export default function AgeSelector({ value, onChange, minAge = 1, maxAge = 17 }: AgeSelectorProps) {
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
    onChange(age);
    setIsOpen(false);
  };

  const ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);

  const displayText = `${value}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-200 bg-white min-w-[70px] appearance-none cursor-pointer transition-all duration-200 hover:border-orange-300"
        style={{ minWidth: '70px' }}
      >
        <span>{displayText}</span>
        <ChevronDown 
          size={14} 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
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
            className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[10000] ${
              openDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
            style={{ 
              minWidth: '70px',
              maxHeight: '280px',
              left: '0',
              right: '0'
            }}
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {ages.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => handleAgeSelect(age)}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-600 ${
                    age === value ? 'bg-orange-100 text-orange-700' : 'text-gray-700'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}