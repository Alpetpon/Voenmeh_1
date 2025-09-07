"""
Основной модуль - запуск только Telegram бота без OAuth сервера
"""
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import Settings
from database import init_database, DatabaseMiddleware
from handlers import router

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Главная функция запуска приложения"""
    
    logger.info("🚀 Запуск приложения Авточеки...")
    settings = Settings()
    logger.info(f"📊 Режим отладки: {settings.DEBUG}")
    logger.info(f"🗄️ База данных: {settings.DATABASE_URL}")
    
    # Инициализируем базу данных
    await init_database()
    
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
        await bot.session.close()
        logger.info("🛑 Приложение остановлено")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("⏹️ Приложение остановлено пользователем")
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc() 