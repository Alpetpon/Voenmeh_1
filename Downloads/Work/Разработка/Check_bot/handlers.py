from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, BufferedInputFile
import aiohttp
from loguru import logger
from typing import Optional
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_or_create_user, get_user_by_telegram_id, create_user_if_not_exists
from models import User
from services.receipt_processor import ReceiptProcessor
from services.user_cloud_storage_service import user_cloud_storage_service
from services.user_oauth_service import user_oauth_service
from config import Settings

router = Router()
settings = Settings()

# Состояния для FSM
class ReceiptStates(StatesGroup):
    waiting_for_receipt = State()

# OAuth конфигурация
OAUTH_HOST = "localhost"
OAUTH_PORT = 8080
REDIRECT_URI = f"http://{OAUTH_HOST}:{OAUTH_PORT}/oauth/callback"


def get_main_keyboard(user_disk_connected: bool = False) -> InlineKeyboardMarkup:
    """Создает главную клавиатуру."""
    buttons = [
        [InlineKeyboardButton(text="📸 Загрузить чек", callback_data="upload_receipt")],
        [InlineKeyboardButton(text="📋 Мои чеки", callback_data="my_receipts")]
    ]
    
    if user_disk_connected:
        buttons.append([InlineKeyboardButton(text="💾 Статус диска", callback_data="disk_status")])
        buttons.append([InlineKeyboardButton(text="🔌 Отключить диск", callback_data="disconnect_disk")])
    else:
        buttons.append([InlineKeyboardButton(text="🔗 Подключить Яндекс.Диск", callback_data="connect_disk")])
    
    buttons.append([InlineKeyboardButton(text="ℹ️ Помощь", callback_data="help")])
    
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@router.message(Command("start"))
async def cmd_start(message: Message, db: AsyncSession):
    """Команда начала работы с ботом"""
    try:
        # Регистрируем или обновляем пользователя
        user = await create_user_if_not_exists(message.from_user)
        
        welcome_text = f"""
🤖 <b>Добро пожаловать в бот "Авточеки"!</b>

👋 Привет, {message.from_user.first_name}!

📋 <b>Что умеет бот:</b>
• 📸 Обрабатывать фото чеков с QR-кодами
• 💾 Сохранять данные на ваш личный Яндекс.Диск
• 📊 Создавать отчеты для бухгалтерии

🚀 <b>Выберите действие:</b>
        """
        
        keyboard = get_main_keyboard(user.yandex_disk_connected if user else False)
        await message.answer(welcome_text, reply_markup=keyboard, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Ошибка в команде /start: {e}")
        await message.answer("❌ Произошла ошибка при регистрации.")


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Команда помощи"""
    help_text = """
🤖 Бот "Авточеки" - помощник для обработки чеков

📖 Доступные команды:
/start - Начать работу с ботом
/help - Показать эту справку
/receipts - Показать ваши последние чеки
/connect_disk - Подключить Яндекс.Диск
/disk_status - Статус подключения диска
/admin - Панель администратора (только для админов)

📸 Как использовать:
1. Подключите ваш Яндекс.Диск командой /connect_disk
2. Сфотографируйте чек или отправьте готовое фото
3. Бот автоматически распознает QR-код и получит данные чека
4. Фото и данные будут сохранены на ваш Яндекс.Диск

💡 Бот сохраняет:
- Оригинальные фото чеков
- CSV файлы с данными позиций
- Автоматически создает отчеты для бухгалтерии

🔒 Данные сохраняются на ваш личный Яндекс.Диск в папку "Авточеки" с разбивкой по годам и месяцам.
    """
    await message.answer(help_text)


@router.message(Command("receipts"))
async def cmd_receipts(message: Message, db: AsyncSession):
    """Команда для просмотра последних чеков"""
    try:
        user = await get_or_create_user(message.from_user, db)
        
        if not user:
            await message.answer("❌ Пользователь не найден. Используйте /start")
            return
        
        processor = ReceiptProcessor(user.id, db)
        receipts = await processor.get_user_receipts(limit=10)
        
        if not receipts:
            await message.answer("📋 У вас пока нет обработанных чеков.\n\nОтправьте фото чека для начала работы!")
            return
        
        # Формируем список чеков
        receipts_text = "📋 Ваши последние чеки:\n\n"
        for i, receipt in enumerate(receipts, 1):
            status_emoji = "✅" if receipt['is_processed'] else "⚠️"
            receipts_text += f"{status_emoji} {i}. {receipt['date']} - {receipt['sum']:.2f} ₽\n"
            receipts_text += f"   🏪 {receipt['organization']}\n\n"
        
        # Кнопки для действий
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Обновить", callback_data="refresh_receipts")],
            [InlineKeyboardButton(text="📊 Статистика", callback_data="user_stats")]
        ])
        
        await message.answer(receipts_text, reply_markup=keyboard)
        
    except Exception as e:
        logger.error(f"Ошибка при получении чеков: {e}")
        await message.answer("❌ Ошибка при получении чеков.")


@router.callback_query(lambda c: c.data.startswith("receipt_details:"))
async def show_receipt_details(callback: CallbackQuery, db: AsyncSession):
    """Показать детали конкретного чека"""
    try:
        receipt_id = int(callback.data.split(":")[1])
        user = await get_or_create_user(callback.from_user, db)
        
        # Здесь нужно добавить метод в ReceiptProcessor для получения деталей
        # Пока что показываем базовую информацию
        
        detail_text = f"📋 Детали чека #{receipt_id}\n\n"
        detail_text += "ℹ️ Подробная информация о чеке будет добавлена в следующих версиях."
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 К списку чеков", callback_data="user_receipts")]
        ])
        
        await callback.message.edit_text(detail_text, reply_markup=keyboard)
        
    except Exception as e:
        logger.error(f"Ошибка при получении деталей чека: {e}")
        await callback.answer("❌ Ошибка получения деталей чека", show_alert=True)


@router.callback_query(lambda c: c.data == "refresh_receipts")
async def refresh_receipts(callback: CallbackQuery, db: AsyncSession):
    """Обновить список чеков"""
    try:
        user = await get_or_create_user(callback.from_user, db)
        
        processor = ReceiptProcessor(user.id, db)
        receipts = await processor.get_user_receipts(limit=10)
        
        if not receipts:
            await callback.message.edit_text("📋 У вас пока нет обработанных чеков.\n\nОтправьте фото чека для начала работы!")
            return
        
        # Формируем обновленный список чеков
        receipts_text = "📋 Ваши последние чеки (обновлено):\n\n"
        for i, receipt in enumerate(receipts, 1):
            status_emoji = "✅" if receipt['is_processed'] else "⚠️"
            receipts_text += f"{status_emoji} {i}. {receipt['date']} - {receipt['sum']:.2f} ₽\n"
            receipts_text += f"   🏪 {receipt['organization']}\n\n"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Обновить", callback_data="refresh_receipts")],
            [InlineKeyboardButton(text="📊 Статистика", callback_data="user_stats")]
        ])
        
        await callback.message.edit_text(receipts_text, reply_markup=keyboard)
        await callback.answer("✅ Список обновлен")
        
    except Exception as e:
        logger.error(f"Ошибка при обновлении списка чеков: {e}")
        await callback.answer("❌ Ошибка обновления списка", show_alert=True)


@router.message(Command("admin"))
async def cmd_admin(message: Message, db: AsyncSession):
    """Обработчик команды /admin - современная административная панель"""
    try:
        user = await get_or_create_user(message.from_user, db)
        
        # Отладочная информация для диагностики
        logger.info(f"Проверка прав админа для пользователя {message.from_user.id}: "
                   f"user.id={user.id}, is_admin={user.is_admin}, "
                   f"username={user.username}, first_name={user.first_name}")
        
        if not user.is_admin:
            # Дополнительная проверка - обновляем пользователя из БД
            from sqlalchemy import select
            from models import User
            
            fresh_user = await db.scalar(select(User).where(User.telegram_id == message.from_user.id))
            if fresh_user:
                logger.info(f"Повторная проверка из БД: user.id={fresh_user.id}, is_admin={fresh_user.is_admin}")
                if fresh_user.is_admin:
                    # Если в БД пользователь админ, но локальный объект показывает что нет - обновляем
                    user.is_admin = True
                    await db.commit()
                    logger.info("Исправлено рассинхронизация прав администратора")
                else:
                    await message.answer(
                        "❌ <b>Доступ запрещен</b>\n\n"
                        "У вас нет прав администратора для доступа к этой панели.\n"
                        "Обратитесь к администратору системы для получения прав.\n\n"
                        f"<i>Debug: User ID {user.id}, Admin: {user.is_admin}</i>",
                        parse_mode="HTML"
                    )
                    return
            else:
                logger.error(f"Пользователь {message.from_user.id} не найден в БД при повторной проверке")
                await message.answer(
                    "❌ <b>Ошибка доступа</b>\n\n"
                    "Произошла ошибка при проверке прав доступа. Попробуйте позже.",
                    parse_mode="HTML"
                )
            return
        
        # Если дошли до этого места - пользователь точно админ
        logger.info(f"Администратор {user.username or user.first_name} (ID: {user.id}) получил доступ к админ-панели")
        
        # Получаем базовую статистику
        from sqlalchemy import select, func
        from models import User, Receipt
        
        # Статистика пользователей
        users_count = await db.scalar(select(func.count(User.id)))
        active_users = await db.scalar(select(func.count(User.id)).where(User.yandex_disk_connected == True))
        
        # Статистика чеков
        receipts_count = await db.scalar(select(func.count(Receipt.id)))
        processed_receipts = await db.scalar(select(func.count(Receipt.id)).where(Receipt.is_processed == True))
        
        # Статистика за сегодня
        from datetime import date
        today = date.today()
        receipts_today = await db.scalar(
            select(func.count(Receipt.id)).where(func.date(Receipt.created_at) == today)
        )
        
        # Общая сумма чеков
        total_sum = await db.scalar(select(func.sum(Receipt.total_sum)).where(Receipt.is_processed == True))
        total_sum = total_sum or 0
        
        admin_text = f"""
👑 <b>Административная панель</b>
<i>Добро пожаловать, {user.first_name or user.username}!</i>

📊 <b>Статистика системы:</b>
━━━━━━━━━━━━━━━━━━━━━
👥 <b>Пользователи:</b>
• Всего зарегистрировано: <code>{users_count}</code>
• Подключили диск: <code>{active_users}</code> ({(active_users/users_count*100) if users_count > 0 else 0:.1f}%)

🧾 <b>Чеки:</b>
• Всего обработано: <code>{receipts_count}</code>
• Успешно: <code>{processed_receipts}</code> ({(processed_receipts/receipts_count*100) if receipts_count > 0 else 0:.1f}%)
• За сегодня: <code>{receipts_today}</code>

💰 <b>Финансы:</b>
• Общая сумма чеков: <code>{total_sum:,.2f} ₽</code>

🕒 <b>Последнее обновление:</b> {datetime.now().strftime('%d.%m.%Y %H:%M')}
━━━━━━━━━━━━━━━━━━━━━

🚀 <b>Выберите действие:</b>
        """
        
        # Создаем клавиатуру с функциями администратора
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📊 Детальная статистика", callback_data="admin_stats")
            ],
            [
                InlineKeyboardButton(text="📱 Логи системы", callback_data="admin_logs"),
                InlineKeyboardButton(text="🔄 Обновить данные", callback_data="admin_refresh")
            ],
            [
                InlineKeyboardButton(text="🏠 Главное меню", callback_data="main_menu")
            ]
        ])
        
        await message.answer(admin_text, reply_markup=keyboard, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Ошибка команды /admin: {e}")
        await message.answer("❌ Ошибка загрузки административной панели. Попробуйте позже.")


# Callback обработчики для административных функций

@router.callback_query(F.data == "admin_stats")
async def callback_admin_stats(callback: CallbackQuery, db: AsyncSession):
    """Детальная статистика системы"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    try:
        from sqlalchemy import select, func, and_
        from models import User, Receipt
        from datetime import date, timedelta
        
        # Статистика по дням
        yesterday = date.today() - timedelta(days=1)
        week_ago = date.today() - timedelta(days=7)
        month_ago = date.today() - timedelta(days=30)
        
        receipts_yesterday = await db.scalar(
            select(func.count(Receipt.id)).where(func.date(Receipt.created_at) == yesterday)
        )
        receipts_week = await db.scalar(
            select(func.count(Receipt.id)).where(Receipt.created_at >= week_ago)
        )
        receipts_month = await db.scalar(
            select(func.count(Receipt.id)).where(Receipt.created_at >= month_ago)
        )
        
        # Статистика по типам чеков
        fiscal_receipts = await db.scalar(
            select(func.count(Receipt.id)).where(Receipt.fiscal_number.isnot(None))
        )
        self_employed_receipts = await db.scalar(
            select(func.count(Receipt.id)).where(Receipt.inn.isnot(None))
        )
        
        # Статистика ошибок
        error_receipts = await db.scalar(
            select(func.count(Receipt.id)).where(Receipt.processing_error.isnot(None))
        )
        
        # Топ организаций
        top_orgs_query = select(
            Receipt.organization_name, 
            func.count(Receipt.id).label('count'),
            func.sum(Receipt.total_sum).label('total')
        ).where(
            Receipt.organization_name.isnot(None)
        ).group_by(Receipt.organization_name).order_by(func.count(Receipt.id).desc()).limit(5)
        
        top_orgs = await db.execute(top_orgs_query)
        top_orgs_result = top_orgs.fetchall()
        
        stats_text = f"""
📊 <b>Детальная статистика</b>

📅 <b>Активность по периодам:</b>
━━━━━━━━━━━━━━━━━━━━━
• Вчера: <code>{receipts_yesterday}</code> чеков
• За неделю: <code>{receipts_week}</code> чеков  
• За месяц: <code>{receipts_month}</code> чеков

🧾 <b>Типы чеков:</b>
━━━━━━━━━━━━━━━━━━━━━
• Фискальные (ФНС): <code>{fiscal_receipts}</code>
• Самозанятые: <code>{self_employed_receipts}</code>
• С ошибками: <code>{error_receipts}</code>

🏪 <b>Топ-5 организаций:</b>
━━━━━━━━━━━━━━━━━━━━━
"""
        
        for i, org in enumerate(top_orgs_result, 1):
            org_name = org[0][:25] + "..." if len(org[0]) > 25 else org[0]
            stats_text += f"{i}. <b>{org_name}</b>\n   📊 {org[1]} чеков • 💰 {org[2]:,.0f} ₽\n"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📈 Экспорт статистики", callback_data="admin_export_stats"),
                InlineKeyboardButton(text="🔄 Обновить", callback_data="admin_stats")
            ],
            [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
        ])
        
        await callback.message.edit_text(stats_text, reply_markup=keyboard, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Ошибка получения статистики: {e}")
        await callback.answer("❌ Ошибка загрузки статистики", show_alert=True)


@router.callback_query(F.data == "admin_users")
async def callback_admin_users(callback: CallbackQuery, db: AsyncSession):
    """Управление пользователями - функция отключена"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    disabled_text = """
🚫 <b>Функция отключена</b>

👥 <b>Управление пользователями</b> временно недоступно.

💡 <b>Доступные альтернативы:</b>
• Используйте команды /make_admin и /revoke_admin
• Проверяйте статус через /check_admin
• Просматривайте логи системы для мониторинга

🔙 Вернитесь в главную панель для других функций.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
    ])
    
    await callback.message.edit_text(disabled_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "admin_reports")
