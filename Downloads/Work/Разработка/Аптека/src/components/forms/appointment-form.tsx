'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

interface AppointmentFormProps {
  selectedStoreId?: number;
  onSuccess?: () => void;
  className?: string;
}

const serviceTypes = [
  { value: 'consultation', label: 'Консультация фармацевта' },
  { value: 'vaccination', label: 'Вакцинация' },
  { value: 'pressure_check', label: 'Измерение давления' },
  { value: 'glucose_test', label: 'Тест на глюкозу' },
  { value: 'other', label: 'Другое' }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

export default function AppointmentForm({ 
  selectedStoreId, 
  onSuccess, 
  className 
}: AppointmentFormProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    storeId: selectedStoreId || 0,
    serviceType: '',
    date: '',
    timeSlot: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загрузка списка аптек
  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/stores');
        const data = await response.json();
        
        if (data.success) {
          setStores(data.data.stores);
          
          // Если не выбрана аптека, выбираем первую
          if (!selectedStoreId && data.data.stores.length > 0) {
            setFormData(prev => ({ ...prev, storeId: data.data.stores[0].id }));
          }
        }
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [selectedStoreId]);

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Введите ваше имя';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Введите номер телефона';
    } else if (!/^\+?[7-8][\d\s\-\(\)]{10,}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Введите корректный номер телефона';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Введите корректный email';
    }

    if (!formData.storeId) {
      newErrors.storeId = 'Выберите аптеку';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Выберите тип услуги';
    }

    if (!formData.date) {
      newErrors.date = 'Выберите дату';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Дата не может быть в прошлом';
      }
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Выберите время';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Сброс формы
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          storeId: selectedStoreId || stores[0]?.id || 0,
          serviceType: '',
          date: '',
          timeSlot: '',
          notes: ''
        });
        
        onSuccess?.();
        
        // Показываем уведомление об успехе
        alert('Запись успешно создана! Мы свяжемся с вами для подтверждения.');
      } else {
        alert(data.message || 'Ошибка при создании записи');
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  // Обработка изменения полей
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Получение минимальной даты (завтра)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Получение максимальной даты (через 30 дней)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const selectedStore = stores.find(store => store.id === formData.storeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full max-w-2xl mx-auto', className)}
    >
      <div className="bg-background border border-border rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Записаться на консультацию
          </h2>
          <p className="text-muted-foreground">
            Заполните форму, и мы свяжемся с вами для подтверждения записи
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Личные данные */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Личные данные
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Имя *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.customerName ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="Введите ваше имя"
                />
                {errors.customerName && (
                  <p className="text-destructive text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.customerPhone ? 'border-destructive' : 'border-border'
                  )}
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.customerPhone && (
                  <p className="text-destructive text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (необязательно)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  errors.customerEmail ? 'border-destructive' : 'border-border'
                )}
                placeholder="your@email.com"
              />
              {errors.customerEmail && (
                <p className="text-destructive text-sm mt-1">{errors.customerEmail}</p>
              )}
            </div>
          </div>

          {/* Выбор аптеки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Аптека
            </h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Выберите аптеку *
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => handleChange('storeId', parseInt(e.target.value))}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  errors.storeId ? 'border-destructive' : 'border-border'
                )}
                disabled={loading}
              >
                <option value={0}>Выберите аптеку</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </option>
                ))}
              </select>
              {errors.storeId && (
                <p className="text-destructive text-sm mt-1">{errors.storeId}</p>
              )}
              
              {selectedStore && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">{selectedStore.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStore.address}</p>
                  {selectedStore.phone && (
                    <p className="text-sm text-muted-foreground">{selectedStore.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Услуга */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Тип услуги
            </h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Выберите услугу *
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  errors.serviceType ? 'border-destructive' : 'border-border'
                )}
              >
                <option value="">Выберите услугу</option>
                {serviceTypes.map(service => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="text-destructive text-sm mt-1">{errors.serviceType}</p>
              )}
            </div>
          </div>

          {/* Дата и время */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Дата и время
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Дата *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.date ? 'border-destructive' : 'border-border'
                  )}
                />
                {errors.date && (
                  <p className="text-destructive text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Время *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => handleChange('timeSlot', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-background text-foreground',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.timeSlot ? 'border-destructive' : 'border-border'
                  )}
                >
                  <option value="">Выберите время</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.timeSlot && (
                  <p className="text-destructive text-sm mt-1">{errors.timeSlot}</p>
                )}
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Дополнительная информация
            </h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Опишите ваш вопрос или дополнительную информацию..."
              />
            </div>
          </div>

          {/* Кнопка отправки */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting || loading}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                  Отправляем...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Записаться на консультацию
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            * Обязательные поля
          </div>
        </form>
      </div>
    </motion.div>
  );
} 