#!/usr/bin/env python3
"""
Ручная синхронизация таблиц с проверкой результатов
"""

import asyncio
import sys
import os
from datetime import datetime
from loguru import logger

# Добавляем путь к модулям
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from sync_service.clients.mysql_client import MySQLClient
from sync_service.clients.sheets_client import GoogleSheetsClient
from sync_service.config.config_loader import ConfigLoader

# Настройка логирования
logger.add(
    "logs/manual_sync.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {name}:{function}:{line} - {message}",
    encoding="utf-8"
)

# Добавляем вывод в консоль
logger.add(
    sys.stdout,
    level="INFO",
    format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | <cyan>{message}</cyan>",
    colorize=True
)

# Таблицы для синхронизации (в порядке приоритета)
TABLES_TO_SYNC = [
    # WB таблицы
    ('voronka_wb', 'wb_voronka', 3000),
    ('price_wb', 'wb_price', 1000),
    ('tovar_wb', 'wb_tovar', 800),
    ('stock_wb', 'wb_sklad', 2000),
    ('priem_wb', 'wb_priem', 100),
    ('detaliz_wb', 'wb_detaliz', 1000),  # Кардинально уменьшили до 1000
    
    # OZON таблицы
    ('detaliz_ozon', 'ozon_detaliz', 1000),  # Кардинально уменьшили до 1000
    ('reklam_ozon', 'ozon_reklam', 800),
    ('tovar_ozon', 'ozon_tovar', 800),
    ('price_ozon', 'ozon_price', 800),
    ('voronka_ozon', 'ozon_voronka', 3000),  # Уменьшили до 3000
    ('zakfbo_ozon', 'ozon_zakfbo', 1000),
    ('prodfbo_ozon', 'ozon_prodfbo', 1000),
    ('zakfbs_ozon', 'ozon_zakfbs', 1000),
    ('prodfbs_ozon', 'ozon_prodfbs', 1000),
]

async def update_tech_sync_status(sheets_client, client_id, table_name, exported_from_db=True):
    """Обновляет статус синхронизации в tech таблице"""
    logger.info(f"Обновление статуса tech для клиента {client_id}, таблица {table_name}, exported_from_db={exported_from_db}")
    
    try:
        # Получаем данные из tech таблицы
        logger.debug("Получение данных из tech таблицы")
        tech_data = await sheets_client.get_sheet_data('tech')
        
        if not tech_data:
            logger.warning("Tech table is empty")
            print("  ⚠️ Tech table is empty")
            return False
        
        logger.debug(f"Получено {len(tech_data)} строк из tech таблицы")
        
        # Ищем строку для обновления
        row_to_update = None
        row_index = None
        
        for i, row in enumerate(tech_data[1:], start=2):  # Начинаем с 2 (пропускаем заголовок)
            if len(row) >= 3 and row[0] == client_id and row[2] == table_name:
                row_to_update = row
                row_index = i
                logger.debug(f"Найдена строка для обновления: строка {row_index}, данные: {row}")
                break
        
        if not row_to_update:
            logger.warning(f"No row found in tech table for client {client_id}, table {table_name}")
            print(f"  ⚠️ No row found in tech table for client {client_id}, table {table_name}")
            return False
        
        # Создаем обновленную строку
        updated_row = list(row_to_update)
        
        # Дополняем строку до 7 элементов если нужно
        while len(updated_row) < 7:
            updated_row.append('')
        
        # Обновляем колонку "Выгружено из базы" (индекс 6)
        old_value = updated_row[6] if len(updated_row) > 6 else ''
        updated_row[6] = str(exported_from_db).upper()
        
        logger.debug(f"Обновление значения с '{old_value}' на '{updated_row[6]}'")
        
        # Записываем обновленную строку
        range_name = f"A{row_index}:G{row_index}"
        logger.debug(f"Запись в диапазон {range_name}")
        await sheets_client.update_sheet_data('tech', range_name, [updated_row])
        
        logger.info(f"Статус tech обновлен успешно: {table_name} exported_from_db={exported_from_db}")
        print(f"  ✅ Updated tech status: {table_name} exported_from_db={exported_from_db}")
        return True
        
    except Exception as e:
        logger.error(f"Ошибка обновления статуса tech: {e}")
        print(f"  ❌ Error updating tech sync status: {e}")
        return False