async def callback_admin_reports(callback: CallbackQuery, db: AsyncSession):
    """Отчеты и аналитика - функция отключена"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    disabled_text = """
🚫 <b>Функция отключена</b>

📈 <b>Отчеты и аналитика</b> временно недоступны.

💡 <b>Доступные альтернативы:</b>
• Просматривайте статистику в главной админ-панели
• Используйте детальную статистику для основных данных
• Экспортируйте базовые данные через раздел статистики

🔙 Вернитесь в главную панель для других функций.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
    ])
    
    await callback.message.edit_text(disabled_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "admin_settings")
async def callback_admin_settings(callback: CallbackQuery, db: AsyncSession):
    """Системные настройки - функция отключена"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    disabled_text = """
🚫 <b>Функция отключена</b>

🔧 <b>Системные настройки</b> временно недоступны.

💡 <b>Доступные альтернативы:</b>
• Настройки бота редактируются в файле config.py
• Для изменения конфигурации обратитесь к администратору системы
• Мониторинг состояния доступен в разделе "Логи системы"

🔙 Вернитесь в главную панель для других функций.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
    ])
    
    await callback.message.edit_text(disabled_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "admin_logs")
async def callback_admin_logs(callback: CallbackQuery, db: AsyncSession):
    """Логи системы"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    import os
    from datetime import datetime
    
    # Получаем последние записи из лога
    log_file = "logs/bot.log"
    logs_text = """
