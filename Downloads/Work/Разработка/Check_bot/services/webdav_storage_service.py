import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, BinaryIO

import httpx
import pandas as pd
from loguru import logger

from config import settings


class WebDAVStorageService:
    """Сервис для работы с Яндекс.Диском через WebDAV протокол."""
    
    def __init__(self):
        self.token = settings.yandex_disk_token
        self.base_url = "https://webdav.yandex.ru"
        self.headers = {
            'Authorization': f'OAuth {self.token}',
        }
    
    async def _make_request(
        self, 
        method: str, 
        path: str, 
        extra_headers: dict = None,
        **kwargs
    ) -> Optional[httpx.Response]:
        """Выполняет HTTP запрос к WebDAV."""
        url = f"{self.base_url}/{path.lstrip('/')}"
        
        # Объединяем заголовки
        headers = self.headers.copy()
        if extra_headers:
            headers.update(extra_headers)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    timeout=30.0,
                    **kwargs
                )
                
                return response
                
            except Exception as e:
                logger.error(f"Ошибка при WebDAV запросе: {e}")
                return None
    
    async def create_folder(self, path: str) -> bool:
        """Создает папку через WebDAV."""
        try:
            response = await self._make_request('MKCOL', path)
            if response and response.status_code in [201, 405]:  # 201 - создана, 405 - уже существует
                logger.info(f"Папка создана/существует: {path}")
                return True
            else:
                logger.warning(f"Не удалось создать папку {path}: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            logger.error(f"Ошибка создания папки {path}: {e}")
            return False
    
    async def folder_exists(self, path: str) -> bool:
        """Проверяет существование папки через WebDAV."""
        try:
            response = await self._make_request('PROPFIND', path, extra_headers={'Depth': '0'})
            return response and response.status_code in [200, 207]
        except:
            return False
    
    async def ensure_folder_exists(self, path: str) -> bool:
        """Убеждается что папка существует, создает если нужно."""
        # Создаем родительские папки поэтапно
        parts = Path(path).parts
        current_path = ""
        
        for part in parts:
            current_path = f"{current_path}/{part}" if current_path else part
            if not await self.folder_exists(current_path):
                if not await self.create_folder(current_path):
                    logger.error(f"Не удалось создать папку: {current_path}")
                    return False
        
        return True
    
    async def upload_file(
        self, 
        file_content: bytes, 
        remote_path: str
    ) -> bool:
        """Загружает файл через WebDAV."""
        try:
            # Убеждаемся что папка существует
            folder_path = str(Path(remote_path).parent)
            if folder_path != '.' and folder_path != '/':
                await self.ensure_folder_exists(folder_path)
            
            # Загружаем файл
            response = await self._make_request(
                'PUT', 
                remote_path,
                content=file_content
            )
            
            if response and response.status_code in [200, 201, 204]:
                logger.info(f"Файл успешно загружен: {remote_path}")
                return True
            else:
                logger.error(f"Ошибка загрузки файла {remote_path}: {response.status_code if response else 'No response'}")
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
        
        success = await self.upload_file(photo_data, file_path)
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
        
        success = await self.upload_file(json_bytes, file_path)
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
                    'Общая сумма': receipt.get('totalSum', 0)
                }
                
                # Добавляем позиции чека
                items = receipt.get('items', [])
                if items:
                    for i, item in enumerate(items, 1):
                        row = base_info.copy()
                        row.update({
                            'Позиция': i,
                            'Наименование': item.get('name', ''),
                            'Цена': item.get('price', 0),
                            'Количество': item.get('quantity', 0),
                            'Сумма позиции': item.get('sum_amount', 0)
                        })
                        csv_data.append(row)
                else:
                    # Если нет позиций, добавляем базовую информацию
                    csv_data.append(base_info)
            
            # Создаем CSV
            df = pd.DataFrame(csv_data)
            csv_content = df.to_csv(index=False, encoding='utf-8')
            csv_bytes = csv_content.encode('utf-8')
            
            # Сохраняем CSV файл
            file_path = f"/{year}/{month:02d}/{user_name}/receipts_{year}_{month:02d}.csv"
            success = await self.upload_file(csv_bytes, file_path)
            
            return file_path if success else None
            
        except Exception as e:
            logger.error(f"Ошибка при создании CSV: {e}")
            return None
    
    async def test_connection(self) -> bool:
        """Тестирует подключение к WebDAV."""
        try:
            response = await self._make_request('PROPFIND', '/', extra_headers={'Depth': '0'})
            if response and response.status_code in [200, 207]:
                logger.info("✅ WebDAV подключение работает!")
                return True
            else:
                logger.error(f"❌ WebDAV не работает: {response.status_code if response else 'No response'}")
                return False
        except Exception as e:
            logger.error(f"❌ Ошибка WebDAV подключения: {e}")
            return False 