async def ensure_sheet_exists(sheets_client, sheet_name):
    """Проверяет и создает лист если его нет"""
    logger.info(f"Проверка существования листа: {sheet_name}")
    
    try:
        sheet_exists = await sheets_client.sheet_exists(sheet_name)
        logger.debug(f"Лист {sheet_name} существует: {sheet_exists}")
        
        if not sheet_exists:
            logger.info(f"Создание недостающего листа: {sheet_name}")
            print(f"  ➕ Создаю недостающий лист: {sheet_name}")
            
            await sheets_client.create_sheet(sheet_name)
            logger.debug(f"Лист {sheet_name} создан")
            
            # Увеличиваем размер листа
            logger.debug(f"Увеличение размера листа {sheet_name} до 20000x30")
            await sheets_client.resize_sheet(sheet_name, rows=20000, cols=30)
            
            logger.info(f"Лист {sheet_name} создан и увеличен успешно")
            print(f"  ✅ Лист {sheet_name} создан и увеличен")
        else:
            logger.debug(f"Лист {sheet_name} уже существует")
            print(f"  ℹ️ Лист {sheet_name} существует")
            
    except Exception as e:
        logger.error(f"Ошибка создания листа {sheet_name}: {e}")
        print(f"  ❌ Ошибка создания листа {sheet_name}: {e}")
        raise


