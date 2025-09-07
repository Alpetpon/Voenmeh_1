import pandas as pd
import io
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from collections import defaultdict
from loguru import logger


class ReportService:
    """Сервис для генерации Excel отчетов"""
    
    @staticmethod
    def generate_monthly_report(receipts_data: List[Dict[str, Any]], 
                              year: int, month: int) -> Optional[bytes]:
        """
        Генерация месячного отчета в формате Excel
        
        Args:
            receipts_data: Данные чеков за месяц
            year: Год
            month: Месяц
            
        Returns:
            Байты Excel файла или None при ошибке
        """
        try:
            if not receipts_data:
                logger.warning("Нет данных для генерации отчета")
                return None
            
            # Создаем DataFrame из данных
            df = pd.DataFrame(receipts_data)
            
            # Конвертируем строковые даты в datetime
            df['Дата чека'] = pd.to_datetime(df['Дата чека'], errors='coerce')
            
            # Конвертируем числовые поля
            numeric_fields = ['Общая сумма', 'Цена', 'Количество', 'Сумма']
            for field in numeric_fields:
                df[field] = pd.to_numeric(df[field], errors='coerce').fillna(0)
            
            # Создаем Excel файл в памяти
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                workbook = writer.book
                
                # Создаем лист "По сотрудникам"
                ReportService._create_employee_sheet(df, writer, workbook)
                
                # Создаем лист "Общая сумма"
                ReportService._create_summary_sheet(df, writer, workbook)
                
                # Создаем лист "Подробные данные"
                ReportService._create_detailed_sheet(df, writer, workbook)
            
            output.seek(0)
            excel_data = output.getvalue()
            
            logger.info(f"Excel отчет сгенерирован: {len(receipts_data)} записей")
            return excel_data
            
        except Exception as e:
            logger.error(f"Ошибка при генерации Excel отчета: {e}")
            return None
    
    @staticmethod
    def _create_employee_sheet(df: pd.DataFrame, writer: pd.ExcelWriter, workbook):
        """Создание листа с данными по сотрудникам"""
        # Группируем по пользователям
        employee_summary = df.groupby('username').agg({
            'Общая сумма': ['sum', 'count'],
            'Дата чека': ['min', 'max']
        }).round(2)
        
        # Упрощаем названия колонок
        employee_summary.columns = [
            'Общая сумма', 'Количество чеков', 'Первый чек', 'Последний чек'
        ]
        
        # Сортируем по сумме по убыванию
        employee_summary = employee_summary.sort_values('Общая сумма', ascending=False)
        
        # Записываем в Excel
        employee_summary.to_excel(writer, sheet_name='По сотрудникам')
        
        # Форматирование
        worksheet = writer.sheets['По сотрудникам']
        
        # Формат для денежных сумм
        money_format = workbook.add_format({'num_format': '#,##0.00'})
        worksheet.set_column('B:B', 15, money_format)
        
        # Формат для дат
        date_format = workbook.add_format({'num_format': 'dd.mm.yyyy'})
        worksheet.set_column('D:E', 12, date_format)
        
        # Ширина колонок
        worksheet.set_column('A:A', 20)  # Имя пользователя
        worksheet.set_column('C:C', 15)  # Количество чеков
    
    @staticmethod
    def _create_summary_sheet(df: pd.DataFrame, writer: pd.ExcelWriter, workbook):
        """Создание листа с общими суммами"""
        # Общие статистики
        total_sum = df['Общая сумма'].sum()
        total_receipts = len(df)
        unique_employees = df['username'].nunique()
        date_range = f"{df['Дата чека'].min().strftime('%d.%m.%Y')} - {df['Дата чека'].max().strftime('%d.%m.%Y')}"
        
        # Создаем DataFrame с итоговыми данными
        summary_data = {
            'Показатель': [
                'Общая сумма всех чеков',
                'Количество чеков',
                'Количество сотрудников',
                'Период',
                'Средняя сумма чека',
                'Средняя сумма на сотрудника'
            ],
            'Значение': [
                f"{total_sum:,.2f} ₽",
                total_receipts,
                unique_employees,
                date_range,
                f"{total_sum / total_receipts:,.2f} ₽" if total_receipts > 0 else "0 ₽",
                f"{total_sum / unique_employees:,.2f} ₽" if unique_employees > 0 else "0 ₽"
            ]
        }
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Общая сумма', index=False)
        
        # Форматирование
        worksheet = writer.sheets['Общая сумма']
        worksheet.set_column('A:A', 30)
        worksheet.set_column('B:B', 20)
        
        # Заголовок
        header_format = workbook.add_format({
            'bold': True,
            'font_size': 14,
            'bg_color': '#D7E4BC'
        })
        worksheet.set_row(0, 20, header_format)
    
    @staticmethod
    def _create_detailed_sheet(df: pd.DataFrame, writer: pd.ExcelWriter, workbook):
        """Создание листа с подробными данными"""
        # Выбираем нужные колонки и сортируем по дате
        detailed_df = df[[
            'username', 'Дата чека', 'Общая сумма', 'ИНН', 'Организация',
            'Наименование товара', 'Цена', 'Количество', 'Сумма'
        ]].sort_values('Дата чека')
        
        detailed_df.to_excel(writer, sheet_name='Подробные данные', index=False)
        
        # Форматирование
        worksheet = writer.sheets['Подробные данные']
        
        # Ширина колонок
        worksheet.set_column('A:A', 15)  # username
        worksheet.set_column('B:B', 12)  # Дата чека
        worksheet.set_column('C:C', 12)  # Общая сумма
        worksheet.set_column('D:D', 15)  # ИНН
        worksheet.set_column('E:E', 30)  # Организация
        worksheet.set_column('F:F', 40)  # Наименование товара
        worksheet.set_column('G:G', 10)  # Цена
        worksheet.set_column('H:H', 10)  # Количество
        worksheet.set_column('I:I', 10)  # Сумма
        
        # Формат для денежных сумм
        money_format = workbook.add_format({'num_format': '#,##0.00'})
        worksheet.set_column('C:C', 12, money_format)
        worksheet.set_column('G:G', 10, money_format)
        worksheet.set_column('I:I', 10, money_format)
        
        # Формат для дат
        date_format = workbook.add_format({'num_format': 'dd.mm.yyyy hh:mm'})
        worksheet.set_column('B:B', 15, date_format)
        
        # Заголовки
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D7E4BC',
            'border': 1
        })
        worksheet.set_row(0, 20, header_format)
    
    @staticmethod
    def get_report_filename(year: int, month: int) -> str:
        """
        Генерация имени файла отчета
        
        Args:
            year: Год
            month: Месяц
            
        Returns:
            Имя файла
        """
        month_names = {
            1: 'январь', 2: 'февраль', 3: 'март', 4: 'апрель',
            5: 'май', 6: 'июнь', 7: 'июль', 8: 'август',
            9: 'сентябрь', 10: 'октябрь', 11: 'ноябрь', 12: 'декабрь'
        }
        
        month_name = month_names.get(month, str(month))
        return f"Отчет_по_чекам_{month_name}_{year}.xlsx" 