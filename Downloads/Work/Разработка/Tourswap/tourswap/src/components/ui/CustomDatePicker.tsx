'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className,
  minDate
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [openDirection] = useState<'up' | 'down'>('up');
  const [mounted, setMounted] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
    }
  }, [value]);

  const updateDatePickerPosition = useCallback(() => {
    // Всегда открываем вверх, логика определения направления не нужна
  }, []);

  // Проверяем, что компонент смонтирован
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    updateDatePickerPosition();

    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => updateDatePickerPosition();
    const handleResize = () => updateDatePickerPosition();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, mounted, updateDatePickerPosition]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Понедельник = 1, Воскресенье = 0, но нам нужно Понедельник = 0
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days = [];
    
    // Добавляем пустые ячейки для предыдущего месяца
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateDatePickerPosition();
    }
    setIsOpen(!isOpen);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    return date < new Date(minDate);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={cn("relative group", className)} ref={datePickerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-xl text-gray-800 border border-white/40 shadow-lg hover:shadow-xl focus:outline-none focus:ring-3 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-white transition-all duration-300 text-base font-medium text-left"
      >
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-orange-500 transition-colors duration-300 z-10" size={18} />
        
        <span className={cn(
          "block truncate",
          !selectedDate && "text-gray-400"
        )}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl backdrop-blur-xl overflow-hidden min-w-[320px] ${
              openDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ 
              left: '0',
              right: '0'
            }}
          >
            {/* Заголовок с навигацией */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-800">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-100">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Календарь */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <motion.button
                      type="button"
                      onClick={() => !isDateDisabled(day) && handleDateSelect(day)}
                      disabled={isDateDisabled(day)}
                      className={cn(
                        "w-full h-full rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-orange-50 hover:text-orange-600",
                        isDateDisabled(day) && "text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300",
                        selectedDate && day.toDateString() === selectedDate.toDateString() && 
                          "bg-orange-500 text-white hover:bg-orange-600 hover:text-white"
                      )}
                      whileHover={!isDateDisabled(day) ? { scale: 1.05 } : {}}
                      whileTap={!isDateDisabled(day) ? { scale: 0.95 } : {}}
                    >
                      {day.getDate()}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}