async def sync_single_table(mysql_client, sheets_client, mysql_table, sheet_name, max_records, main_sheets_client):
    """Синхронизирует одну таблицу с подробной проверкой"""
    
    logger.info(f"Начало синхронизации: {mysql_table} -> {sheet_name} (макс. {max_records} записей)")
    print(f"\n{'='*60}")
    print(f"🔄 СИНХРОНИЗАЦИЯ: {mysql_table} -> {sheet_name}")
    print(f"{'='*60}")
    
    try:
        # СНАЧАЛА проверяем и создаем лист если нужно
        logger.debug(f"Проверка/создание листа {sheet_name}")
        await ensure_sheet_exists(sheets_client, sheet_name)
        
        # 1. Получаем данные из БД
        logger.info(f"Шаг 1: Получение данных из MySQL таблицы {mysql_table}")
        print(f"📊 Шаг 1: Получаю данные из {mysql_table}...")
        
        query = f'SELECT * FROM {mysql_table} ORDER BY id LIMIT {max_records}'
        logger.debug(f"Выполнение SQL запроса: {query}")
        
        data = await mysql_client.fetch_all(query)
        logger.info(f"Получено из БД: {len(data)} записей")
        print(f"   Получено из БД: {len(data)} записей")
        
        if not data:
            logger.warning(f"Нет данных в БД {mysql_table} - пропускаю")
            print("   ⚠️ Нет данных в БД - пропускаю")
            return False
        
        # 2. Подготавливаем данные
        logger.info(f"Шаг 2: Подготовка данных для записи в Google Sheets")
        print(f"📝 Шаг 2: Подготавливаю данные...")
        
        headers = list(data[0].keys())
        logger.debug(f"Заголовки таблицы: {headers}")
        
        rows_data = [headers]
        
        for row in data:
            rows_data.append([str(row[col]) if row[col] is not None else '' for col in headers])
        
        logger.info(f"Подготовлено: {len(rows_data)} строк (включая заголовки)")
        logger.debug(f"Заголовки: {headers[:5]}...")
        logger.debug(f"Пример данных: {rows_data[1][:5]}...")
        
        print(f"   Подготовлено: {len(rows_data)} строк (включая заголовки)")
        print(f"   Заголовки: {headers[:5]}...")
        print(f"   Пример данных: {rows_data[1][:5]}...")
        
        # 3. Очищаем лист
        logger.info(f"Шаг 3: Очистка листа {sheet_name}")
        print(f"🧹 Шаг 3: Очищаю лист {sheet_name}...")
        
        await sheets_client.clear_sheet_data(sheet_name)
        logger.debug(f"Лист {sheet_name} очищен")
        
        # Проверяем очистку
        check_clear = await sheets_client.get_sheet_data(sheet_name, 'A1:E3')
        logger.debug(f"После очистки в листе {sheet_name}: {len(check_clear)} строк")
        print(f"   После очистки: {len(check_clear)} строк")
        
        # 4. Записываем данные
        logger.info(f"Шаг 4: Запись {len(rows_data)} строк в Google Sheets")
        print(f"📄 Шаг 4: Записываю {len(rows_data)} строк...")
        
        # Функция для преобразования номера колонки в букву (A, B, ..., Z, AA, AB, ...)
        def num_to_col_letters(num):
            letters = ''
            while num > 0:
                num -= 1
                letters = chr(num % 26 + ord('A')) + letters
                num //= 26
            return letters
        
        end_col = num_to_col_letters(len(headers))
        range_name = f'A1:{end_col}{len(rows_data)}'
        logger.debug(f"Запись в диапазон: {range_name} ({len(headers)} колонок, {len(rows_data)} строк)")
        
        await sheets_client.update_sheet_data(sheet_name, range_name, rows_data)
        logger.info(f"Данные записаны в диапазон: {range_name}")
        print(f"   Записано в диапазон: {range_name}")
        
        # 5. Ждем обработки
        logger.debug("Шаг 5: Ожидание 3 секунды для обработки Google Sheets")
        print(f"⏳ Шаг 5: Жду 3 секунды обработки...")
        await asyncio.sleep(3)
        
        # 6. ПРОВЕРЯЕМ результат
        logger.info(f"Шаг 6: Проверка результата синхронизации")
        print(f"🔍 Шаг 6: Проверяю результат...")
        
        # Проверяем первые строки
        verification_data = await sheets_client.get_sheet_data(sheet_name, 'A1:E5')
        logger.debug(f"Первые строки в листе {sheet_name}: {len(verification_data)} строк")
        print(f"   Первые строки: {len(verification_data)} строк")
        
        if verification_data:
            for i, row in enumerate(verification_data[:3]):
                logger.debug(f"Строка {i+1}: {row}")
                print(f"   Строка {i+1}: {row}")
        
        # Проверяем общее количество
        all_data = await sheets_client.get_sheet_data(sheet_name, 'A:A')
        total_rows = len([row for row in all_data if row and any(str(cell).strip() for cell in row if cell)])
        
        logger.info(f"Итого в листе {sheet_name}: {total_rows} строк (включая заголовки)")
        print(f"   📊 ИТОГО в листе: {total_rows} строк (включая заголовки)")
        
        actual_records = max(0, total_rows - 1)  # Минус заголовки
        
        if actual_records > 0:
            logger.success(f"Синхронизация успешна: {actual_records} записей данных в {sheet_name}")
            print(f"   ✅ УСПЕХ: {actual_records} записей данных")
            
            # Обновляем статус в tech таблице
            logger.info(f"Обновление статуса в tech таблице для {sheet_name}")
            print(f"   📝 Обновляю статус в tech таблице...")
            await update_tech_sync_status(main_sheets_client, '295380283', sheet_name, True)
            
            return True
        else:
            logger.error(f"Синхронизация провалена: данные не найдены в {sheet_name}")
            print(f"   ❌ ПРОВАЛ: данные не найдены")
            return False
            
    except Exception as e:
        logger.error(f"Ошибка синхронизации {mysql_table} -> {sheet_name}: {e}")
        print(f"   ❌ ОШИБКА: {e}")
        return False

