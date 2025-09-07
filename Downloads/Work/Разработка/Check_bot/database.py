from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from config import Settings
from models import Base, User
from typing import AsyncGenerator
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from typing import Callable, Dict, Any, Awaitable

settings = Settings()

# Создание движка базы данных
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Создание фабрики сессий
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def create_tables():
    """Создание таблиц в базе данных"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def init_database():
    """Инициализация базы данных"""
    await create_tables()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Получение асинхронной сессии базы данных (dependency для FastAPI)"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Получение асинхронной сессии базы данных"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_or_create_user(telegram_user, db: AsyncSession = None) -> User:
    """Получение или создание пользователя"""
    if db is None:
        async with async_session_maker() as session:
            return await _get_or_create_user_impl(telegram_user, session)
    else:
        return await _get_or_create_user_impl(telegram_user, db)


async def _get_or_create_user_impl(telegram_user, session: AsyncSession) -> User:
    """Внутренняя реализация получения или создания пользователя"""
    # Попытка найти существующего пользователя
    result = await session.execute(
        select(User).where(User.telegram_id == telegram_user.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Создание нового пользователя (без автоматического назначения админ прав)
        user = User(
            telegram_id=telegram_user.id,
            username=telegram_user.username,
            first_name=telegram_user.first_name,
            last_name=telegram_user.last_name,
            is_admin=False  # По умолчанию пользователь НЕ админ
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        # Обновление данных существующего пользователя (сохраняем статус админа)
        user.username = telegram_user.username
        user.first_name = telegram_user.first_name
        user.last_name = telegram_user.last_name
        # НЕ обновляем is_admin - он должен изменяться только через команды
        await session.commit()
        await session.refresh(user)  # Принудительное обновление из БД
    
    return user


async def get_user_by_telegram_id(telegram_id: int) -> User:
    """Получение пользователя по Telegram ID"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()


async def create_user_if_not_exists(telegram_user) -> User:
    """Создание пользователя если не существует"""
    return await get_or_create_user(telegram_user)


class DatabaseMiddleware(BaseMiddleware):
    """Middleware для предоставления сессии базы данных в handlers."""
    
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        async with async_session_maker() as session:
            data["db"] = session
            return await handler(event, data) 