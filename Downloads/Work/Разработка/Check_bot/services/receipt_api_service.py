import aiohttp
import asyncio
import json
from typing import Optional, Dict, Any
from datetime import datetime
from loguru import logger
from config import Settings

settings = Settings()


class ReceiptAPIService:
    """Сервис для работы с API proverkacheka.com"""
    
    BASE_URL = "https://proverkacheka.com/api/v1"
    
    def __init__(self):
        self.token = settings.PROVERKACHEKA_TOKEN
    
    async def get_receipt_data(self, receipt_params: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """
        Получение данных чека через API proverkacheka.com
        
        Args:
            receipt_params: Параметры чека из QR кода
            
        Returns:
            Словарь с данными чека или None при ошибке
        """
        try:
            receipt_type = receipt_params.get('type', 'fiscal_params')
            
            if receipt_type == 'self_employed':
                # Чек самозанятого - пробуем передать URL как qrraw
                logger.info("Обрабатываем чек самозанятого")
                form_data = {
                    'token': self.token,
                    'qrraw': receipt_params['original_data']
                }
            else:
                # Фискальный чек - используем qrraw с исходными данными
                logger.info("Обрабатываем фискальный чек")
                form_data = {
                    'token': self.token,
                    'qrraw': receipt_params['original_data']
                }
            
            logger.info(f"Запрос к API proverkacheka.com с параметрами: {form_data}")
            
            async with aiohttp.ClientSession() as session:
                # Делаем POST запрос с form-data
                async with session.post(
                    f"{self.BASE_URL}/check/get",
                    data=form_data,  # Используем data для form-urlencoded
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"Ответ API proverkacheka.com: {data}")
                        
                        if data.get('code') == 1:
                            # Успешный ответ
                            receipt_data = data.get('data', {})
                            logger.info("Данные чека успешно получены от API")
                            return self._parse_receipt_data(receipt_data, receipt_type)
                        
                        elif data.get('code') == 2:
                            # Чек в обработке, нужно подождать
                            logger.info("Чек в обработке, ожидаем...")
                            await asyncio.sleep(3)
                            return await self.get_receipt_data(receipt_params)
                        
                        else:
                            error_msg = data.get('message', data.get('data', 'Неизвестная ошибка'))
                            logger.error(f"Ошибка API: код {data.get('code')}, сообщение: {error_msg}")
                            
                            # Для чеков самозанятых API может не поддерживать
                            if receipt_type == 'self_employed':
                                logger.warning("API proverkacheka.com может не поддерживать чеки самозанятых")
                                # Возвращаем базовую информацию из URL
                                return self._parse_self_employed_url(receipt_params['url'])
                            
                            logger.error(f"Полный ответ API: {data}")
                            return None
                    
                    else:
                        error_text = await response.text()
                        logger.error(f"HTTP ошибка {response.status}: {error_text}")
                        return None
                        
        except asyncio.TimeoutError:
            logger.error("Таймаут при обращении к API proverkacheka.com")
            return None
        except Exception as e:
            logger.error(f"Ошибка при запросе к API proverkacheka.com: {e}")
            return None
    
    def _parse_receipt_data(self, receipt_data: Dict[str, Any], receipt_type: str) -> Dict[str, Any]:
        """
        Парсинг данных чека от API
        
        Args:
            receipt_data: Сырые данные чека от API
            receipt_type: Тип чека
            
        Returns:
            Обработанные данные чека
        """
        try:
            receipt = receipt_data.get('json', {})
            
            # Основная информация о чеке
            receipt_info = {
                'receipt_date': self._parse_datetime(receipt.get('dateTime')),
                'total_sum': float(receipt.get('totalSum', 0)) / 100,  # API возвращает в копейках
                'fiscal_number': receipt.get('fiscalDriveNumber'),
                'fiscal_document': receipt.get('fiscalDocumentNumber'),
                'fiscal_sign': receipt.get('fiscalSign'),
                'inn': receipt.get('userInn'),
                'organization_name': receipt.get('user', ''),
                'items': [],
                'type': receipt_type
            }
            
            # Парсим позиции чека
            items = receipt.get('items', [])
            for item in items:
                receipt_item = {
                    'name': item.get('name', ''),
                    'price': float(item.get('price', 0)) / 100,  # В копейках
                    'quantity': float(item.get('quantity', 1)),
                    'sum_amount': float(item.get('sum', 0)) / 100  # В копейках
                }
                receipt_info['items'].append(receipt_item)
            
            # Сохраняем полные данные для отладки (с JSON-сериализуемыми типами)
            receipt_info['raw_json'] = json.dumps(receipt_data, ensure_ascii=False, default=str)
            
            logger.info(f"Чек обработан: {len(receipt_info['items'])} позиций, сумма {receipt_info['total_sum']}")
            return receipt_info
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге данных чека: {e}")
            return None
    
    def _parse_self_employed_url(self, url: str) -> Dict[str, Any]:
        """
        Парсинг URL чека самозанятого
        
        Args:
            url: URL чека самозанятого
            
        Returns:
            Базовая информация о чеке
        """
        try:
            # URL формат: https://lknpd.nalog.ru/api/v1/receipt/614199204300/200jz2t40g/print
            parts = url.split('/')
            
            if len(parts) >= 7:
                inn = parts[6]  # ИНН самозанятого
                receipt_id = parts[7] if len(parts) > 7 else None
                
                logger.info(f"Извлекли из URL чека самозанятого: ИНН={inn}, ID={receipt_id}")
                
                # Пытаемся определить тип услуги по ИНН (если есть в базе)
                organization_name = f'Самозанятый ИНН {inn}'
                
                # Для некоторых ИНН можем определить вид деятельности
                if inn == '614199204300':
                    organization_name = 'ПОНОМАРЕВ АЛЕКСЕЙ АЛЕКСЕЕВИЧ (самозанятый)'
                
                return {
                    'receipt_date': None,
                    'total_sum': None,  # Не можем определить из URL
                    'fiscal_number': None,
                    'fiscal_document': None,
                    'fiscal_sign': None,
                    'inn': inn,
                    'organization_name': organization_name,
                    'items': [],
                    'raw_json': json.dumps({
                        'self_employed_url': url,
                        'inn': inn,
                        'receipt_id': receipt_id,
                        'note': 'Чек самозанятого. Полные данные доступны только в приложении "Мой налог"'
                    }, ensure_ascii=False),
                    'type': 'self_employed'
                }
            else:
                logger.error(f"Неожиданный формат URL чека самозанятого: {url}")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка при парсинге URL чека самозанятого: {e}")
            return None
    
    def _parse_datetime(self, datetime_str: str) -> Optional[datetime]:
        """
        Парсинг даты и времени из строки
        
        Args:
            datetime_str: Строка с датой и временем
            
        Returns:
            Объект datetime или None
        """
        if not datetime_str:
            return None
        
        try:
            # Формат: "2025-06-21T14:25:00"
            return datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            try:
                # Альтернативный формат: "20250621T1425"
                return datetime.strptime(datetime_str, "%Y%m%dT%H%M")
            except ValueError:
                logger.warning(f"Не удалось распарсить дату: {datetime_str}")
                return None

    async def get_receipt_data_from_qr(self, qr_data: str) -> Dict[str, Any]:
        """
        Получение данных чека напрямую из QR строки
        
        Args:
            qr_data: Строка QR кода
            
        Returns:
            Словарь с результатом
        """
        try:
            # Определяем тип чека и создаем параметры
            if 'lknpd.nalog.ru' in qr_data:
                receipt_params = {
                    'type': 'self_employed',
                    'url': qr_data,
                    'original_data': qr_data
                }
            else:
                receipt_params = {
                    'type': 'fiscal',
                    'original_data': qr_data
                }
            
            # Получаем данные чека
            receipt_data = await self.get_receipt_data(receipt_params)
            
            if receipt_data:
                # Для чеков самозанятых проверяем полноту данных
                if receipt_params.get('type') == 'self_employed':
                    if receipt_data.get('receipt_date') is None or receipt_data.get('total_sum') is None:
                        logger.warning("Данные чека самозанятого неполные, требуется OCR обработка")
                        return {
                            'success': False,
                            'error': 'Неполные данные чека самозанятого из API',
                            'partial_data': receipt_data  # Сохраняем ИНН и организацию
                        }
                
                return {
                    'success': True,
                    'data': receipt_data
                }
            else:
                return {
                    'success': False,
                    'error': 'Не удалось получить данные чека через API'
                }
                
        except Exception as e:
            logger.error(f"Ошибка при получении данных чека: {e}")
            return {
                'success': False,
                'error': str(e)
            }


# Глобальный экземпляр сервиса
receipt_api_service = ReceiptAPIService() 