'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Выберите опцию",
  icon = <Users size={18} />,
  className
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    options.find(option => option.value === value) || null
  );
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0 });
  const [openDirection, setOpenDirection] = useState<'up' | 'down'>('up');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const option = options.find(option => option.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  const updateDropdownPosition = useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(options.length * 56 + 16, 248); // примерная высота + max-height
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Приоритет - открытие вверх, если есть достаточно места
      const openUpward = spaceAbove >= dropdownHeight;
      
      setOpenDirection(openUpward ? 'up' : 'down');
      setDropdownPosition({
        left: rect.left,
        top: openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        width: rect.width
      });
    }
  }, [options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updateDropdownPosition]);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative group", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/90 backdrop-blur-xl text-gray-800 border border-white/40 shadow-lg hover:shadow-xl focus:outline-none focus:ring-3 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-white transition-all duration-300 text-base font-medium text-left"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-orange-500 transition-colors duration-300 z-10">
          {icon}
        </div>
        
        <span className={cn(
          "block truncate",
          !selectedOption && "text-gray-400"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openDirection === 'up' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl backdrop-blur-xl overflow-hidden"
            style={{ 
              left: dropdownPosition.left,
              top: dropdownPosition.top,
              width: dropdownPosition.width
            }}
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 text-base font-medium",
                    selectedOption?.value === option.value && "bg-orange-50 text-orange-600"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                  whileHover={{ x: 4 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}