📱 <b>Логи системы</b>

📋 <b>Последние события:</b>
━━━━━━━━━━━━━━━━━━━━━
"""
    
    try:
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                last_lines = lines[-10:] if len(lines) > 10 else lines
                
                for line in last_lines:
                    if line.strip():
                        # Форматируем строку лога
                        if "ERROR" in line:
                            logs_text += f"🔴 <code>{line.strip()[:80]}...</code>\n"
                        elif "WARNING" in line:
                            logs_text += f"🟡 <code>{line.strip()[:80]}...</code>\n"
                        elif "INFO" in line:
                            logs_text += f"🟢 <code>{line.strip()[:80]}...</code>\n"
                        else:
                            logs_text += f"⚪ <code>{line.strip()[:80]}...</code>\n"
        else:
            logs_text += "📝 Файл логов не найден\n"
    except Exception as e:
        logs_text += f"❌ Ошибка чтения логов: {str(e)[:50]}\n"
    
    logs_text += f"""
━━━━━━━━━━━━━━━━━━━━━
🕒 <b>Обновлено:</b> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}

📊 <b>Статистика логов:</b>
• 🟢 INFO: Обычные события
• 🟡 WARNING: Предупреждения  
• 🔴 ERROR: Ошибки системы
• ⚪ DEBUG: Отладочная информация
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔴 Только ошибки", callback_data="admin_logs_errors"),
            InlineKeyboardButton(text="🔄 Обновить", callback_data="admin_logs")
        ],
        [
            InlineKeyboardButton(text="📤 Экспорт логов", callback_data="admin_export_logs"),
            InlineKeyboardButton(text="🗑️ Очистить логи", callback_data="admin_clear_logs")
        ],
        [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
    ])
    
    await callback.message.edit_text(logs_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "admin_refresh")
