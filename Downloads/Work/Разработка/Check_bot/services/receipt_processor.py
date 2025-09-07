"""
Основной сервис для обработки чеков
"""
import logging
import tempfile
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from io import BytesIO

from services.qr_service import qr_service
from services.receipt_api_service import receipt_api_service
from services.user_cloud_storage_service import user_cloud_storage_service
from models import User, Receipt, ReceiptItem
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)


def json_serialize_datetime(obj):
    """Функция для сериализации datetime объектов в JSON"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class ReceiptProcessor:
    """Основной класс для обработки чеков"""
    
    def __init__(self, user_id: int, db: AsyncSession):
        self.user_id = user_id
        self.db = db
    
    async def process_receipt_photo(self, photo_data: bytes, telegram_user) -> Dict[str, Any]:
        """
        Обработка фото чека
        
        Returns:
            Dict с результатами обработки
        """
        try:
            # Сохраняем фото во временный файл
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                temp_file.write(photo_data)
                temp_photo_path = temp_file.name
            
            try:
                # 1. Распознаём QR код
                logger.info(f"Начинаю обработку чека для пользователя {self.user_id}")
                qr_result = await qr_service.extract_qr_from_image(temp_photo_path)
                
                if not qr_result['success']:
                    return {
                        'success': False,
                        'error': f"QR код не найден: {qr_result.get('error', 'Неизвестная ошибка')}"
                    }
                
                qr_data = qr_result['qr_data']
                logger.info(f"QR код найден: {qr_data}")
                
                # 2. Получаем данные чека через API
                receipt_result = await receipt_api_service.get_receipt_data_from_qr(qr_data)
                
                if not receipt_result['success']:
                    # Если не удалось получить данные через API, пробуем OCR для самозанятых
                    if 'lknpd.nalog.ru' in qr_data:
                        logger.info("Обнаружен чек самозанятого, извлекаем данные из изображения")
                        
                        # Получаем частичные данные из API если есть
                        partial_data = receipt_result.get('partial_data', {})
                        
                        # Извлекаем ИНН из URL если не получили из API
                        inn = partial_data.get('inn')
                        organization_name = partial_data.get('organization_name')
                        
                        if not inn and '/receipt/' in qr_data:
                            try:
                                parts = qr_data.split('/receipt/')[1].split('/')
                                if len(parts) > 0:
                                    inn = parts[0]
                                    organization_name = f'Самозанятый ИНН {inn}'
                            except:
                                pass
                        
                        # Пробуем извлечь сумму и дату через OCR
                        ocr_result = await qr_service.extract_text_from_image_file(temp_photo_path)
                        
                        # Обрабатываем дату из OCR
                        receipt_date = None
                        if ocr_result.get('date'):
                            try:
                                # Пытаемся распарсить дату разными способами
                                date_str = ocr_result['date']
                                time_str = ocr_result.get('time', '00:00')
                                
                                # Объединяем дату и время
                                if '.' in date_str:
                                    # Формат 23.06.2025
                                    if ':' in time_str and len(time_str.split(':')) == 3:
                                        # Время с секундами: 11:09:30
                                        datetime_str = f"{date_str} {time_str}"
                                        receipt_date = datetime.strptime(datetime_str, '%d.%m.%Y %H:%M:%S')
                                    elif ':' in time_str:
                                        # Время без секунд: 11:09
                                        datetime_str = f"{date_str} {time_str}"
                                        receipt_date = datetime.strptime(datetime_str, '%d.%m.%Y %H:%M')
                                    else:
                                        # Только дата
                                        receipt_date = datetime.strptime(date_str, '%d.%m.%Y')
                                elif '-' in date_str:
                                    # Формат 2025-06-23
                                    if ':' in time_str:
                                        datetime_str = f"{date_str} {time_str}"
                                        receipt_date = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
                                    else:
                                        receipt_date = datetime.strptime(date_str, '%Y-%m-%d')
                                else:
                                    # Если не удалось распарсить, используем текущую дату
                                    receipt_date = datetime.now()
                                
                                logger.info(f"Дата и время из OCR: {date_str} {time_str} -> {receipt_date}")
                                
                            except ValueError as e:
                                logger.warning(f"Не удалось распарсить дату/время из OCR: {ocr_result.get('date')} {ocr_result.get('time')} - {e}")
                                receipt_date = datetime.now()
                        else:
                            receipt_date = datetime.now()
                        
                        receipt_data = {
                            'receipt_date': receipt_date,
                            'total_sum': ocr_result.get('sum', 0),  # Используем 'sum' вместо 'amount'
                            'organization_name': organization_name or 'Самозанятый (НПД)',
                            'inn': inn,
                            'fiscal_number': 'НПД',
                            'fiscal_document': '',
                            'fiscal_sign': '',
                            'items': []
                        }
                    else:
                        return {
                            'success': False,
                            'error': f"Не удалось получить данные чека: {receipt_result.get('error', 'Неизвестная ошибка')}"
                        }
                else:
                    receipt_data = receipt_result['data']
                
                # 3. Сохраняем в базу данных
                receipt_record = await self._save_receipt_to_db(qr_data, receipt_data, telegram_user)
                
                # 4. Подготавливаем данные для загрузки
                user_name = f"{telegram_user.first_name or ''} {telegram_user.last_name or ''}".strip()
                if not user_name:
                    user_name = telegram_user.username or f"User_{telegram_user.id}"
                
                upload_data = receipt_data.copy()
                upload_data['user_name'] = user_name
                
                # 5. Загружаем файлы на Яндекс.Диск пользователя
                photo_path = None
                csv_path = None
                
                try:
                    # Загружаем фото
                    photo_path = await user_cloud_storage_service.upload_photo(
                        self.user_id, self.db, temp_photo_path, upload_data
                    )
                    
                    # Создаем и загружаем CSV
                    csv_path = await user_cloud_storage_service.create_and_upload_csv(
                        self.user_id, self.db, upload_data
                    )
                    
                    # Обновляем запись в БД с путями к файлам
                    if photo_path:
                        receipt_record.original_photo_path = photo_path
                    if csv_path:
                        receipt_record.csv_file_path = csv_path
                    
                    receipt_record.is_processed = True
                    await self.db.commit()
                    
                    logger.info(f"Файлы загружены: фото={photo_path}, csv={csv_path}")
                    
                except Exception as upload_error:
                    logger.error(f"Ошибка загрузки файлов: {upload_error}")
                    # Не возвращаем ошибку, так как основные данные обработаны
                
                # 6. Возвращаем результат
                return_result = {
                    'success': True,
                    'receipt_id': receipt_record.id,
                    'receipt_date': receipt_data['receipt_date'],
                    'total_sum': receipt_data['total_sum'],
                    'organization_name': receipt_data.get('organization_name'),
                    'fiscal_number': receipt_data.get('fiscal_number'),
                    'photo_path': photo_path,
                    'csv_path': csv_path
                }
                logger.info(f"🔍 DEBUG: receipt_data['total_sum'] = {receipt_data['total_sum']}")
                logger.info(f"🔍 DEBUG: return_result = {return_result}")
                return return_result
                
            finally:
                # Удаляем временный файл
                try:
                    os.unlink(temp_photo_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"Общая ошибка при обработке чека: {e}")
            return {
                'success': False,
                'error': f"Ошибка обработки: {str(e)}"
            }
    
    async def _save_receipt_to_db(self, qr_data: str, receipt_data: Dict[str, Any], telegram_user) -> Receipt:
        """Сохранение данных чека в базу данных"""
        try:
            # Подготавливаем данные для JSON поля, сериализуя datetime объекты
            receipt_json_data = json.loads(
                json.dumps(receipt_data, default=json_serialize_datetime, ensure_ascii=False)
            )
            
            # Создаем запись чека
            receipt = Receipt(
                user_id=self.user_id,
                qr_data=qr_data,
                receipt_date=receipt_data.get('receipt_date'),
                total_sum=receipt_data.get('total_sum', 0),
                fiscal_number=receipt_data.get('fiscal_number', ''),
                fiscal_document=receipt_data.get('fiscal_document', ''),
                fiscal_sign=receipt_data.get('fiscal_sign', ''),
                inn=receipt_data.get('inn', ''),
                organization_name=receipt_data.get('organization_name', ''),
                receipt_json=receipt_json_data,
                is_processed=False  # Пока не загружены файлы
            )
            
            self.db.add(receipt)
            await self.db.commit()
            await self.db.refresh(receipt)
            
            # Сохраняем позиции чека
            for item_data in receipt_data.get('items', []):
                receipt_item = ReceiptItem(
                    receipt_id=receipt.id,
                    name=item_data.get('name', ''),
                    price=item_data.get('price', 0),
                    quantity=item_data.get('quantity', 1),
                    sum_amount=item_data.get('sum_amount', item_data.get('sum', 0))
                )
                self.db.add(receipt_item)
            
            await self.db.commit()
            
            logger.info(f"Чек сохранен в БД с ID: {receipt.id}")
            return receipt
            
        except Exception as e:
            logger.error(f"Ошибка сохранения чека в БД: {e}")
            await self.db.rollback()
            raise
    
    async def get_user_receipts(self, limit: int = 10) -> list:
        """Получение последних чеков пользователя"""
        try:
            from sqlalchemy import desc
            
            result = await self.db.execute(
                select(Receipt)
                .where(Receipt.user_id == self.user_id)
                .order_by(desc(Receipt.created_at))
                .limit(limit)
            )
            receipts = result.scalars().all()
            
            return [
                {
                    'id': receipt.id,
                    'date': receipt.receipt_date.strftime('%d.%m.%Y %H:%M') if receipt.receipt_date else 'Неизвестно',
                    'sum': receipt.total_sum or 0,
                    'organization': receipt.organization_name or 'Неизвестно',
                    'is_processed': receipt.is_processed,
                    'error': receipt.processing_error
                }
                for receipt in receipts
            ]
            
        except Exception as e:
            logger.error(f"Ошибка при получении чеков пользователя: {e}")
            return []
    
    async def process_receipt_document(self, document_data: bytes, user: User, 
                                     filename: str) -> Optional[Receipt]:
        """
        Обработка документа (PDF) с чеком
        
        Args:
            document_data: Байты документа
            user: Пользователь
            filename: Имя файла
            
        Returns:
            Обработанный чек или None при ошибке
        """
        # Для PDF документов логика может отличаться
        # Пока используем ту же логику, что и для фото
        file_extension = filename.split('.')[-1].lower() if '.' in filename else 'pdf'
        
        if file_extension == 'pdf':
            # TODO: Добавить обработку PDF - извлечение изображений, конвертация и т.д.
            logger.warning("Обработка PDF файлов пока не реализована")
            return None
        
        # Если это изображение в виде документа
        return await self.process_receipt_photo(document_data, user)
    
    async def get_receipt_details(self, receipt_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Получение подробной информации о чеке
        
        Args:
            receipt_id: ID чека
            user_id: ID пользователя (для проверки доступа)
            
        Returns:
            Подробная информация о чеке
        """
        async with self.db as session:
            try:
                from sqlalchemy import select
                from sqlalchemy.orm import selectinload
                
                result = await session.execute(
                    select(Receipt)
                    .options(selectinload(Receipt.items))
                    .where(Receipt.id == receipt_id, Receipt.user_id == user_id)
                )
                receipt = result.scalar_one_or_none()
                
                if not receipt:
                    return None
                
                return {
                    'id': receipt.id,
                    'date': receipt.receipt_date.strftime('%d.%m.%Y %H:%M') if receipt.receipt_date else 'Неизвестно',
                    'sum': receipt.total_sum or 0,
                    'organization': receipt.organization_name or 'Неизвестно',
                    'inn': receipt.inn or 'Неизвестно',
                    'fiscal_number': receipt.fiscal_number or 'Неизвестно',
                    'fiscal_document': receipt.fiscal_document or 'Неизвестно',
                    'fiscal_sign': receipt.fiscal_sign or 'Неизвестно',
                    'is_processed': receipt.is_processed,
                    'error': receipt.processing_error,
                    'items': [
                        {
                            'name': item.name,
                            'price': item.price,
                            'quantity': item.quantity,
                            'sum': item.sum_amount
                        }
                        for item in receipt.items
                    ]
                }
                
            except Exception as e:
                logger.error(f"Ошибка при получении деталей чека: {e}")
                return None 