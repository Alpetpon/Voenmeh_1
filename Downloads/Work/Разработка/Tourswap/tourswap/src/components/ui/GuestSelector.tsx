'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, Plus, Minus, X } from 'lucide-react';
import AgeSelector from './AgeSelector';
import AddChildSelector from './AddChildSelector';

interface Child {
  id: string;
  age: number;
}

interface GuestSelectorProps {
  value: number;
  onChange: (totalGuests: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function GuestSelector({ value, onChange, placeholder = "Гости", icon }: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState<Child[]>([]);
  const [openDirection] = useState<'up' | 'down'>('up');
  const [mounted, setMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обновляем общее количество гостей
  useEffect(() => {
    const total = adults + children.length;
    if (total !== value) {
      onChange(total);
    }
  }, [adults, children.length]); // Убираем onChange из зависимостей

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

    // Обновляем позицию при открытии
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

  const handleAdultsChange = (delta: number) => {
    const newAdults = Math.max(1, adults + delta);
    setAdults(newAdults);
  };

  const handleAddChild = (age: number) => {
    const newChild: Child = {
      id: Date.now().toString(),
      age
    };
    setChildren([...children, newChild]);
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const handleChildAgeChange = (id: string, age: number) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, age } : child
    ));
  };

  const totalGuests = adults + children.length;
  const displayText = totalGuests === 1 ? '1 гость' : 
                     totalGuests < 5 ? `${totalGuests} гостя` : 
                     `${totalGuests} гостей`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 min-h-[48px]"
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="text-gray-900 font-medium">{displayText}</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              y: openDirection === 'up' ? 10 : -10
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              y: openDirection === 'up' ? 10 : -10
            }}
            transition={{ duration: 0.2 }}
            className={`absolute bg-white border border-gray-200 rounded-2xl shadow-2xl min-w-[320px] z-50 ${
              openDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ 
              left: '0',
              right: '0'
            }}
          >
            <div className="p-6 space-y-6">
              {/* Взрослые */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">Взрослые</div>
                  <div className="text-sm text-gray-500 mt-1">от 18 лет</div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleAdultsChange(-1)}
                    disabled={adults <= 1}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <Minus size={18} className="text-gray-600 hover:text-orange-600" />
                  </button>
                  <span className="w-10 text-center font-bold text-lg text-gray-900">{adults}</span>
                  <button
                    type="button"
                    onClick={() => handleAdultsChange(1)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <Plus size={18} className="text-gray-600 hover:text-orange-600" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Дети */}
              <div className="space-y-4 relative">
                <div 
                  className="space-y-4 max-h-48 overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db transparent'
                  }}
                >
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between py-3 bg-gray-50 rounded-xl px-4 relative">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Ребёнок: {child.age} {child.age === 1 ? 'год' : child.age < 5 ? 'года' : 'лет'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AgeSelector
                        value={child.age}
                        onChange={(age) => handleChildAgeChange(child.id, age)}
                        minAge={1}
                        maxAge={17}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(child.id)}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-200 hover:scale-105"
                      >
                        <X size={16} className="text-red-500 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>

                {/* Добавить ребёнка */}
                <AddChildSelector onAddChild={handleAddChild} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}