async def callback_admin_refresh(callback: CallbackQuery, db: AsyncSession):
    """Обновление данных админ-панели"""
    await callback.answer("🔄 Обновляем данные...")
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    # Перенаправляем на основную админ-панель с обновленными данными
    await cmd_admin(callback.message, db)


@router.callback_query(F.data == "admin_back")
async def callback_admin_back(callback: CallbackQuery, db: AsyncSession):
    """Возврат в главную админ-панель"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    # Имитируем команду /admin для возврата в главную панель
    await cmd_admin(callback.message, db)


@router.message(F.photo | F.document)
async def handle_photo_or_document(message: Message, db: AsyncSession):
    """Обработчик фотографий и документов"""
    try:
        # Получаем пользователя
        user = await get_or_create_user(message.from_user, db)
        
        # Проверяем подключение Яндекс.Диска
        if not user.yandex_disk_connected:
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔗 Подключить Яндекс.Диск", callback_data="connect_disk")]
            ])
            await message.answer(
                "⚠️ Для сохранения чеков необходимо подключить Яндекс.Диск!\n\n"
                "Нажмите кнопку ниже для подключения:",
                reply_markup=keyboard
            )
            return
        
        # Отправляем сообщение о начале обработки
        processing_msg = await message.answer("🔍 Обрабатываю ваш чек...")
        
        try:
            # Создаем процессор чеков с новым сервисом
            processor = ReceiptProcessor(user.id, db)
            
            # Обрабатываем файл
            if message.photo:
                # Это фотография
                photo = message.photo[-1]  # Берем фото наилучшего качества
                file_info = await message.bot.get_file(photo.file_id)
            elif message.document:
                # Это документ
                document = message.document
                
                # Проверяем тип файла
                if not document.mime_type or not document.mime_type.startswith('image/'):
                    await processing_msg.edit_text("❌ Пожалуйста, отправьте изображение чека.")
                    return
                
                file_info = await message.bot.get_file(document.file_id)
            
            # Скачиваем файл
            photo_file = await message.bot.download_file(file_info.file_path)
            
            # Обрабатываем чек
            result = await processor.process_receipt_photo(photo_file.read(), message.from_user)
            
            if result['success']:
                # Форматируем дату с проверкой на None
                receipt_date = result.get('receipt_date')
                if receipt_date:
                    date_str = receipt_date.strftime('%d.%m.%Y %H:%M')
                    year = receipt_date.year
                    month = receipt_date.month
                else:
                    date_str = 'Не определена'
                    year = datetime.now().year
                    month = datetime.now().month
                
                # Форматируем сумму с проверкой на None
                total_sum = result.get('total_sum')
                logger.info(f"🔍 DEBUG: result содержит: {result}")
                logger.info(f"🔍 DEBUG: total_sum из result = {total_sum}")
                if total_sum is not None:
                    sum_str = f"{total_sum} ₽"
                else:
                    sum_str = "Не определена"
                
                success_text = f"""
✅ Чек успешно обработан!

📊 Данные чека:
• Дата: {date_str}
• Сумма: {sum_str}
• Магазин: {result.get('organization_name', 'Неизвестно')}
• ФН: {result.get('fiscal_number', 'Н/Д')}

💾 Сохранено на ваш Яндекс.Диск:
• Фото чека
• CSV с данными

📁 Путь: /Авточеки/{year}/{month:02d}/{user.first_name or user.username}
                """
                await processing_msg.edit_text(success_text)
            else:
                error_text = f"❌ Ошибка при обработке чека:\n{result.get('error', 'Неизвестная ошибка')}"
                await processing_msg.edit_text(error_text)
                
        except Exception as e:
            logger.error(f"Ошибка при обработке файла: {e}")
            await processing_msg.edit_text("❌ Произошла ошибка при обработке чека.")
            
    except Exception as e:
        logger.error(f"Ошибка в обработчике фото: {e}")
        await message.answer("❌ Произошла ошибка.")


@router.message()
async def handle_other_messages(message: Message):
    """Обработчик всех остальных сообщений"""
    await message.answer(
        "📷 Отправьте фото QR-кода чека для обработки.\n\n"
        "💡 Также поддерживаются:\n"
        "• Документы (PDF, изображения)\n"
        "• Команды: /help, /receipts\n\n"
        "Если нужна помощь, используйте /help"
    )


@router.callback_query(F.data == "connect_disk")
async def callback_connect_disk(callback: CallbackQuery):
    """Обработчик подключения Яндекс.Диска."""
    await callback.answer()
    
    # Генерируем OAuth URL
    auth_url = user_oauth_service.get_authorization_url(
        callback.from_user.id,
        redirect_uri=REDIRECT_URI
    )
    
    connect_text = f"""
🔗 <b>Подключение Яндекс.Диска</b>

Для подключения вашего Яндекс.Диска:

1️⃣ Нажмите кнопку "Авторизоваться"
2️⃣ Войдите в ваш аккаунт Яндекс
3️⃣ Разрешите доступ к диску
4️⃣ Вернитесь в Telegram

⚠️ <b>Важно:</b>
• Токены хранятся только у вас локально
• Бот получает доступ только к вашему диску
• Вы можете отключить доступ в любой момент

