import asyncio
import json
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from typing import Optional, Dict, Any
import urllib.parse

import httpx
import pandas as pd
from loguru import logger

from config import settings


class YandexDiskOAuthClient:
    """OAuth2 клиент для Yandex Disk API."""
    
    def __init__(self):
        self.client_id = settings.YANDEX_CLIENT_ID
        self.client_secret = settings.YANDEX_CLIENT_SECRET
        self.access_token = None  # Будет установлен при OAuth
        self.refresh_token = None  # Будет установлен при OAuth
        self.token_expires_at = None
        
        # API endpoints
        self.auth_url = "https://oauth.yandex.ru"
        self.api_url = "https://cloud-api.yandex.net/v1/disk"
        
    async def get_authorization_url(self, redirect_uri: str) -> str:
        """Генерирует URL для авторизации пользователя."""
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': 'cloud_api:disk.read cloud_api:disk.write',
            'force_confirm': 'yes'
        }
        
        query_string = urllib.parse.urlencode(params)
        return f"{self.auth_url}/authorize?{query_string}"
    
    async def exchange_code_for_tokens(self, auth_code: str, redirect_uri: str) -> Dict[str, Any]:
        """Обменивает authorization code на access и refresh токены."""
        
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
                
                # Сохраняем токены
                self.access_token = token_data['access_token']
                self.refresh_token = token_data.get('refresh_token')
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
                
                logger.info("✅ Токены успешно получены")
                return token_data
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP ошибка при обмене кода на токены: {e}")
                logger.error(f"Response: {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Ошибка при обмене кода на токены: {e}")
                raise
    
    async def refresh_access_token(self) -> bool:
        """Обновляет access token используя refresh token."""
        if not self.refresh_token:
            logger.error("Refresh token отсутствует")
            return False
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': self.refresh_token,
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
                
                # Обновляем токены
                self.access_token = token_data['access_token']
                if 'refresh_token' in token_data:
                    self.refresh_token = token_data['refresh_token']
                
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
                
                logger.info("✅ Access token обновлен")
                return True
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP ошибка при обновлении токена: {e}")
                logger.error(f"Response: {e.response.text}")
                return False
            except Exception as e:
                logger.error(f"Ошибка при обновлении токена: {e}")
                return False
    
    async def ensure_valid_token(self) -> bool:
        """Убеждается что access token валиден."""
        # Проверяем срок действия токена
        if (self.token_expires_at and 
            datetime.now() >= self.token_expires_at - timedelta(minutes=5)):
            logger.info("Токен истекает, обновляем...")
            return await self.refresh_access_token()
        
        return bool(self.access_token)
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Возвращает заголовки авторизации для API запросов."""
        return {
            'Authorization': f'OAuth {self.access_token}',
            'Content-Type': 'application/json'
        }


class CloudStorageService:
    """Сервис для работы с Яндекс.Диском через REST API."""
    
    def __init__(self):
        self.oauth_client = YandexDiskOAuthClient()
        self.api_url = self.oauth_client.api_url
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        **kwargs
    ) -> Optional[httpx.Response]:
        """Выполняет HTTP запрос к API Яндекс.Диска с автоматическим обновлением токена."""
        
        # Убеждаемся что токен валиден
        if not await self.oauth_client.ensure_valid_token():
            logger.error("Не удалось получить валидный токен")
            return None
        
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = self.oauth_client.get_auth_headers()
        
        # Обновляем headers если переданы дополнительные
        if 'headers' in kwargs:
            headers.update(kwargs.pop('headers'))
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    timeout=30.0,
                    **kwargs
                )
                
                # Логируем подробности запроса для отладки
                logger.debug(f"{method} {url} -> {response.status_code}")
                
                if response.status_code == 401:
                    # Пробуем обновить токен один раз
                    logger.warning("Получен 401, пробуем обновить токен")
                    if await self.oauth_client.refresh_access_token():
                        # Повторяем запрос с новым токеном
                        headers = self.oauth_client.get_auth_headers()
                        response = await client.request(
                            method=method,
                            url=url,
                            headers=headers,
                            timeout=30.0,
                            **kwargs
                        )
                        logger.debug(f"Повторный запрос: {method} {url} -> {response.status_code}")
                
                return response
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP ошибка при запросе к Яндекс.Диску: {e}")
                logger.error(f"Response: {e.response.text}")
                return None
            except Exception as e:
                logger.error(f"Ошибка при запросе к Яндекс.Диску: {e}")
                return None
    
    async def create_folder(self, path: str) -> bool:
        """Создает папку на Яндекс.Диске."""
        params = {'path': path}
        response = await self._make_request('PUT', 'resources', params=params)
        
        if response and response.status_code in [201, 409]:  # 201 - создана, 409 - уже существует
            logger.info(f"Папка создана/существует: {path}")
            return True
        
        if response:
            logger.error(f"Не удалось создать папку {path}: {response.status_code} - {response.text}")
        
        return False
    
    async def folder_exists(self, path: str) -> bool:
        """Проверяет существование папки на Яндекс.Диске."""
        params = {'path': path}
        response = await self._make_request('GET', 'resources', params=params)
        return response and response.status_code == 200
    
    async def ensure_folder_exists(self, path: str) -> bool:
        """Убеждается что папка существует, создает если нужно."""
        if await self.folder_exists(path):
            return True
        
        # Создаем родительские папки поэтапно
        parts = Path(path).parts
        current_path = ""
        
        for part in parts:
            current_path = f"{current_path}/{part}" if current_path else part
            if not await self.folder_exists(current_path):
                success = await self.create_folder(current_path)
                if not success:
                    logger.error(f"Не удалось создать папку: {current_path}")
                    return False
        
        return True
    
    async def get_upload_url(self, path: str, overwrite: bool = True) -> Optional[str]:
        """Получает URL для загрузки файла."""
        params = {
            'path': path,
            'overwrite': str(overwrite).lower()
        }
        
        response = await self._make_request('GET', 'resources/upload', params=params)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                return data.get('href')
            except:
                return None
        
        if response:
            logger.error(f"Не удалось получить upload URL для {path}: {response.status_code} - {response.text}")
        
        return None
    
    async def upload_file(
        self, 
        file_content: bytes, 
        remote_path: str,
        content_type: str = 'application/octet-stream'
    ) -> bool:
        """Загружает файл на Яндекс.Диск."""
        try:
            # Убеждаемся что папка существует
            folder_path = str(Path(remote_path).parent)
            if folder_path != '.' and folder_path != '/':
                await self.ensure_folder_exists(folder_path)
            
            # Получаем URL для загрузки
            upload_url = await self.get_upload_url(remote_path)
            if not upload_url:
                logger.error(f"Не удалось получить URL для загрузки: {remote_path}")
                return False
            
            # Загружаем файл напрямую по upload URL
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    upload_url,
                    content=file_content,
                    headers={'Content-Type': content_type},
                    timeout=60.0
                )
                
                if response.status_code in [200, 201, 204]:
                    logger.info(f"Файл успешно загружен: {remote_path}")
                    return True
                else:
                    logger.error(f"Ошибка загрузки файла {remote_path}: {response.status_code} - {response.text}")
                    return False
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке файла {remote_path}: {e}")
            return False
    
    async def save_receipt_photo(
        self, 
        photo_data: bytes, 
        user_name: str, 
        receipt_id: str
    ) -> Optional[str]:
        """Сохраняет фото чека."""
        now = datetime.now()
        folder_path = f"/{now.year}/{now.month:02d}/{user_name}"
        file_path = f"{folder_path}/{receipt_id}_photo.jpg"
        
        success = await self.upload_file(
            photo_data, 
            file_path, 
            content_type='image/jpeg'
        )
        
        return file_path if success else None
    
    async def save_receipt_json(
        self, 
        receipt_data: dict, 
        user_name: str, 
        receipt_id: str
    ) -> Optional[str]:
        """Сохраняет JSON данные чека."""
        now = datetime.now()
        folder_path = f"/{now.year}/{now.month:02d}/{user_name}"
        file_path = f"{folder_path}/{receipt_id}_data.json"
        
        json_content = json.dumps(receipt_data, ensure_ascii=False, indent=2)
        json_bytes = json_content.encode('utf-8')
        
        success = await self.upload_file(
            json_bytes, 
            file_path, 
            content_type='application/json'
        )
        
        return file_path if success else None
    
    async def create_csv_from_receipts(
        self, 
        receipts_data: list, 
        user_name: str, 
        year: int, 
        month: int
    ) -> Optional[str]:
        """Создает CSV файл из данных чеков."""
        try:
            # Подготавливаем данные для CSV
            csv_data = []
            for receipt in receipts_data:
                base_info = {
                    'Дата': receipt.get('date', ''),
                    'Время': receipt.get('time', ''),
                    'Магазин': receipt.get('retailPlace', ''),
                    'Кассир': receipt.get('operator', ''),
                    'Смена': receipt.get('shiftNumber', ''),
                    'Номер чека': receipt.get('fiscalDocumentNumber', ''),
                    'ФН': receipt.get('fiscalDriveNumber', ''),
                    'ФПД': receipt.get('fiscalSign', ''),
                    'Общая сумма': receipt.get('totalSum', 0) / 100 if receipt.get('totalSum') else 0
                }
                
                items = receipt.get('items', [])
                if items:
                    for item in items:
                        row = base_info.copy()
                        row.update({
                            'Товар': item.get('name', ''),
                            'Количество': item.get('quantity', 0),
                            'Цена': item.get('price', 0) / 100 if item.get('price') else 0,
                            'Сумма': item.get('sum', 0) / 100 if item.get('sum') else 0
                        })
                        csv_data.append(row)
                else:
                    csv_data.append(base_info)
            
            # Создаем DataFrame и CSV
            df = pd.DataFrame(csv_data)
            csv_buffer = BytesIO()
            df.to_csv(csv_buffer, index=False, encoding='utf-8-sig')
            csv_content = csv_buffer.getvalue()
            
            # Сохраняем CSV файл
            folder_path = f"/{year}/{month:02d}/{user_name}"
            file_path = f"{folder_path}/receipts_{year}_{month:02d}.csv"
            
            success = await self.upload_file(
                csv_content, 
                file_path, 
                content_type='text/csv'
            )
            
            return file_path if success else None
            
        except Exception as e:
            logger.error(f"Ошибка при создании CSV файла: {e}")
            return None
    
    async def get_download_url(self, path: str) -> Optional[str]:
        """Получает URL для скачивания файла."""
        params = {'path': path}
        response = await self._make_request('GET', 'resources/download', params=params)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                return data.get('href')
            except:
                return None
        
        return None
    
    async def download_file(self, path: str) -> Optional[bytes]:
        """Скачивает файл с Яндекс.Диска."""
        try:
            download_url = await self.get_download_url(path)
            if not download_url:
                return None
            
            async with httpx.AsyncClient() as client:
                response = await client.get(download_url, timeout=60.0)
                response.raise_for_status()
                return response.content
                
        except Exception as e:
            logger.error(f"Ошибка при скачивании файла {path}: {e}")
            return None
    
    async def list_files(self, path: str = "/") -> list:
        """Получает список файлов в папке."""
        params = {'path': path}
        response = await self._make_request('GET', 'resources', params=params)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                return data.get('items', [])
            except:
                return []
        
        return []
    
    async def test_connection(self) -> bool:
        """Тестирует подключение к API."""
        try:
            response = await self._make_request('GET', '')
            
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    total_space = data.get('total_space', 0) / (1024**3)
                    free_space = data.get('free_space', 0) / (1024**3)
                    
                    logger.info("✅ Yandex Disk API подключение работает!")
                    logger.info(f"📁 Общее место: {total_space:.1f} ГБ")
                    logger.info(f"🆓 Свободно: {free_space:.1f} ГБ")
                    return True
                except:
                    logger.error("Ошибка парсинга ответа API")
                    return False
            else:
                if response:
                    logger.error(f"❌ API не работает: {response.status_code} - {response.text}")
                else:
                    logger.error("❌ Нет ответа от API")
                return False
                
        except Exception as e:
            logger.error(f"❌ Ошибка тестирования API: {e}")
            return False


# Глобальный экземпляр сервиса
yandex_disk_service = CloudStorageService() 