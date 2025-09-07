import asyncio
import secrets
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import httpx
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import async_session_maker
from models import User


class UserOAuthService:
    """Сервис для управления OAuth токенами пользователей Yandex."""
    
    def __init__(self):
        self.client_id = settings.YANDEX_CLIENT_ID
        self.client_secret = settings.YANDEX_CLIENT_SECRET
        
        # OAuth endpoints
        self.auth_url = "https://oauth.yandex.ru"
        self.api_url = "https://cloud-api.yandex.net/v1/disk"
        
        # Временное хранилище для OAuth state (в продакшене нужен Redis)
        self._oauth_states: Dict[str, int] = {}  # state -> telegram_id
    
    def generate_oauth_state(self, telegram_id: int) -> str:
        """Генерирует state параметр для OAuth и связывает его с пользователем."""
        state = secrets.token_urlsafe(32)
        self._oauth_states[state] = telegram_id
        
        # Очищаем старые state через 10 минут
        asyncio.create_task(self._cleanup_state(state, 600))
        
        return state
    
    async def _cleanup_state(self, state: str, delay: int):
        """Удаляет state после задержки."""
        await asyncio.sleep(delay)
        self._oauth_states.pop(state, None)
    
    def get_telegram_id_by_state(self, state: str) -> Optional[int]:
        """Возвращает telegram_id по state параметру."""
        return self._oauth_states.get(state)
    
    def get_authorization_url(self, telegram_id: int, redirect_uri: str) -> str:
        """Генерирует URL для авторизации пользователя."""
        state = self.generate_oauth_state(telegram_id)
        
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': 'cloud_api:disk.read cloud_api:disk.write',
            'state': state,
            'force_confirm': 'yes'
        }
        
        query_string = urllib.parse.urlencode(params)
        auth_url = f"{self.auth_url}/authorize?{query_string}"
        
        logger.info(f"Создан OAuth URL для пользователя {telegram_id}, state: {state}")
        return auth_url
    
    async def exchange_code_for_tokens(
        self, 
        auth_code: str, 
        redirect_uri: str, 
        state: str
    ) -> Optional[Dict[str, Any]]:
        """Обменивает authorization code на токены и сохраняет их для пользователя."""
        
        # Проверяем state
        telegram_id = self.get_telegram_id_by_state(state)
        if not telegram_id:
            logger.error(f"Неверный или истекший state: {state}")
            return None
        
        # Обмениваем код на токены
        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.auth_url}/token",
                    data=data,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    timeout=30.0
                )
                
                response.raise_for_status()
                token_data = response.json()
                
                # Сохраняем токены в БД
                success = await self._save_user_tokens(telegram_id, token_data)
                if success:
                    # Очищаем state
                    self._oauth_states.pop(state, None)
                    
                    logger.info(f"✅ Токены сохранены для пользователя {telegram_id}")
                    return {
                        'telegram_id': telegram_id,
                        'access_token': token_data['access_token'],
                        'expires_in': token_data.get('expires_in', 3600)
                    }
                else:
                    logger.error(f"Не удалось сохранить токены для пользователя {telegram_id}")
                    return None
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP ошибка при обмене кода на токены: {e}")
                logger.error(f"Response: {e.response.text}")
                return None
            except Exception as e:
                logger.error(f"Ошибка при обмене кода на токены: {e}")
                return None
    
    async def _save_user_tokens(self, telegram_id: int, token_data: Dict[str, Any]) -> bool:
        """Сохраняет токены пользователя в БД."""
        async with async_session_maker() as session:
            try:
                # Находим пользователя
                result = await session.execute(
                    select(User).where(User.telegram_id == telegram_id)
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    logger.error(f"Пользователь с telegram_id {telegram_id} не найден")
                    return False
                
                # Сохраняем токены
                user.yandex_access_token = token_data['access_token']
                user.yandex_refresh_token = token_data.get('refresh_token')
                
                expires_in = token_data.get('expires_in', 3600)
                user.yandex_token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                user.yandex_connected_at = datetime.utcnow()
                user.yandex_disk_connected = True
                
                await session.commit()
                return True
                
            except Exception as e:
                logger.error(f"Ошибка при сохранении токенов пользователя: {e}")
                await session.rollback()
                return False
    
    async def get_user_tokens(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """Получает токены пользователя из БД."""
        async with async_session_maker() as session:
            try:
                result = await session.execute(
                    select(User).where(User.telegram_id == telegram_id)
                )
                user = result.scalar_one_or_none()
                
                if not user or not user.yandex_disk_connected:
                    return None
                
                return {
                    'access_token': user.yandex_access_token,
                    'refresh_token': user.yandex_refresh_token,
                    'expires_at': user.yandex_token_expires_at,
                    'connected_at': user.yandex_connected_at
                }
                
            except Exception as e:
                logger.error(f"Ошибка при получении токенов пользователя: {e}")
                return None
    
    async def refresh_user_tokens(self, telegram_id: int) -> bool:
        """Обновляет токены пользователя."""
        tokens = await self.get_user_tokens(telegram_id)
        if not tokens or not tokens.get('refresh_token'):
            logger.error(f"Нет refresh token для пользователя {telegram_id}")
            return False
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': tokens['refresh_token'],
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.auth_url}/token",
                    data=data,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    timeout=30.0
                )
                
                response.raise_for_status()
                token_data = response.json()
                
                # Сохраняем обновленные токены
                success = await self._save_user_tokens(telegram_id, token_data)
                if success:
                    logger.info(f"✅ Токены обновлены для пользователя {telegram_id}")
                
                return success
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP ошибка при обновлении токенов: {e}")
                return False
            except Exception as e:
                logger.error(f"Ошибка при обновлении токенов: {e}")
                return False
    
    async def ensure_valid_user_tokens(self, telegram_id: int) -> Optional[str]:
        """Убеждается что токены пользователя валидны и возвращает access_token."""
        tokens = await self.get_user_tokens(telegram_id)
        if not tokens:
            return None
        
        # Проверяем срок действия токена
        if (tokens.get('expires_at') and 
            datetime.utcnow() >= tokens['expires_at'] - timedelta(minutes=5)):
            
            logger.info(f"Токен истекает для пользователя {telegram_id}, обновляем...")
            if not await self.refresh_user_tokens(telegram_id):
                logger.error(f"Не удалось обновить токены для пользователя {telegram_id}")
                return None
            
            # Получаем обновленные токены
            tokens = await self.get_user_tokens(telegram_id)
            if not tokens:
                return None
        
        return tokens['access_token']
    
    async def disconnect_user_disk(self, telegram_id: int) -> bool:
        """Отключает Яндекс.Диск для пользователя."""
        async with async_session_maker() as session:
            try:
                result = await session.execute(
                    select(User).where(User.telegram_id == telegram_id)
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    return False
                
                # Очищаем токены
                user.yandex_access_token = None
                user.yandex_refresh_token = None
                user.yandex_token_expires_at = None
                user.yandex_connected_at = None
                user.yandex_disk_connected = False
                
                await session.commit()
                logger.info(f"✅ Яндекс.Диск отключен для пользователя {telegram_id}")
                return True
                
            except Exception as e:
                logger.error(f"Ошибка при отключении диска пользователя: {e}")
                await session.rollback()
                return False
    
    async def test_user_disk_access(self, telegram_id: int) -> bool:
        """Тестирует доступ к Яндекс.Диску пользователя."""
        access_token = await self.ensure_valid_user_tokens(telegram_id)
        if not access_token:
            return False
        
        headers = {
            'Authorization': f'OAuth {access_token}',
            'Content-Type': 'application/json'
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.api_url,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Доступ к диску работает для пользователя {telegram_id}")
                    return True
                else:
                    logger.error(f"❌ Ошибка доступа к диску для пользователя {telegram_id}: {response.status_code}")
                    return False
                    
            except Exception as e:
                logger.error(f"❌ Ошибка тестирования доступа к диску: {e}")
                return False


# Глобальный экземпляр сервиса
user_oauth_service = UserOAuthService() 