💡 <b>После подключения:</b>
• Все чеки будут сохраняться в папку /telegram_bot/
• Автоматическое создание отчетов
• Синхронизация между устройствами
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔐 Авторизоваться", url=auth_url)],
        [InlineKeyboardButton(text="🔄 Проверить подключение", callback_data="check_connection")],
        [InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(connect_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "check_connection")
async def callback_check_connection(callback: CallbackQuery, db: AsyncSession):
    """Проверка подключения к диску."""
    await callback.answer("🔄 Проверяем подключение...")
    
    # Проверяем подключение
    is_connected = await user_oauth_service.test_user_disk_access(callback.from_user.id)
    
    if is_connected:
        success_text = """
✅ <b>Яндекс.Диск успешно подключен!</b>

🎉 Поздравляем! Теперь все ваши чеки будут автоматически сохраняться в облако.

📁 Папка для файлов: <code>/Авточеки/</code>

Можете отправлять фото чеков для обработки!
"""
        
        # Обновляем пользователя
        user = await get_or_create_user(callback.from_user, db)
        keyboard = get_main_keyboard(True)
        
        await callback.message.edit_text(success_text, reply_markup=keyboard, parse_mode="HTML")
    else:
        error_text = """
❌ <b>Диск не подключен</b>

Возможные причины:
• Авторизация не завершена
• Нет прав доступа к диску
• Проблемы с сетью

Попробуйте авторизоваться заново.
"""
        
        # Показываем кнопку для повторного подключения
        auth_url = user_oauth_service.get_authorization_url(
            callback.from_user.id,
            redirect_uri=REDIRECT_URI
        )
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔐 Авторизоваться заново", url=auth_url)],
            [InlineKeyboardButton(text="🔄 Проверить снова", callback_data="check_connection")],
            [InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu")]
        ])
        
        await callback.message.edit_text(error_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "disconnect_disk")
async def callback_disconnect_disk(callback: CallbackQuery):
    """Отключение Яндекс.Диска."""
    await callback.answer()
    
    disconnect_text = """
🔌 <b>Отключение Яндекс.Диска</b>

⚠️ Вы уверены, что хотите отключить Яндекс.Диск?

После отключения:
• Новые чеки не будут сохраняться в облако
• Старые файлы останутся на диске
• Токены доступа будут удалены
• Можно подключить заново в любой момент

<b>Рекомендация:</b> сначала скачайте важные файлы с диска.
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Да, отключить", callback_data="confirm_disconnect")],
        [InlineKeyboardButton(text="🔙 Отмена", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(disconnect_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "confirm_disconnect")
async def callback_confirm_disconnect(callback: CallbackQuery):
    """Подтверждение отключения диска."""
    await callback.answer("🔄 Отключаем диск...")
    
    success = await user_oauth_service.disconnect_user_disk(callback.from_user.id)
    
    if success:
        success_text = """
✅ <b>Яндекс.Диск отключен</b>

🔐 Токены доступа удалены
📁 Файлы на диске сохранены
🔄 Можете подключить диск заново

Для обработки новых чеков подключите диск снова.
"""
    else:
        success_text = """
❌ <b>Ошибка при отключении</b>

Попробуйте еще раз или обратитесь к администратору.
"""
    
    keyboard = get_main_keyboard(False)
    await callback.message.edit_text(success_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "disk_status")
async def callback_disk_status(callback: CallbackQuery, db: AsyncSession):
    """Показ статуса диска."""
    await callback.answer()
    
    user = await get_or_create_user(callback.from_user, db)
    if not user or not user.yandex_disk_connected:
        await callback.message.edit_text(
            "❌ Диск не подключен",
            reply_markup=get_main_keyboard(False)
        )
        return
    
    # Получаем информацию о диске
    disk_info = await user_cloud_storage_service.get_disk_info(user.id, db)
    
    if disk_info:
        # Простая информация без подсчета файлов (так как метод list_files не реализован)
        total_space = disk_info.get('total_space', 0)
        used_space = disk_info.get('used_space', 0)
        
        total_gb = total_space / (1024**3) if total_space else 0
        used_gb = used_space / (1024**3) if used_space else 0
        free_gb = total_gb - used_gb if total_gb > used_gb else 0
        
        status_text = f"""
💾 <b>Статус Яндекс.Диска</b>

✅ <b>Подключен и работает</b>
📅 Подключен: {user.yandex_connected_at.strftime('%d.%m.%Y %H:%M') if user.yandex_connected_at else 'Неизвестно'}

📊 <b>Использование места:</b>
• Всего: {total_gb:.1f} ГБ
• Занято: {used_gb:.1f} ГБ ({(used_gb/total_gb*100) if total_gb > 0 else 0:.1f}%)
• Свободно: {free_gb:.1f} ГБ

📁 <b>Папка для чеков:</b> /Авточеки/

🔄 <b>Токен доступа:</b>
• Автоматическое обновление: ✅
• Срок действия: {user.yandex_token_expires_at.strftime('%d.%m.%Y %H:%M') if user.yandex_token_expires_at else 'Неизвестно'}
"""
    else:
        status_text = """
💾 <b>Статус Яндекс.Диска</b>

⚠️ <b>Проблемы с доступом</b>

Диск подключен, но возникли проблемы:
• Истек токен доступа
• Нет прав на чтение/запись
• Проблемы с сетью

