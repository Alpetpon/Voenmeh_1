"""
Сервис для работы с персональными Яндекс.Дисками пользователей
"""
import logging
import os
import csv
import tempfile
from datetime import datetime
from typing import Optional, Dict, Any
from io import StringIO

import httpx
import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import User
from config import Settings

logger = logging.getLogger(__name__)


class UserCloudStorageService:
    """Сервис для работы с персональными Яндекс.Дисками пользователей"""
    
    def __init__(self):
        self.settings = Settings()
        self.base_api_url = "https://cloud-api.yandex.net/v1/disk"
    
    async def get_user_token(self, user_id: int, db: AsyncSession) -> Optional[str]:
        """Получение актуального токена пользователя"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user or not user.yandex_disk_connected:
                return None
            
            # Проверяем, не истек ли токен
            if user.yandex_token_expires_at and user.yandex_token_expires_at < datetime.utcnow():
                # Здесь можно добавить логику обновления токена через refresh_token
                logger.warning(f"Токен пользователя {user_id} истек")
                return None
            
            return user.yandex_access_token
            
        except Exception as e:
            logger.error(f"Ошибка получения токена пользователя {user_id}: {e}")
            return None
    
    async def create_folder_structure(self, user_id: int, db: AsyncSession, year: int, month: int, user_name: str) -> bool:
        """Создание структуры папок на диске пользователя"""
        try:
            token = await self.get_user_token(user_id, db)
            if not token:
                logger.error(f"Нет токена для пользователя {user_id}")
                return False
            
            # Создаем иерархию папок
            folders = [
                "/Авточеки",
                f"/Авточеки/{year}",
                f"/Авточеки/{year}/{month:02d}",
                f"/Авточеки/{year}/{month:02d}/{user_name}"
            ]
            
            headers = {"Authorization": f"OAuth {token}"}
            
            async with httpx.AsyncClient() as client:
                for folder_path in folders:
                    try:
                        # Проверяем существование папки
                        check_url = f"{self.base_api_url}/resources"
                        check_response = await client.get(
                            check_url,
                            headers=headers,
                            params={"path": folder_path}
                        )
                        
                        if check_response.status_code == 404:
                            # Папка не существует, создаем
                            create_url = f"{self.base_api_url}/resources"
                            create_response = await client.put(
                                create_url,
                                headers=headers,
                                params={"path": folder_path}
                            )
                            
                            if create_response.status_code not in [201, 409]:  # 409 - уже существует
                                logger.error(f"Ошибка создания папки {folder_path}: {create_response.status_code}")
                                return False
                            
                            logger.info(f"Создана папка: {folder_path}")
                        
                    except Exception as e:
                        logger.error(f"Ошибка при работе с папкой {folder_path}: {e}")
                        continue
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка создания структуры папок для пользователя {user_id}: {e}")
            return False
    
    async def upload_file(self, user_id: int, db: AsyncSession, file_path: str, file_content: bytes, folder_path: str) -> Optional[str]:
        """Загрузка файла на диск пользователя"""
        try:
            token = await self.get_user_token(user_id, db)
            if not token:
                logger.error(f"Нет токена для пользователя {user_id}")
                return None
            
            headers = {"Authorization": f"OAuth {token}"}
            full_path = f"{folder_path}/{file_path}"
            
            async with httpx.AsyncClient() as client:
                # Получаем ссылку для загрузки
                upload_url_response = await client.get(
                    f"{self.base_api_url}/resources/upload",
                    headers=headers,
                    params={"path": full_path, "overwrite": "true"}
                )
                
                if upload_url_response.status_code != 200:
                    logger.error(f"Ошибка получения ссылки для загрузки: {upload_url_response.status_code}")
                    return None
                
                upload_data = upload_url_response.json()
                upload_url = upload_data.get("href")
                
                if not upload_url:
                    logger.error("Не получена ссылка для загрузки")
                    return None
                
                # Загружаем файл
                upload_response = await client.put(upload_url, content=file_content)
                
                if upload_response.status_code not in [201, 202]:
                    logger.error(f"Ошибка загрузки файла: {upload_response.status_code}")
                    return None
                
                logger.info(f"Файл {file_path} загружен в {full_path}")
                return full_path
                
        except Exception as e:
            logger.error(f"Ошибка загрузки файла {file_path} для пользователя {user_id}: {e}")
            return None
    
    async def upload_photo(self, user_id: int, db: AsyncSession, photo_path: str, receipt_data: Dict[str, Any]) -> Optional[str]:
        """Загрузка фото чека"""
        try:
            # Читаем файл
            async with aiofiles.open(photo_path, 'rb') as f:
                photo_content = await f.read()
            
            # Формируем путь с проверкой на None дату
            receipt_date = receipt_data.get('receipt_date')
            if receipt_date is None:
                receipt_date = datetime.now()
                logger.warning(f"Дата чека не определена, используем текущую дату: {receipt_date}")
            
            year = receipt_date.year
            month = receipt_date.month
            user_name = receipt_data.get('user_name', 'Unknown')
            
            # Создаем структуру папок
            await self.create_folder_structure(user_id, db, year, month, user_name)
            
            folder_path = f"/Авточеки/{year}/{month:02d}/{user_name}"
            filename = f"receipt_{receipt_data.get('fiscal_number', 'unknown')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            
            return await self.upload_file(user_id, db, filename, photo_content, folder_path)
            
        except Exception as e:
            logger.error(f"Ошибка загрузки фото для пользователя {user_id}: {e}")
            return None
    
    async def create_and_upload_csv(self, user_id: int, db: AsyncSession, receipt_data: Dict[str, Any]) -> Optional[str]:
        """Создание и загрузка CSV файла с данными чека"""
        try:
            # Создаем CSV в памяти
            csv_content = StringIO()
            writer = csv.writer(csv_content, delimiter=';', quoting=csv.QUOTE_ALL)
            
            # Заголовки
            writer.writerow([
                'Дата', 'Время', 'Магазин', 'ИНН', 'Сумма', 
                'ФН', 'ФД', 'ФП', 'Название товара', 'Цена', 'Количество', 'Сумма позиции'
            ])
            
            # Данные чека с проверкой на None дату
            receipt_date = receipt_data.get('receipt_date')
            if receipt_date is None:
                receipt_date = datetime.now()
                logger.warning(f"Дата чека не определена, используем текущую дату: {receipt_date}")
            
            items = receipt_data.get('items', [])
            
            if not items:
                # Если нет позиций, создаем одну строку с общей суммой
                writer.writerow([
                    receipt_date.strftime('%Y-%m-%d'),
                    receipt_date.strftime('%H:%M:%S'),
                    receipt_data.get('organization_name', ''),
                    receipt_data.get('inn', ''),
                    receipt_data.get('total_sum', 0),
                    receipt_data.get('fiscal_number', ''),
                    receipt_data.get('fiscal_document', ''),
                    receipt_data.get('fiscal_sign', ''),
                    'Общая сумма',
                    receipt_data.get('total_sum', 0),
                    1,
                    receipt_data.get('total_sum', 0)
                ])
            else:
                # Записываем каждую позицию
                for item in items:
                    writer.writerow([
                        receipt_date.strftime('%Y-%m-%d'),
                        receipt_date.strftime('%H:%M:%S'),
                        receipt_data.get('organization_name', ''),
                        receipt_data.get('inn', ''),
                        receipt_data.get('total_sum', 0),
                        receipt_data.get('fiscal_number', ''),
                        receipt_data.get('fiscal_document', ''),
                        receipt_data.get('fiscal_sign', ''),
                        item.get('name', ''),
                        item.get('price', 0),
                        item.get('quantity', 1),
                        item.get('sum', 0)
                    ])
            
            csv_bytes = csv_content.getvalue().encode('utf-8')
            csv_content.close()
            
            # Формируем путь
            year = receipt_date.year
            month = receipt_date.month
            user_name = receipt_data.get('user_name', 'Unknown')
            
            folder_path = f"/Авточеки/{year}/{month:02d}/{user_name}"
            filename = f"receipt_{receipt_data.get('fiscal_number', 'unknown')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
            return await self.upload_file(user_id, db, filename, csv_bytes, folder_path)
            
        except Exception as e:
            logger.error(f"Ошибка создания CSV для пользователя {user_id}: {e}")
            return None
    
    async def get_disk_info(self, user_id: int, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Получение информации о диске пользователя"""
        try:
            token = await self.get_user_token(user_id, db)
            if not token:
                return None
            
            headers = {"Authorization": f"OAuth {token}"}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_api_url}", headers=headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Ошибка получения информации о диске: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Ошибка получения информации о диске пользователя {user_id}: {e}")
            return None


# Глобальный экземпляр сервиса
user_cloud_storage_service = UserCloudStorageService() 