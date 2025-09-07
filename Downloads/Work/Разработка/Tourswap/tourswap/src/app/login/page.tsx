"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/Button";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    
    let formatted = '+7';
    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length > 4) {
      formatted += ') ' + digits.slice(4, 7);
    }
    if (digits.length > 7) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length > 9) {
      formatted += '-' + digits.slice(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Вход:', { phone, password });
    } else {
      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      console.log('Регистрация:', { firstName, lastName, phone, password });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TourSwap</h1>
          </Link>
          <p className="text-gray-600">
            {isLogin ? 'Добро пожаловать обратно!' : 'Присоединяйтесь к нам!'}
          </p>
        </div>

        {/* Переключатель форм */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Вход
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Форма */}
        <div className="relative rounded-xl">
          <GlowingEffect
            spread={60}
            glow={true}
            disabled={false}
            proximity={80}
            inactiveZone={0.01}
            variant="orange"
            borderWidth={2}
            movementDuration={1}
          />
          
          <Card className="relative overflow-hidden w-full bg-white shadow-xl border border-gray-200">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Вход</CardTitle>
                    <CardDescription className="text-gray-600">
                      Введите номер телефона и пароль для входа в аккаунт
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Номер телефона
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={phone}
                          onChange={handlePhoneChange}
                          maxLength={18}
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Пароль
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Введите пароль"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full"
                          required
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Войти
                    </Button>
                    <button className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                      Забыли пароль?
                    </button>
                  </CardFooter>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Регистрация</CardTitle>
                    <CardDescription className="text-gray-600">
                      Создайте новый аккаунт для доступа к лучшим турам
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                            Имя
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="Ваше имя"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                            Фамилия
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Ваша фамилия"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone-reg" className="text-sm font-medium text-gray-700">
                          Номер телефона
                        </Label>
                        <Input
                          id="phone-reg"
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={phone}
                          onChange={handlePhoneChange}
                          maxLength={18}
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-reg" className="text-sm font-medium text-gray-700">
                          Пароль
                        </Label>
                        <Input
                          id="password-reg"
                          type="password"
                          placeholder="Создайте пароль"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                          Подтверждение пароля
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Повторите пароль"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full"
                          required
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Зарегистрироваться
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Ссылка назад */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}