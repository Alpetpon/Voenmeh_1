'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import Image from 'next/image';

// interface SearchSuggestion {
//   id: string;
//   text: string;
//   type: 'product' | 'category' | 'brand';
//   url: string;
//   image?: string;
// }

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  showRecentSearches?: boolean;
  maxSuggestions?: number;
}

export default function SearchBar({
  placeholder = 'Поиск лекарств, витаминов, товаров...',
  className,
  onSearch,
  onResultSelect,
  showRecentSearches = true,
  maxSuggestions = 8
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загрузка недавних поисков из localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('ecolife-recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
      }
    }
  }, [showRecentSearches]);

  // Сохранение недавних поисков
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || !showRecentSearches) return;

    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('ecolife-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, [showRecentSearches]);

  // Debounced поиск
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data.products || []);
          setSuggestions(data.data.suggestions || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [maxSuggestions, setResults, setSuggestions, setIsLoading]
  );

  // Обработка изменения запроса
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsLoading(true);
      debouncedSearch(value);
    } else {
      setResults([]);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      onSearch?.(query);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Обработка выбора результата
  const handleResultSelect = (result: SearchResult) => {
    saveRecentSearch(result.name);
    onResultSelect?.(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length + (showRecentSearches ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          // Логика выбора элемента по индексу
          if (selectedIndex < results.length) {
            const selectedResult = results[selectedIndex];
            if (selectedResult) {
              handleResultSelect(selectedResult);
            }
          } else if (selectedIndex < results.length + suggestions.length) {
            const suggestion = suggestions[selectedIndex - results.length];
            if (suggestion) {
              setQuery(suggestion);
              handleSubmit(e);
            }
          } else if (showRecentSearches) {
            const recent = recentSearches[selectedIndex - results.length - suggestions.length];
            if (recent) {
              setQuery(recent);
              handleSubmit(e);
            }
          }
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results.length > 0 || suggestions.length > 0 || (showRecentSearches && recentSearches.length > 0);

  return (
    <div ref={searchRef} className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Иконка поиска */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <svg 
              className="w-5 h-5 text-gray-900" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-14 pl-16 pr-12 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 hover:border-gray-300"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl',
              'max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'
            )}
          >
            {/* Результаты поиска товаров */}
            {results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Товары
                </div>
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200',
                      'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                      'flex items-center gap-3',
                      selectedIndex === index && 'bg-primary/10 ring-2 ring-primary/20'
                    )}
                  >
                    {result.images[0] && (
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={result.images[0]}
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {result.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.brand && `${result.brand} • `}
                        {result.category.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-primary">
                          {result.price.toLocaleString('ru-RU')} ₽
                        </span>
                        {result.oldPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {result.oldPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Подсказки */}
            {suggestions.length > 0 && (
              <div className="p-2 border-t border-border/50">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Популярные запросы
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (results.length + index) * 0.05 }}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200',
                      'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                      'flex items-center gap-3',
                      selectedIndex === results.length + index && 'bg-primary/10 ring-2 ring-primary/20'
                    )}
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Недавние поиски */}
            {showRecentSearches && recentSearches.length > 0 && query.length === 0 && (
              <div className="p-2 border-t border-border/50">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Недавние поиски
                </div>
                {recentSearches.map((recent, index) => (
                  <motion.button
                    key={recent}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (results.length + suggestions.length + index) * 0.05 }}
                    onClick={() => {
                      setQuery(recent);
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200',
                      'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                      'flex items-center gap-3',
                      selectedIndex === results.length + suggestions.length + index && 'bg-primary/10 ring-2 ring-primary/20'
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{recent}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 