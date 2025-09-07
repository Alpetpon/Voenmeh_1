import cv2
import numpy as np
from pyzbar import pyzbar
from PIL import Image
import io
from typing import Optional, List, Dict, Any
from loguru import logger
from urllib.parse import urlparse, parse_qs
import re

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract не установлен. OCR функции недоступны.")


class QRService:
    """Сервис для распознавания QR кодов с изображений"""
    
    @staticmethod
    def decode_qr_from_bytes(image_data: bytes) -> Optional[str]:
        """
        Распознавание QR кода из байтов изображения
        
        Args:
            image_data: Байты изображения
            
        Returns:
            Строка с данными QR кода или None если не найден
        """
        try:
            # Преобразование байтов в изображение PIL
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Конвертация в RGB если нужно
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Конвертация PIL в OpenCV формат
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # Попытка распознать QR коды
            qr_codes = pyzbar.decode(opencv_image)
            
            if qr_codes:
                # Возвращаем данные первого найденного QR кода
                qr_data = qr_codes[0].data.decode('utf-8')
                logger.info(f"QR код распознан: {qr_data[:100]}...")
                return qr_data
            
            # Если QR не найден, попробуем различные преобразования
            return QRService._try_image_enhancements(opencv_image)
            
        except Exception as e:
            logger.error(f"Ошибка при распознавании QR кода: {e}")
            return None
    
    @staticmethod
    def _try_image_enhancements(image: np.ndarray) -> Optional[str]:
        """
        Попытка улучшить изображение для лучшего распознавания QR кода
        
        Args:
            image: Изображение в формате OpenCV
            
        Returns:
            Строка с данными QR кода или None
        """
        try:
            # Конвертация в градации серого
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Различные методы улучшения изображения
            enhancements = [
                gray,  # Обычное серое изображение
                cv2.GaussianBlur(gray, (5, 5), 0),  # Размытие по Гауссу
                cv2.medianBlur(gray, 5),  # Медианное размытие
                cv2.bilateralFilter(gray, 9, 75, 75),  # Билатеральный фильтр
                cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2),  # Адаптивная пороговая обработка
                cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                    cv2.THRESH_BINARY, 11, 2),
            ]
            
            for enhanced_image in enhancements:
                qr_codes = pyzbar.decode(enhanced_image)
                if qr_codes:
                    qr_data = qr_codes[0].data.decode('utf-8')
                    logger.info(f"QR код найден после улучшения: {qr_data[:100]}...")
                    return qr_data
            
            # Попробуем разные масштабы
            for scale in [0.5, 1.5, 2.0]:
                resized = cv2.resize(gray, None, fx=scale, fy=scale, 
                                   interpolation=cv2.INTER_CUBIC)
                qr_codes = pyzbar.decode(resized)
                if qr_codes:
                    qr_data = qr_codes[0].data.decode('utf-8')
                    logger.info(f"QR код найден при масштабе {scale}: {qr_data[:100]}...")
                    return qr_data
            
            logger.warning("QR код не найден даже после улучшений изображения")
            return None
            
        except Exception as e:
            logger.error(f"Ошибка при улучшении изображения: {e}")
            return None
    
    def extract_receipt_params(self, qr_data: str) -> Optional[Dict[str, str]]:
        """
        Извлечение параметров чека из QR кода
        
        Args:
            qr_data: Данные QR кода
            
        Returns:
            Словарь параметров чека или None при ошибке
        """
        try:
            logger.info(f"Обрабатываем QR код: {qr_data[:100]}...")
            
            # Проверяем тип чека
            if qr_data.startswith('https://lknpd.nalog.ru'):
                # Чек самозанятого
                logger.info("Обнаружен чек самозанятого (lknpd.nalog.ru)")
                return {
                    'type': 'self_employed',
                    'url': qr_data,
                    'original_data': qr_data
                }
            
            elif 'ofd.ru' in qr_data or 'nalog.ru' in qr_data:
                # URL формат обычного фискального чека
                logger.info("Обнаружен URL формат фискального чека")
                parsed_url = urlparse(qr_data)
                params = parse_qs(parsed_url.query)
                
                if all(key in params for key in ['t', 's', 'fn', 'i', 'fp']):
                    return {
                        'type': 'fiscal_url',
                        'datetime': params['t'][0],
                        'sum': params['s'][0],
                        'fn': params['fn'][0],
                        'fd': params['i'][0],
                        'fp': params['fp'][0],
                        'n': params.get('n', ['1'])[0],
                        'original_data': qr_data
                    }
                else:
                    logger.warning("URL не содержит всех необходимых параметров чека")
                    return None
            
            else:
                # Обычный формат строки параметров
                logger.info("Обрабатываем строку параметров фискального чека")
                params = {}
                
                # Разбираем строку параметров
                for pair in qr_data.split('&'):
                    if '=' in pair:
                        key, value = pair.split('=', 1)
                        params[key] = value
                
                # Проверяем наличие обязательных параметров
                required_params = ['t', 's', 'fn', 'i', 'fp']
                missing_params = [param for param in required_params if param not in params]
                
                if missing_params:
                    logger.warning(f"QR код не содержит параметров чека: {missing_params}")
                    logger.info(f"Найденные параметры: {list(params.keys())}")
                    return None
                
                result = {
                    'type': 'fiscal_params',
                    'datetime': params['t'],
                    'sum': params['s'],
                    'fn': params['fn'],
                    'fd': params['i'],  # i = fiscal document number
                    'fp': params['fp'],
                    'n': params.get('n', '1'),
                    'original_data': qr_data
                }
                
                logger.info(f"Параметры чека извлечены: {result}")
                return result
                
        except Exception as e:
            logger.error(f"Ошибка при извлечении параметров чека: {e}")
            return None

    def extract_text_from_image(self, image_data: bytes) -> Optional[Dict[str, str]]:
        """
        Извлечение текста из изображения чека самозанятого с помощью OCR
        
        Args:
            image_data: Байты изображения
            
        Returns:
            Словарь с найденными данными или None
        """
        if not TESSERACT_AVAILABLE:
            logger.warning("OCR недоступен - pytesseract не установлен")
            return None
            
        try:
            # Загружаем изображение
            image = Image.open(io.BytesIO(image_data))
            
            # Конвертируем в OpenCV формат
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Улучшаем изображение для OCR
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # Увеличиваем контрастность
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            
            # Извлекаем текст
            text = pytesseract.image_to_string(enhanced, lang='rus+eng')
            logger.info(f"OCR извлеченный текст:\n{text}")
            
            # Ищем сумму и дату в тексте
            extracted_data = self._parse_receipt_text(text)
            
            if extracted_data:
                logger.info(f"Из OCR извлечены данные: {extracted_data}")
                return extracted_data
            else:
                logger.warning("OCR не смог найти сумму или дату в тексте")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка при OCR обработке: {e}")
            return None

    def _parse_receipt_text(self, text: str) -> Dict[str, Any]:
        """Парсинг текста чека для извлечения данных"""
        logger.info("Начинаем поиск суммы в тексте")
        
        # Улучшенные паттерны для поиска суммы (в порядке приоритета)
        sum_patterns = [
            # 0 - Наивысший приоритет: после "Итого/Всего/Сумма" - поддержка и русских и латинских символов
            (0, r'(?:итого|всего|сумма)[\s:]*(\d{1,3}(?:\s\d{3})*(?:[,.]?\d{0,2})?)\s*(?:₽|руб|р\.?|p|r\.?)', re.IGNORECASE),
            # 1 - Суммы с пробелами между разрядами (обычно крупные суммы)
            (1, r'(\d{1,3}(?:\s\d{3})+(?:[,.]?\d{0,2})?)\s*(?:₽|руб|р\.?|p|r\.?)', re.IGNORECASE),
            # 2 - Крупные суммы (4+ цифр подряд)
            (2, r'(\d{4,}(?:[,.]?\d{0,2})?)\s*(?:₽|руб|р\.?|p|r\.?)', re.IGNORECASE),
            # 3 - Любые суммы
            (3, r'(\d+(?:[,.]?\d{1,2})?)\s*(?:₽|руб|р\.?|p|r\.?)', re.IGNORECASE)
        ]
        
        found_amounts = []
        
        for priority, pattern, flags in sum_patterns:
            logger.info(f"Применяем паттерн {priority + 1}: {pattern}")
            matches = re.findall(pattern, text, flags)
            if matches:
                logger.info(f"Паттерн {priority + 1} нашел: {matches}")
                for match in matches:
                    try:
                        # Убираем пробелы и заменяем запятую на точку
                        clean_amount = match.replace(' ', '').replace(',', '.')
                        amount = float(clean_amount)
                        logger.info(f"Преобразована сумма: '{match}' -> {amount}")
                        
                        # Фильтруем слишком маленькие суммы если есть большие
                        if amount > 0:
                            found_amounts.append({
                                'amount': amount,
                                'priority': priority,
                                'original': match
                            })
                    except ValueError:
                        continue
        
        # Выбираем лучшую сумму
        result = {}
        if found_amounts:
            # Сначала фильтруем: если есть суммы > 100, игнорируем суммы < 10
            large_amounts = [a for a in found_amounts if a['amount'] >= 100]
            if large_amounts:
                # Исключаем мелкие суммы если есть крупные
                found_amounts = [a for a in found_amounts if a['amount'] >= 10]
            
            # Сортируем по приоритету, затем по размеру суммы
            best_amount = min(found_amounts, key=lambda x: (x['priority'], -x['amount']))
            result['sum'] = best_amount['amount']
            logger.info(f"🎯 Выбрана лучшая сумма: {best_amount['amount']} ₽ (из '{best_amount['original']}', приоритет {best_amount['priority']})")
        else:
            logger.warning("Сумма не найдена")

        # Поиск даты и времени вместе
        datetime_patterns = [
            # Дата и время вместе: 23.06.2025 11:09:30
            r'(\d{1,2}[./]\d{1,2}[./]\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?)',
            # Дата и время с разделителями: 23.06.2025 11:09:30(+03:00)
            r'(\d{1,2}[./]\d{1,2}[./]\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?)[^0-9]*',
        ]
        
        # Пытаемся найти дату и время вместе
        for pattern in datetime_patterns:
            match = re.search(pattern, text)
            if match:
                result['date'] = match.group(1)
                result['time'] = match.group(2)
                logger.info(f"Найдены дата и время вместе: {result['date']} {result['time']}")
                return result if result else None
        
        # Поиск только даты если дата+время не найдены
        date_patterns = [
            r'(\d{1,2}[./]\d{1,2}[./]\d{4})',  # 23.06.2025
            r'(\d{4}-\d{1,2}-\d{1,2})',      # 2025-06-23
            r'(\d{1,2}\s+\w+\s+\d{4})',      # 23 июня 2025
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                result['date'] = match.group(1)
                logger.info(f"Найдена дата: {result['date']}")
                break
        
        # Поиск времени отдельно
        time_patterns = [
            r'(\d{1,2}:\d{2}:\d{2})',  # 11:09:30
            r'(\d{1,2}:\d{2})',        # 11:09
        ]
        
        for pattern in time_patterns:
            time_match = re.search(pattern, text)
            if time_match:
                result['time'] = time_match.group(1)
                logger.info(f"Найдено время: {result['time']}")
                break
        
        return result if result else None

    # Асинхронные методы для совместимости
    async def extract_qr_from_image(self, image_path: str) -> Dict[str, any]:
        """
        Асинхронное извлечение QR кода из файла изображения
        
        Args:
            image_path: Путь к файлу изображения
            
        Returns:
            Словарь с результатом
        """
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            qr_data = self.decode_qr_from_bytes(image_data)
            
            if qr_data:
                return {
                    'success': True,
                    'qr_data': qr_data
                }
            else:
                return {
                    'success': False,
                    'error': 'QR код не найден на изображении'
                }
                
        except Exception as e:
            logger.error(f"Ошибка при извлечении QR из файла: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def extract_text_from_image_file(self, image_path: str) -> Dict[str, any]:
        """
        Асинхронное извлечение текста из файла изображения
        
        Args:
            image_path: Путь к файлу изображения
            
        Returns:
            Словарь с найденными данными
        """
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Вызываем синхронную версию с байтами
            ocr_result = self.extract_text_from_image(image_data)
            return ocr_result or {}
            
        except Exception as e:
            logger.error(f"Ошибка при OCR из файла: {e}")
            return {}


# Глобальный экземпляр сервиса
qr_service = QRService() 