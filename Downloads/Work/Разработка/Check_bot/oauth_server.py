#!/usr/bin/env python3
"""
OAuth сервер для получения токенов Яндекс.Диска от пользователей
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from urllib.parse import urlencode

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from config import Settings
from database import get_db_session
from models import User
from services.user_oauth_service import user_oauth_service
from sqlalchemy import select

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Yandex OAuth Server", version="1.0.0")
settings = Settings()


@app.get("/")
async def root():
    """Главная страница"""
    return {"message": "Yandex OAuth Server"}


@app.get("/connect/{user_id}")
async def connect_yandex_disk(user_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Начало процесса подключения Yandex Disk для пользователя
    """
    try:
        # Проверяем существование пользователя
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Генерируем state для защиты от CSRF  
        state = user_oauth_service.generate_oauth_state(user.telegram_id)
        
        # Параметры для OAuth
        auth_params = {
            "response_type": "code",
            "client_id": settings.YANDEX_CLIENT_ID,
            "redirect_uri": "http://localhost:8080/oauth/callback",
            "scope": "cloud_api:disk.read cloud_api:disk.write cloud_api:disk.info",
            "state": state,
            "force_confirm": "yes"  # Всегда показывать экран разрешений
        }
        
        auth_url = f"https://oauth.yandex.ru/authorize?{urlencode(auth_params)}"
        
        logger.info(f"Создана OAuth ссылка для пользователя {user_id}: {auth_url}")
        
        return RedirectResponse(url=auth_url)
        
    except Exception as e:
        logger.error(f"Ошибка при создании OAuth ссылки: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/oauth/callback")