Рекомендуется переподключить диск.
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Обновить", callback_data="disk_status")],
        [InlineKeyboardButton(text="🔙 Главное меню", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(status_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "my_receipts")
async def callback_my_receipts(callback: CallbackQuery, db: AsyncSession):
    """Показ чеков пользователя."""
    await callback.answer()
    
    user = await get_or_create_user(callback.from_user, db)
    if not user:
        await callback.answer("❌ Пользователь не найден", show_alert=True)
        return
    
    receipts = await ReceiptProcessor(user.id, db).get_user_receipts(limit=10)
    
    if not receipts:
        text = """
📋 <b>Ваши чеки</b>

📪 У вас пока нет обработанных чеков.

Отправьте фото чека с QR-кодом для автоматической обработки!
"""
    else:
        text = f"📋 <b>Последние чеки ({len(receipts)}):</b>\n\n"
        
        total_sum = sum(receipt['sum'] for receipt in receipts)
        
        for i, receipt in enumerate(receipts, 1):
            status_emoji = "✅" if receipt['is_processed'] else "⏳"
            
            text += f"{status_emoji} <b>Чек #{receipt['id']}</b>\n"
            text += f"📅 {receipt['date']}\n"
            text += f"💰 {receipt['sum']:.2f} ₽\n"
            text += f"🏪 {receipt['organization'][:30]}...\n"
            
            if receipt['error']:
                text += f"❌ {receipt['error'][:50]}...\n"
            
            text += "\n"
        
        text += f"💵 <b>Общая сумма:</b> {total_sum:.2f} ₽"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📊 Полный отчет", callback_data="full_report")],
        [InlineKeyboardButton(text="🔙 Главное меню", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "main_menu")
async def callback_main_menu(callback: CallbackQuery, db: AsyncSession):
    """Возврат в главное меню."""
    await callback.answer()
    
    user = await get_or_create_user(callback.from_user, db)
    
    welcome_text = f"""
🤖 <b>Авточеки - Главное меню</b>

Привет, {callback.from_user.first_name}! 👋

🚀 <b>Выберите действие:</b>
"""
    
    keyboard = get_main_keyboard(user.yandex_disk_connected if user else False)
    await callback.message.edit_text(welcome_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "help")
async def callback_help(callback: CallbackQuery):
    """Показ справки."""
    await callback.answer()
    
    help_text = """
📖 <b>Справка по боту Авточеки</b>

<b>🔗 Подключение диска:</b>
1. Нажмите "Подключить Яндекс.Диск"
2. Авторизуйтесь в браузере
3. Разрешите доступ к диску

<b>📸 Работа с чеками:</b>
• Отправьте фото чека боту
• QR-код будет автоматически распознан
• Данные сохранятся в ваш диск

<b>📁 Структура файлов:</b>
<code>/telegram_bot/
├── 2025/01/Ваше_Имя/
│   ├── receipt_123_photo.jpg
│   ├── receipt_123_data.json
│   └── receipts_2025_01.csv</code>

<b>🔒 Безопасность:</b>
• Токены хранятся только у вас
• Автоматическое обновление доступа
• Полный контроль над данными

<b>Команды:</b>
/start - Главное меню
/help - Эта справка
/disk - Управление диском
/receipts - Мои чеки
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Главное меню", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(help_text, reply_markup=keyboard, parse_mode="HTML")


@router.message(Command("connect_disk"))
async def cmd_connect_disk(message: Message, db: AsyncSession):
    """Команда для подключения Яндекс.Диска"""
    try:
        # Получаем или создаем пользователя
        user = await get_or_create_user(message.from_user, db)
        
        if user.yandex_disk_connected:
            await message.answer(
                "✅ Ваш Яндекс.Диск уже подключен!\n\n"
                "Используйте /disk_status для проверки статуса или /disconnect_disk для отключения."
            )
            return
        
        # Создаем ссылку для OAuth
        oauth_url = f"http://localhost:8080/connect/{user.id}"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔗 Подключить Яндекс.Диск", url=oauth_url)]
        ])
        
        await message.answer(
            "🔗 Для подключения Яндекс.Диска нажмите кнопку ниже:\n\n"
            "После подключения ваши чеки будут автоматически сохраняться "
            "на ваш личный Яндекс.Диск в папку 'Авточеки'.\n\n"
            "⚠️ Убедитесь, что OAuth сервер запущен на порту 8080.",
            reply_markup=keyboard
        )
        
    except Exception as e:
        logger.error(f"Ошибка при создании ссылки OAuth: {e}")
        await message.answer("❌ Ошибка при создании ссылки. Попробуйте позже.")


@router.message(Command("disk_status"))
async def cmd_disk_status(message: Message, db: AsyncSession):
    """Команда для проверки статуса подключения диска"""
    try:
        user = await get_or_create_user(message.from_user, db)
        
        if not user.yandex_disk_connected:
            await message.answer(
                "❌ Яндекс.Диск не подключен\n\n"
                "Используйте /connect_disk для подключения."
            )
            return
        
        # Получаем информацию о диске
        disk_info = await user_cloud_storage_service.get_disk_info(user.id, db)
        
        if disk_info:
            total_gb = disk_info.get('total_space', 0) / (1024**3)
            free_gb = disk_info.get('free_space', 0) / (1024**3)
            used_gb = total_gb - free_gb
            
            status_text = f"""
✅ Яндекс.Диск подключен

📊 Информация о диске:
• Общий объем: {total_gb:.1f} ГБ
• Использовано: {used_gb:.1f} ГБ
• Свободно: {free_gb:.1f} ГБ

📅 Подключен: {user.yandex_connected_at.strftime('%d.%m.%Y %H:%M') if user.yandex_connected_at else 'Неизвестно'}
            """
        else:
            status_text = """
⚠️ Яндекс.Диск подключен, но возникла ошибка при получении информации о диске.

Возможные причины:
• Истек срок действия токена
• Проблемы с доступом к API

Попробуйте переподключить диск командой /connect_disk
            """
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="❌ Отключить диск", url=f"http://localhost:8080/disconnect/{user.id}")]
        ])
        
        await message.answer(status_text, reply_markup=keyboard)
        
    except Exception as e:
        logger.error(f"Ошибка при проверке статуса диска: {e}")
        await message.answer("❌ Ошибка при проверке статуса диска.")


@router.message(F.text)
async def handle_text_messages(message: Message):
    """Обработчик текстовых сообщений."""
    
    # Простая помощь для новых пользователей
    help_text = """
👋 Привет! Я бот для обработки чеков.

📸 Отправьте мне фото чека с QR-кодом, и я:
• Распознаю данные чека
• Сохраню их в ваш Яндекс.Диск
• Создам отчеты

🔧 Используйте команды:
/start - Главное меню
/help - Подробная справка
/disk - Управление диском

🔗 Сначала подключите Яндекс.Диск через /start
"""
    
    await message.answer(help_text)


@router.callback_query(lambda c: c.data == "user_disk_info")
async def show_user_disk_info(callback: CallbackQuery, db: AsyncSession):
    """Показывает информацию о диске пользователя."""
    try:
        user = await get_or_create_user(callback.from_user, db)
        
        if not user.yandex_disk_connected:
            await callback.answer("❌ Яндекс.Диск не подключен", show_alert=True)
            return
        
        # Получаем информацию о диске
        disk_info = await user_cloud_storage_service.get_disk_info(user.id, db)
        
        if disk_info:
            total_gb = disk_info.get('total_space', 0) / (1024**3)
            free_gb = disk_info.get('free_space', 0) / (1024**3)
            used_gb = total_gb - free_gb
            
            info_text = f"""
📊 Информация о Яндекс.Диске

💾 Общий объем: {total_gb:.1f} ГБ
📈 Использовано: {used_gb:.1f} ГБ
📉 Свободно: {free_gb:.1f} ГБ

📅 Подключен: {user.yandex_connected_at.strftime('%d.%m.%Y %H:%M') if user.yandex_connected_at else 'Неизвестно'}
            """
        else:
            info_text = "❌ Не удалось получить информацию о диске"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu")]
        ])
        
        await callback.message.edit_text(info_text, reply_markup=keyboard)
        
    except Exception as e:
        logger.error(f"Ошибка при получении информации о диске: {e}")
        await callback.answer("❌ Ошибка получения информации", show_alert=True)


@router.callback_query(F.data == "upload_receipt")
async def callback_upload_receipt(callback: CallbackQuery, db: AsyncSession):
    """Инструкция по загрузке чека."""
    await callback.answer()
    
    user = await get_or_create_user(callback.from_user, db)
    
    upload_text = """
📸 <b>Загрузка чека</b>

📋 <b>Пришлите нам качественное фото чека и мы обработаем ваши данные!</b>

🔍 <b>Требования к фото:</b>
• QR-код должен быть четко виден и не размыт
• Хорошее освещение, без теней
• Чек должен быть расправлен (без складок)
• Поддерживаются форматы: JPG, PNG

💡 <b>Что мы сделаем:</b>
• Распознаем QR-код с чека
• Получим данные чека из ФНС России
• Сохраним фото и данные на ваш Яндекс.Диск
• Создадим CSV отчет для бухгалтерии

🚀 <b>Готовы? Отправьте качественное фото чека прямо сейчас!</b>
    """
    
    if not user.yandex_disk_connected:
        upload_text += "\n\n⚠️ <b>Важно:</b> Для сохранения данных сначала подключите Яндекс.Диск"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Главное меню", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(upload_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query()
async def handle_unknown_callback(callback: CallbackQuery):
    """Обработчик неизвестных callback'ов."""
    await callback.answer("❌ Неизвестное действие", show_alert=True) 


# Дополнительные обработчики для административной панели

@router.callback_query(F.data == "admin_export_stats")
async def callback_admin_export_stats(callback: CallbackQuery, db: AsyncSession):
    """Экспорт статистики в файл"""
    await callback.answer("📊 Генерируем отчет...")
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    try:
        import io
        import csv
        from sqlalchemy import select, func
        from models import User, Receipt
        from datetime import datetime
        
        # Собираем данные для экспорта
        stats_data = []
        
        # Общая статистика
        users_count = await db.scalar(select(func.count(User.id)))
        receipts_count = await db.scalar(select(func.count(Receipt.id)))
        total_sum = await db.scalar(select(func.sum(Receipt.total_sum)).where(Receipt.is_processed == True))
        
        stats_data.append(['Метрика', 'Значение'])
        stats_data.append(['Всего пользователей', users_count])
        stats_data.append(['Всего чеков', receipts_count])
        stats_data.append(['Общая сумма', f"{total_sum or 0:,.2f} ₽"])
        stats_data.append(['Дата экспорта', datetime.now().strftime('%d.%m.%Y %H:%M')])
        
        # Создаем CSV файл
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(stats_data)
        
        # Отправляем файл
        csv_content = output.getvalue().encode('utf-8')
        file = BufferedInputFile(csv_content, filename=f"admin_stats_{datetime.now().strftime('%Y%m%d_%H%M')}.csv")
        
        await callback.message.answer_document(
            file,
            caption="📊 <b>Экспорт статистики</b>\n\nФайл содержит основные метрики системы на текущий момент.",
            parse_mode="HTML"
        )
        
    except Exception as e:
        logger.error(f"Ошибка экспорта статистики: {e}")
        await callback.answer("❌ Ошибка создания отчета", show_alert=True)


@router.callback_query(F.data == "admin_user_search") 
async def callback_admin_user_search(callback: CallbackQuery, db: AsyncSession):
    """Поиск пользователя"""
    await callback.answer()
    
    user, is_admin = await check_admin_rights(callback.from_user, db)
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    search_text = """
🔍 <b>Поиск пользователя</b>

📋 <b>Доступные варианты поиска:</b>
━━━━━━━━━━━━━━━━━━━━━
• 🆔 По ID пользователя
• 👤 По имени пользователя
• 📱 По Telegram username
• 📧 По статусу подключения

💡 <b>Быстрые фильтры:</b>
• Активные пользователи (подключили диск)
• Неактивные пользователи  
• Недавно зарегистрированные
• Пользователи с ошибками

<i>Функция поиска будет добавлена в следующей версии.</i>
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🟢 Активные", callback_data="admin_users_active"),
            InlineKeyboardButton(text="🔴 Неактивные", callback_data="admin_users_inactive")
        ],
        [
            InlineKeyboardButton(text="📅 Новые", callback_data="admin_users_new"),
            InlineKeyboardButton(text="⚠️ С проблемами", callback_data="admin_users_problems")
        ],
        [InlineKeyboardButton(text="🔙 Назад", callback_data="admin_users")]
    ])
    
    await callback.message.edit_text(search_text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data == "admin_report_summary")
async def callback_admin_report_summary(callback: CallbackQuery, db: AsyncSession):
    """Сводный отчет системы"""
    await callback.answer("📊 Генерируем сводный отчет...")
    
    user = await get_or_create_user(callback.from_user, db)
    if not user.is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    try:
        from sqlalchemy import select, func
        from models import User, Receipt
        from datetime import datetime, date, timedelta
        
        # Получаем данные для отчета
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Основные метрики
        total_users = await db.scalar(select(func.count(User.id)))
        active_users = await db.scalar(select(func.count(User.id)).where(User.yandex_disk_connected == True))
        total_receipts = await db.scalar(select(func.count(Receipt.id)))
        processed_receipts = await db.scalar(select(func.count(Receipt.id)).where(Receipt.is_processed == True))
        total_sum = await db.scalar(select(func.sum(Receipt.total_sum)).where(Receipt.is_processed == True))
        
        # Статистика за периоды
        receipts_today = await db.scalar(select(func.count(Receipt.id)).where(func.date(Receipt.created_at) == today))
        receipts_week = await db.scalar(select(func.count(Receipt.id)).where(Receipt.created_at >= week_ago))
        receipts_month = await db.scalar(select(func.count(Receipt.id)).where(Receipt.created_at >= month_ago))
        
        # Средние показатели
        avg_receipts_per_user = (total_receipts / active_users) if active_users > 0 else 0
        avg_sum_per_receipt = (total_sum / processed_receipts) if processed_receipts > 0 else 0
        
        report_text = f"""
📊 <b>Сводный отчет системы</b>
<i>Сгенерирован: {datetime.now().strftime('%d.%m.%Y %H:%M')}</i>

🎯 <b>Ключевые показатели:</b>
━━━━━━━━━━━━━━━━━━━━━
👥 <b>Пользователи:</b>
• Всего: <code>{total_users}</code>
• Активных: <code>{active_users}</code> ({(active_users/total_users*100) if total_users > 0 else 0:.1f}%)
• Конверсия: <code>{(active_users/total_users*100) if total_users > 0 else 0:.1f}%</code>

🧾 <b>Чеки:</b>
• Всего обработано: <code>{total_receipts}</code>
• Успешно: <code>{processed_receipts}</code> ({(processed_receipts/total_receipts*100) if total_receipts > 0 else 0:.1f}%)
• Среднее на пользователя: <code>{avg_receipts_per_user:.1f}</code>

💰 <b>Финансы:</b>
• Общая сумма: <code>{total_sum or 0:,.2f} ₽</code>
• Средний чек: <code>{avg_sum_per_receipt:.2f} ₽</code>

📈 <b>Активность:</b>
• За сегодня: <code>{receipts_today}</code> чеков
• За неделю: <code>{receipts_week/7:.1f}</code> чеков/день
• За месяц: <code>{receipts_month/30:.1f}</code> чеков/день
        """
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📤 Экспорт отчета", callback_data="admin_export_summary"),
                InlineKeyboardButton(text="📊 Детализация", callback_data="admin_stats")
            ],
            [InlineKeyboardButton(text="🔙 Назад к отчетам", callback_data="admin_reports")]
        ])
        
        await callback.message.edit_text(report_text, reply_markup=keyboard, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Ошибка генерации сводного отчета: {e}")
        await callback.answer("❌ Ошибка создания отчета", show_alert=True)


@router.callback_query(F.data.startswith("admin_"))
async def callback_admin_placeholder(callback: CallbackQuery, db: AsyncSession):
    """Заглушка для нереализованных админ функций"""
    await callback.answer()
    
    user = await get_or_create_user(callback.from_user, db)
    if not user.is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    function_name = callback.data.replace("admin_", "").replace("_", " ").title()
    
    placeholder_text = f"""
🚧 <b>Функция в разработке</b>

⚙️ <b>Функция:</b> {function_name}
📅 <b>Статус:</b> Планируется к реализации
🔄 <b>Версия:</b> v2.0

💡 <b>Что будет доступно:</b>
━━━━━━━━━━━━━━━━━━━━━
• Расширенная аналитика
• Детальные отчеты  
• Экспорт в различные форматы
• Автоматизация процессов
• Уведомления и алерты

📝 <b>Текущие возможности:</b>
• ✅ Базовая статистика
• ✅ Управление пользователями
• ✅ Просмотр логов
• ✅ Мониторинг системы

🔔 <b>Уведомления:</b>
Вы получите уведомление о выходе новых функций.

<i>Спасибо за использование административной панели!</i>
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📝 Оставить фидбек", callback_data="admin_feedback"),
            InlineKeyboardButton(text="🔔 Подписаться на обновления", callback_data="admin_subscribe")
        ],
        [InlineKeyboardButton(text="🔙 Назад в админ-панель", callback_data="admin_back")]
    ])
    
    await callback.message.edit_text(placeholder_text, reply_markup=keyboard, parse_mode="HTML")


