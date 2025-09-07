"""
Основной модуль приложения - запуск бота и OAuth сервера
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from threading import Thread
import signal
import sys

from aiogram import Bot, Dispatcher
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import Settings
from database import init_database, DatabaseMiddleware
from handlers import router
from oauth_server import app as oauth_app

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Глобальные переменные
settings = Settings()




def start_oauth_server():
    """Запуск OAuth сервера"""
    try:
        logger.info("🔐 Запуск OAuth сервера...")
        
        # Добавляем CORS для веб-интерфейса
        oauth_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Запускаем сервер
        uvicorn.run(
            oauth_app,
            host=settings.OAUTH_HOST,
            port=settings.OAUTH_PORT,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"❌ Ошибка запуска OAuth сервера: {e}")
        raise


async def shutdown_handler():
    """Обработчик завершения работы"""
    logger.info("🔄 Завершение работы приложения...")
    
    try:
        # Закрываем сессию бота
        await bot.session.close()
        logger.info("✅ Telegram бот остановлен")
    except Exception as e:
        logger.error(f"Ошибка при остановке бота: {e}")


def signal_handler(signum, frame):
    """Обработчик сигналов"""
    logger.info(f"Получен сигнал {signum}, завершение работы...")
    sys.exit(0)


async def main():
    """Главная функция запуска приложения"""
    
    logger.info("🚀 Запуск приложения Авточеки...")
    logger.info(f"📊 Режим отладки: {settings.DEBUG}")
    logger.info(f"🗄️ База данных: {settings.DATABASE_URL}")
    logger.info(f"🔐 OAuth сервер: http://localhost:8080")
    
    # Инициализируем базу данных
    await init_database()
    
    # Запускаем OAuth сервер в отдельном процессе
    logger.info("🔐 Запуск OAuth сервера...")
    config = uvicorn.Config(oauth_app, host="localhost", port=8080, log_level="info")
    server = uvicorn.Server(config)
    
    # Запускаем сервер в фоне
    oauth_task = asyncio.create_task(server.serve())
    
    # Инициализируем бота
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    
    # Создаем диспетчер
    dp = Dispatcher()
    
    # Подключаем middleware для работы с БД
    dp.message.middleware(DatabaseMiddleware())
    dp.callback_query.middleware(DatabaseMiddleware())
    
    # Регистрируем роутер
    dp.include_router(router)
    
    # Устанавливаем команды бота
    from aiogram.types import BotCommand
    await bot.set_my_commands([
        BotCommand(command="start", description="Начать работу с ботом"),
        BotCommand(command="help", description="Справка по использованию"),
        BotCommand(command="receipts", description="Мои чеки"),
        BotCommand(command="connect_disk", description="Подключить Яндекс.Диск"),
        BotCommand(command="disk_status", description="Статус подключения диска"),
        BotCommand(command="admin", description="Панель администратора"),
    ])
    
    logger.info("🤖 Запуск Telegram бота...")
    
    try:
        logger.info("✅ Telegram бот готов к работе")
        await dp.start_polling(bot)
    finally:
        oauth_task.cancel()
        try:
            await oauth_task
        except asyncio.CancelledError:
            pass
        logger.info("🛑 Приложение остановлено")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("⏹️ Приложение остановлено пользователем")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        sys.exit(1) 