async def main():
    """Главная функция ручной синхронизации"""
    
    logger.info("Запуск ручной синхронизации таблиц")
    print("🚀 РУЧНАЯ СИНХРОНИЗАЦИЯ ТАБЛИЦ")
    print("=" * 60)
    
    try:
        # Загрузка конфигурации
        logger.info("Загрузка конфигурации")
        config_loader = ConfigLoader()
        config = config_loader.load_env_config()
        logger.debug("Конфигурация загружена успешно")
        
        # Инициализация клиентов
        logger.info("Инициализация MySQL клиента")
        mysql_client = MySQLClient(
            host=config['mysql'].host,
            user=config['mysql'].user,
            password=config['mysql'].password,
            database=config['mysql'].database,
            port=config['mysql'].port
        )
        await mysql_client.create_pool(minsize=1, maxsize=2)
        logger.info("MySQL пул соединений создан")
        
        # Создаем клиент для основной таблицы (для tech листа)
        logger.info("Инициализация Google Sheets клиента для основной таблицы")
        main_sheets_client = GoogleSheetsClient(
            credentials_file=config['google_sheets'].credentials_file,
            spreadsheet_id=config['google_sheets'].spreadsheet_id
        )
        await main_sheets_client.authenticate()
        logger.info(f"Google Sheets клиент для основной таблицы аутентифицирован: {config['google_sheets'].spreadsheet_id}")
        
        # Создаем клиент для таблицы клиента (для данных)
        client_spreadsheet_id = '10cITrzTovnJw3t9ZF1SzcOtJvz9P3re6AhbLkbbG0sg'
        logger.info(f"Инициализация Google Sheets клиента для клиентской таблицы: {client_spreadsheet_id}")
        client_sheets_client = GoogleSheetsClient(
            credentials_file=config['google_sheets'].credentials_file,
            spreadsheet_id=client_spreadsheet_id
        )
        await client_sheets_client.authenticate()
        logger.info(f"Google Sheets клиент для клиентской таблицы аутентифицирован: {client_spreadsheet_id}")
        
        print("✅ Подключения установлены")
        logger.success("Все подключения установлены успешно")
        
        # Синхронизируем каждую таблицу по очереди
        success_count = 0
        total_tables = len(TABLES_TO_SYNC)
        
        logger.info(f"Начало синхронизации {total_tables} таблиц")
        
        for i, (mysql_table, sheet_name, max_records) in enumerate(TABLES_TO_SYNC, 1):
            logger.info(f"Обработка таблицы {i}/{total_tables}: {mysql_table} -> {sheet_name}")
            
            try:
                result = await sync_single_table(mysql_client, client_sheets_client, mysql_table, sheet_name, max_records, main_sheets_client)
                if result:
                    success_count += 1
                    logger.success(f"{sheet_name}: УСПЕШНО")
                    print(f"✅ {sheet_name}: УСПЕШНО")
                else:
                    logger.error(f"{sheet_name}: ПРОВАЛ")
                    print(f"❌ {sheet_name}: ПРОВАЛ")
                    
                # Пауза между таблицами
                logger.debug("Пауза 2 секунды между таблицами")
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"{sheet_name}: ОШИБКА - {e}")
                print(f"❌ {sheet_name}: ОШИБКА - {e}")
        
        # Закрытие соединений
        logger.info("Закрытие MySQL пула соединений")
        await mysql_client.close_pool()
        
        # Итоговый результат
        logger.info(f"Синхронизация завершена: {success_count}/{total_tables} таблиц успешно")
        print(f"\n🏁 ИТОГ: {success_count}/{total_tables} таблиц синхронизировано успешно")
        
        if success_count == total_tables:
            logger.success("Все таблицы синхронизированы успешно!")
        else:
            logger.warning(f"Синхронизировано только {success_count} из {total_tables} таблиц")
            
    except Exception as e:
        logger.error(f"Критическая ошибка в main(): {e}")
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