async def check_admin_rights(user_from_telegram, db: AsyncSession) -> tuple[User, bool]:
    """
    Универсальная функция для проверки прав администратора
    Возвращает (user_object, is_admin)
    """
    try:
        user = await get_or_create_user(user_from_telegram, db)
        
        # Отладочная информация
        logger.info(f"Проверка прав админа для пользователя {user_from_telegram.id}: "
                   f"user.id={user.id}, is_admin={user.is_admin}")
        
        if not user.is_admin:
            # Дополнительная проверка - получаем свежие данные из БД
            from sqlalchemy import select
            from models import User
            
            fresh_user = await db.scalar(select(User).where(User.telegram_id == user_from_telegram.id))
            if fresh_user and fresh_user.is_admin:
                # Исправляем рассинхронизацию
                user.is_admin = True
                await db.commit()
                logger.info(f"Исправлена рассинхронизация прав для пользователя {user.id}")
                return user, True
            else:
                logger.info(f"Пользователь {user.id} не является администратором")
                return user, False
        else:
            logger.info(f"Пользователь {user.id} является администратором")
            return user, True
            
    except Exception as e:
        logger.error(f"Ошибка при проверке прав администратора: {e}")
        return None, False


# Декоратор для проверки прав администратора
def admin_required(func):
    """Декоратор для проверки прав администратора в callback'ах"""
    async def wrapper(callback: CallbackQuery, db: AsyncSession):
        user, is_admin = await check_admin_rights(callback.from_user, db)
        if not is_admin:
            await callback.answer("❌ Нет прав доступа", show_alert=True)
            return
        return await func(callback, db, user)
    return wrapper