async def oauth_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Обработка callback от Yandex OAuth
    """
    try:
        # Проверка на ошибки
        if error:
            logger.error(f"OAuth ошибка: {error}")
            return HTMLResponse(
                content=f"""
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Произошла ошибка</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {{
                            theme: {{
                                extend: {{
                                    animation: {{
                                        'bounce-in': 'bounceIn 0.8s ease-out',
                                        'fade-in-up': 'fadeInUp 0.6s ease-out',
                                        'scale-in': 'scaleIn 0.5s ease-out',
                                        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both'
                                    }},
                                    keyframes: {{
                                        bounceIn: {{
                                            '0%': {{ transform: 'scale(0.3)', opacity: '0' }},
                                            '50%': {{ transform: 'scale(1.05)', opacity: '0.8' }},
                                            '70%': {{ transform: 'scale(0.9)', opacity: '1' }},
                                            '100%': {{ transform: 'scale(1)', opacity: '1' }}
                                        }},
                                        fadeInUp: {{
                                            '0%': {{ transform: 'translateY(30px)', opacity: '0' }},
                                            '100%': {{ transform: 'translateY(0)', opacity: '1' }}
                                        }},
                                        scaleIn: {{
                                            '0%': {{ transform: 'scale(0)', opacity: '0' }},
                                            '100%': {{ transform: 'scale(1)', opacity: '1' }}
                                        }},
                                        shake: {{
                                            '10%, 90%': {{ transform: 'translate3d(-1px, 0, 0)' }},
                                            '20%, 80%': {{ transform: 'translate3d(2px, 0, 0)' }},
                                            '30%, 50%, 70%': {{ transform: 'translate3d(-4px, 0, 0)' }},
                                            '40%, 60%': {{ transform: 'translate3d(4px, 0, 0)' }}
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    </script>
                    <style>
                        body {{
                            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                            min-height: 100vh;
                        }}
                    </style>
                </head>
                <body class="min-h-screen flex items-center justify-center p-4">
                    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
                        <!-- Header с иконкой ошибки -->
                        <div class="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
                            <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full animate-shake" style="animation-delay: 0.2s;">
                                <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h1 class="text-2xl font-bold text-white mt-4 animate-fade-in-up" style="animation-delay: 0.4s;">
                                Упс!
                            </h1>
                        </div>
                        
                        <!-- Основной контент -->
                        <div class="p-8">
                            <div class="text-center animate-fade-in-up" style="animation-delay: 0.6s;">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                                    Произошла ошибка
                                </h2>
                                
                                <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                    <div class="flex items-start space-x-3">
                                        <div class="flex-shrink-0">
                                            <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <p class="text-sm font-medium text-red-800">Описание проблемы:</p>
                                            <p class="text-xs text-red-600 mt-1 break-words">{str(e)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="space-y-4 text-gray-600">
                                    <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <div class="flex-shrink-0">
                                            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <p class="text-sm font-medium text-blue-800">Повторите попытку</p>
                                            <p class="text-xs text-blue-600">Попробуйте подключить диск заново</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                        <div class="flex-shrink-0">
                                            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <p class="text-sm font-medium text-amber-800">Инструкции</p>
                                            <p class="text-xs text-amber-600">Проверьте документацию по настройке</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                        <div class="flex-shrink-0">
                                            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <p class="text-sm font-medium text-purple-800">Техподдержка</p>
                                            <p class="text-xs text-purple-600">Свяжитесь с администраторами</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Кнопка закрытия -->
                            <div class="mt-8 animate-fade-in-up" style="animation-delay: 0.8s;">
                                <button 
                                    onclick="window.close()" 
                                    class="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-300"
                                >
                                    <div class="flex items-center justify-center space-x-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        <span>Закрыть окно</span>
                                    </div>
                                </button>
                                
                                <p class="text-xs text-gray-500 text-center mt-4">
                                    Спасибо за использование сервиса
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="bg-gray-50 px-8 py-4 animate-fade-in-up" style="animation-delay: 1s;">
                            <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Системная ошибка</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Фоновые элементы -->
                    <div class="fixed top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                    <div class="fixed bottom-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                    <div class="fixed top-1/2 right-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                    </body>
                </html>
                """,
                status_code=500
            )
        
        # Проверка параметров
        if not code or not state:
            raise HTTPException(status_code=400, detail="Отсутствуют необходимые параметры")
        
        # Проверка state
        telegram_id = user_oauth_service.get_telegram_id_by_state(state)
        if not telegram_id:
            raise HTTPException(status_code=400, detail="Неверный state токен")
        
        # Находим пользователя по telegram_id
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Получение access token
        token_data = await exchange_code_for_token(code)
        
        # Сохранение токена в БД (пользователь уже найден выше)
        
        # Обновляем пользователя
        user.yandex_access_token = token_data["access_token"]
        user.yandex_refresh_token = token_data.get("refresh_token")
        user.yandex_token_expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
        user.yandex_connected_at = datetime.utcnow()
        user.yandex_disk_connected = True
        
        await db.commit()
        
        logger.info(f"Успешно подключен Яндекс.Диск для пользователя {user.id} (telegram_id: {user.telegram_id})")
        
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Яндекс.Диск подключен!</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                animation: {
                                    'bounce-in': 'bounceIn 0.8s ease-out',
                                    'fade-in-up': 'fadeInUp 0.6s ease-out',
                                    'scale-in': 'scaleIn 0.5s ease-out',
                                    'pulse-success': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                    'float': 'float 6s ease-in-out infinite'
                                },
                                keyframes: {
                                    bounceIn: {
                                        '0%': { transform: 'scale(0.3)', opacity: '0' },
                                        '50%': { transform: 'scale(1.05)', opacity: '0.8' },
                                        '70%': { transform: 'scale(0.9)', opacity: '1' },
                                        '100%': { transform: 'scale(1)', opacity: '1' }
                                    },
                                    fadeInUp: {
                                        '0%': { transform: 'translateY(30px)', opacity: '0' },
                                        '100%': { transform: 'translateY(0)', opacity: '1' }
                                    },
                                    scaleIn: {
                                        '0%': { transform: 'scale(0)', opacity: '0' },
                                        '100%': { transform: 'scale(1)', opacity: '1' }
                                    },
                                    float: {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-20px)' }
                                    }
                                }
                            }
                        }
                    }
                </script>
                <style>
                    body {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        max-height: 100vh;
                        overflow: hidden;
                    }
                    .success-container {
                        max-height: 95vh;
                        overflow-y: auto;
                    }
                    @media (max-width: 640px) {
                        .mobile-padding { padding: 0.5rem; }
                        .mobile-text { font-size: 1.2rem; }
                        .mobile-icon { width: 3rem; height: 3rem; }
                        .mobile-card-padding { padding: 0.75rem; }
                    }
                    @media (max-height: 700px) {
                        .success-container { 
                            max-height: 90vh;
                            font-size: 0.85rem;
                        }
                    }
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center mobile-padding sm:p-2 lg:p-4">
                <!-- Главная карточка - компактная для полного экрана -->
                <div class="success-container w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-bounce-in">
                    <!-- Header с иконкой - компактный -->
                    <div class="bg-gradient-to-r from-green-400 to-green-600 p-3 sm:p-4 lg:p-5 text-center">
                        <div class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full animate-scale-in animate-float" style="animation-delay: 0.2s;">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-500 animate-pulse-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-2 sm:mt-3 animate-fade-in-up" style="animation-delay: 0.4s;">
                            Отлично!
                        </h1>
                    </div>
                    
                    <!-- Основной контент - компактные отступы -->
                    <div class="p-3 sm:p-4 lg:p-5">
                        <div class="text-center animate-fade-in-up" style="animation-delay: 0.6s;">
                            <h2 class="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">
                                Яндекс.Диск успешно подключен!
                            </h2>
                            
                            <!-- Блоки функций - компактное расположение -->
                            <div class="space-y-2 sm:space-y-3 text-gray-600">
                                <!-- Автоматическое сохранение -->
                                <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-lg sm:rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                                    <div class="flex-shrink-0 relative mx-auto sm:mx-0">
                                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center animate-pulse shadow-md">
                                            <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-width="1.5" opacity="0.4" d="M7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5C18.9853 7.5 21 9.51472 21 12C21 14.4853 18.9853 16.5 16.5 16.5H8C5.51472 16.5 3.5 14.4853 3.5 12C3.5 9.51472 5.51472 7.5 8 7.5H7.5Z" fill="currentColor"/>
                                                <path stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M12 21V13M8 17L12 13L16 17" fill="none"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="text-center sm:text-left flex-1">
                                        <p class="text-sm sm:text-base lg:text-lg font-bold text-green-800 mb-1">Автоматическое сохранение</p>
                                        <p class="text-xs sm:text-sm text-green-600">Ваши чеки будут сохраняться в облако мгновенно</p>
                                    </div>
                                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                                        <div class="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce" style="animation-delay: 0.2s;">
                                            <svg class="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Организация данных -->
                                <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                                    <div class="flex-shrink-0 relative mx-auto sm:mx-0">
                                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-400 via-cyan-500 to-sky-500 rounded-lg sm:rounded-xl flex items-center justify-center animate-pulse shadow-md" style="animation-delay: 0.3s;">
                                            <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" fill="currentColor" opacity="0.6"/>
                                                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 9L21 9" fill="none"/>
                                                <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M7 13H17M7 15H14" fill="none" opacity="0.8"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="text-center sm:text-left flex-1">
                                        <p class="text-sm sm:text-base lg:text-lg font-bold text-blue-800 mb-1">Организация данных</p>
                                        <p class="text-xs sm:text-sm text-blue-600">Папка: /Авточеки/год/месяц/организация/</p>
                                    </div>
                                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                                        <div class="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center animate-bounce" style="animation-delay: 0.4s;">
                                            <svg class="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- CSV отчеты -->
                                <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 sm:p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                                    <div class="flex-shrink-0 relative mx-auto sm:mx-0">
                                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center animate-pulse shadow-md" style="animation-delay: 0.6s;">
                                            <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor" opacity="0.4"/>
                                                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 2V8H20" fill="none"/>
                                                <rect x="8" y="12" width="2" height="6" rx="1" fill="currentColor"/>
                                                <rect x="11" y="10" width="2" height="8" rx="1" fill="currentColor"/>
                                                <rect x="14" y="14" width="2" height="4" rx="1" fill="currentColor"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="text-center sm:text-left flex-1">
                                        <p class="text-sm sm:text-base lg:text-lg font-bold text-purple-800 mb-1">CSV отчеты</p>
                                        <p class="text-xs sm:text-sm text-purple-600">Готовые файлы для бухгалтерии и налоговой</p>
                                    </div>
                                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                                        <div class="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center animate-bounce" style="animation-delay: 0.6s;">
                                            <svg class="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Финальное сообщение - компактное -->
                        <div class="mt-3 sm:mt-4 animate-fade-in-up" style="animation-delay: 0.8s;">
                            <div class="text-center p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                <div class="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full mb-2">
                                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <p class="text-xs sm:text-sm font-bold text-gray-800 mb-1">
                                    🎉 Настройка завершена!
                                </p>
                                <p class="text-xs text-gray-600">
                                    Отправляйте чеки боту - они сохранятся на диск
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer - компактный -->
                    <div class="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 animate-fade-in-up" style="animation-delay: 1s;">
                        <div class="flex items-center justify-center space-x-1 text-xs text-gray-500">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span>Защищенное соединение</span>
                        </div>
                    </div>
                </div>
                </body>
            </html>
            """
        )
        
    except Exception as e:
        logger.error(f"Ошибка при обработке OAuth callback: {e}")
        return HTMLResponse(
            content=f"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Произошла ошибка</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {{
                        theme: {{
                            extend: {{
                                animation: {{
                                    'bounce-in': 'bounceIn 0.8s ease-out',
                                    'fade-in-up': 'fadeInUp 0.6s ease-out',
                                    'scale-in': 'scaleIn 0.5s ease-out',
                                    'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both'
                                }},
                                keyframes: {{
                                    bounceIn: {{
                                        '0%': {{ transform: 'scale(0.3)', opacity: '0' }},
                                        '50%': {{ transform: 'scale(1.05)', opacity: '0.8' }},
                                        '70%': {{ transform: 'scale(0.9)', opacity: '1' }},
                                        '100%': {{ transform: 'scale(1)', opacity: '1' }}
                                    }},
                                    fadeInUp: {{
                                        '0%': {{ transform: 'translateY(30px)', opacity: '0' }},
                                        '100%': {{ transform: 'translateY(0)', opacity: '1' }}
                                    }},
                                    scaleIn: {{
                                        '0%': {{ transform: 'scale(0)', opacity: '0' }},
                                        '100%': {{ transform: 'scale(1)', opacity: '1' }}
                                    }},
                                    shake: {{
                                        '10%, 90%': {{ transform: 'translate3d(-1px, 0, 0)' }},
                                        '20%, 80%': {{ transform: 'translate3d(2px, 0, 0)' }},
                                        '30%, 50%, 70%': {{ transform: 'translate3d(-4px, 0, 0)' }},
                                        '40%, 60%': {{ transform: 'translate3d(4px, 0, 0)' }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                </script>
                <style>
                    body {{
                        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                        min-height: 100vh;
                    }}
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
                    <!-- Header с иконкой ошибки -->
                    <div class="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full animate-shake" style="animation-delay: 0.2s;">
                            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold text-white mt-4 animate-fade-in-up" style="animation-delay: 0.4s;">
                            Упс!
                        </h1>
                    </div>
                    
                    <!-- Основной контент -->
                    <div class="p-8">
                        <div class="text-center animate-fade-in-up" style="animation-delay: 0.6s;">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                                Произошла ошибка
                            </h2>
                            
                            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-red-800">Описание проблемы:</p>
                                        <p class="text-xs text-red-600 mt-1 break-words">{str(e)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="space-y-4 text-gray-600">
                                <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-blue-800">Повторите попытку</p>
                                        <p class="text-xs text-blue-600">Попробуйте подключить диск заново</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-amber-800">Инструкции</p>
                                        <p class="text-xs text-amber-600">Проверьте документацию по настройке</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-purple-800">Техподдержка</p>
                                        <p class="text-xs text-purple-600">Свяжитесь с администраторами</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <!-- Footer -->
                    <div class="bg-gray-50 px-8 py-4 animate-fade-in-up" style="animation-delay: 1s;">
                        <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Системная ошибка</span>
                        </div>
                    </div>
                </div>
                
                <!-- Фоновые элементы -->
                <div class="fixed top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                <div class="fixed bottom-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <div class="fixed top-1/2 right-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                </body>
            </html>
            """,
            status_code=500
        )


async def exchange_code_for_token(code: str) -> dict:
    """
    Обмен authorization code на access token
    """
    token_url = "https://oauth.yandex.ru/token"
    
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": settings.YANDEX_CLIENT_ID,
        "client_secret": settings.YANDEX_CLIENT_SECRET,
        "redirect_uri": "http://localhost:8080/oauth/callback"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
        if response.status_code != 200:
            logger.error(f"Ошибка получения токена: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail="Ошибка получения токена")
        
        return response.json()


@app.get("/disconnect/{user_id}")
async def disconnect_yandex_disk(user_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Отключение Yandex Disk для пользователя
    """
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Очищаем токены
        user.yandex_access_token = None
        user.yandex_refresh_token = None
        user.yandex_token_expires_at = None
        user.yandex_connected_at = None
        user.yandex_disk_connected = False
        
        await db.commit()
        
        logger.info(f"Яндекс.Диск отключен для пользователя {user_id}")
        
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Диск отключен</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                animation: {
                                    'bounce-in': 'bounceIn 0.8s ease-out',
                                    'fade-in-up': 'fadeInUp 0.6s ease-out',
                                    'scale-in': 'scaleIn 0.5s ease-out'
                                },
                                keyframes: {
                                    bounceIn: {
                                        '0%': { transform: 'scale(0.3)', opacity: '0' },
                                        '50%': { transform: 'scale(1.05)', opacity: '0.8' },
                                        '70%': { transform: 'scale(0.9)', opacity: '1' },
                                        '100%': { transform: 'scale(1)', opacity: '1' }
                                    },
                                    fadeInUp: {
                                        '0%': { transform: 'translateY(30px)', opacity: '0' },
                                        '100%': { transform: 'translateY(0)', opacity: '1' }
                                    },
                                    scaleIn: {
                                        '0%': { transform: 'scale(0)', opacity: '0' },
                                        '100%': { transform: 'scale(1)', opacity: '1' }
                                    }
                                }
                            }
                        }
                    }
                </script>
                <style>
                    body {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        min-height: 100vh;
                    }
                    @media (max-width: 640px) {
                        .mobile-padding { padding: 1rem; }
                        .mobile-text { font-size: 1.5rem; }
                        .mobile-icon { width: 4rem; height: 4rem; }
                        .mobile-card-padding { padding: 1rem; }
                    }
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center mobile-padding sm:p-4 lg:p-8">
                <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
                    <!-- Header с иконкой - адаптивный -->
                    <div class="bg-gradient-to-r from-orange-400 to-red-500 p-4 sm:p-6 lg:p-8 text-center">
                        <div class="inline-flex items-center justify-center mobile-icon sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-full animate-scale-in" style="animation-delay: 0.2s;">
                            <svg class="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h1 class="mobile-text sm:text-2xl lg:text-3xl font-bold text-white mt-3 sm:mt-4 animate-fade-in-up" style="animation-delay: 0.4s;">
                            Диск отключен
                        </h1>
                    </div>
                    
                    <!-- Основной контент - адаптивные отступы -->
                    <div class="mobile-card-padding sm:p-6 lg:p-8">
                        <div class="text-center animate-fade-in-up" style="animation-delay: 0.6s;">
                            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6">
                                Яндекс.Диск отключен
                            </h2>
                            
                            <div class="space-y-3 sm:space-y-4 text-gray-600">
                                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-gray-800">Токены удалены</p>
                                        <p class="text-xs text-gray-600">Все данные доступа очищены</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-blue-800">Файлы сохранены</p>
                                        <p class="text-xs text-blue-600">Ваши данные остались на диске</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                    <div class="flex-shrink-0">
                                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-green-800">Можно переподключить</p>
                                        <p class="text-xs text-green-600">В любой момент через бота</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Сообщение завершения -->
                        <div class="mt-8 animate-fade-in-up" style="animation-delay: 0.8s;">
                            <div class="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                                <div class="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-3">
                                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <p class="text-sm font-bold text-gray-800 mb-2">
                                    🔒 Диск отключен успешно
                                </p>
                                <p class="text-xs text-gray-600">
                                    Спасибо за использование сервиса
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer - адаптивный -->
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 animate-fade-in-up" style="animation-delay: 1s;">
                        <div class="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
                            <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Операция выполнена успешно</span>
                        </div>
                    </div>
                </div>
                
                <!-- Фоновые элементы - адаптивные -->
                <div class="fixed top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                <div class="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <div class="fixed top-1/2 right-4 sm:right-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white bg-opacity-10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                </body>
            </html>
            """
        )
        
    except Exception as e:
        logger.error(f"Ошибка при отключении Яндекс.Диска: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080) 