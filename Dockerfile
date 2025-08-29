# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем все файлы приложения
COPY . .

# Устанавливаем переменную окружения для Flask
ENV FLASK_APP=index.py
ENV FLASK_ENV=production
ENV SECRET_KEY=your-production-secret-key-here

# Открываем порт
EXPOSE 5000

# Команда для запуска приложения
CMD ["python", "index.py"]
