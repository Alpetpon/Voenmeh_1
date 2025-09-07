'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plane, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutocompleteOption {
  value: string;
  label: string;
  country?: string;
}

interface CustomAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  options?: AutocompleteOption[];
  type?: 'from' | 'to';
}

// Примерные данные городов
const defaultCities: AutocompleteOption[] = [
  { value: 'moscow', label: 'Москва', country: 'Россия' },
  { value: 'spb', label: 'Санкт-Петербург', country: 'Россия' },
  { value: 'kazan', label: 'Казань', country: 'Россия' },
  { value: 'sochi', label: 'Сочи', country: 'Россия' },
  { value: 'dubai', label: 'Дубай', country: 'ОАЭ' },
  { value: 'istanbul', label: 'Стамбул', country: 'Турция' },
  { value: 'antalya', label: 'Анталья', country: 'Турция' },
  { value: 'paris', label: 'Париж', country: 'Франция' },
  { value: 'rome', label: 'Рим', country: 'Италия' },
  { value: 'barcelona', label: 'Барселона', country: 'Испания' },
  { value: 'madrid', label: 'Мадрид', country: 'Испания' },
  { value: 'london', label: 'Лондон', country: 'Великобритания' },
  { value: 'berlin', label: 'Берлин', country: 'Германия' },
  { value: 'prague', label: 'Прага', country: 'Чехия' },
  { value: 'vienna', label: 'Вена', country: 'Австрия' },
  { value: 'athens', label: 'Афины', country: 'Греция' },
  { value: 'lisbon', label: 'Лиссабон', country: 'Португалия' },
  { value: 'amsterdam', label: 'Амстердам', country: 'Нидерланды' },
  { value: 'budapest', label: 'Будапешт', country: 'Венгрия' },
  { value: 'warsaw', label: 'Варшава', country: 'Польша' },
];

export default function CustomAutocomplete({
  value,
  onChange,
  placeholder = "Выберите город",
  icon,
  className,
  options = defaultCities,
  type = 'from'
}: CustomAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openDirection] = useState<'up' | 'down'>('up');
  const [mounted, setMounted] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultIcon = type === 'from' ? <MapPin size={18} /> : <Plane size={18} />;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Проверяем, что компонент смонтирован
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateAutocompletePosition = useCallback(() => {
    // Всегда открываем вверх, логика определения направления не нужна
  }, []);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        (option.country && option.country.toLowerCase().includes(inputValue.toLowerCase()))
      );
      setFilteredOptions(filtered.slice(0, 10)); // Ограничиваем 10 результатами
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions([]);
    }
  }, [inputValue, options]);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    updateAutocompletePosition();

    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Если пользователь кликнул вне, но ввел валидное значение, сохраняем его
        if (inputValue && !options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase())) {
          onChange(inputValue);
        }
      }
    };

    const handleScroll = () => updateAutocompletePosition();
    const handleResize = () => updateAutocompletePosition();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, mounted, updateAutocompletePosition, inputValue, options, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    onChange(newValue);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.length > 0 && filteredOptions.length > 0) {
      updateAutocompletePosition();
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative group", className)} ref={autocompleteRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-orange-500 transition-colors duration-300 z-10">
          {icon || defaultIcon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-xl text-gray-800 placeholder-gray-400 border border-white/40 shadow-lg hover:shadow-xl focus:outline-none focus:ring-3 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-white transition-all duration-300 text-base font-medium"
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl backdrop-blur-xl overflow-hidden ${
              openDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ 
              left: '0',
              right: '0'
            }}
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 text-base font-medium flex items-center justify-between",
                    highlightedIndex === index && "bg-orange-50 text-orange-600"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.country && (
                      <span className="text-sm text-gray-500">{option.country}</span>
                    )}
                  </div>
                  {highlightedIndex === index && (
                    <Search size={16} className="text-orange-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}