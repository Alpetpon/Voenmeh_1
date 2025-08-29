from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import random
import os
import logging

# Настройка логирования для отладки
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Настройка секретного ключа для сессий
app.secret_key = os.environ.get('SECRET_KEY', 'development-secret-key-12345')

# Простая настройка для Vercel
app.template_folder = 'templates'
app.static_folder = 'static'

# Настройка для serverless среды
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600

logger.info("Flask app initialized successfully")

def get_number_range():
    """Получить диапазон чисел из сессии или использовать значения по умолчанию"""
    min_num = session.get('min_num', 1)
    max_num = session.get('max_num', 100)
    return min_num, max_num

@app.route('/', methods=['GET'])
def index():
    try:
        logger.info("Processing GET request to /")
        min_num, max_num = get_number_range()
        logger.info(f"Number range: {min_num} - {max_num}")
        return render_template('index.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in index route: {str(e)}")
        # Возвращаем простую HTML страницу если шаблон не найден
        return f"""
        <!DOCTYPE html>
        <html>
        <head><title>Генератор случайных чисел</title></head>
        <body>
            <h1>Генератор случайных чисел</h1>
            <p>Диапазон: {min_num} - {max_num}</p>
            <button onclick="generateNumber()">Сгенерировать число</button>
            <p id="result">?</p>
            <script>
                function generateNumber() {{
                    const min = {min_num};
                    const max = {max_num};
                    const number = Math.floor(Math.random() * (max - min + 1)) + min;
                    document.getElementById('result').textContent = number;
                }}
            </script>
        </body>
        </html>
        """

@app.route('/settings', methods=['GET'])
def settings():
    try:
        logger.info("Processing GET request to /settings")
        min_num, max_num = get_number_range()
        logger.info(f"Number range: {min_num} - {max_num}")
        return render_template('settings.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in settings route: {str(e)}")
        # Возвращаем простую HTML страницу настроек
        return f"""
        <!DOCTYPE html>
        <html>
        <head><title>Настройки - Генератор случайных чисел</title></head>
        <body>
            <h1>Настройки генератора</h1>
            <p>Текущий диапазон: {min_num} - {max_num}</p>
            <form method="POST" action="/save_settings">
                <label>Минимальное число: <input type="number" name="min_num" value="{min_num}"></label><br>
                <label>Максимальное число: <input type="number" name="max_num" value="{max_num}"></label><br>
                <button type="submit">Сохранить</button>
            </form>
            <p><a href="/">← Вернуться к генератору</a></p>
        </body>
        </html>
        """

@app.route('/save_settings', methods=['POST'])
def save_settings():
    try:
        logger.info("Processing POST request to /save_settings")

        min_num = int(request.form['min_num'])
        max_num = int(request.form['max_num'])
        logger.info(f"Saving settings: min={min_num}, max={max_num}")

        if min_num >= max_num:
            logger.warning("Invalid range: min >= max")
            return """
            <!DOCTYPE html>
            <html>
            <head><title>Ошибка - Генератор случайных чисел</title></head>
            <body>
                <h1>Ошибка</h1>
                <p>Минимальное число должно быть меньше максимального!</p>
                <p><a href="/settings">← Вернуться к настройкам</a></p>
            </body>
            </html>
            """

        session['min_num'] = min_num
        session['max_num'] = max_num
        logger.info("Settings saved successfully")

        return """
        <!DOCTYPE html>
        <html>
        <head><title>Успех - Генератор случайных чисел</title></head>
        <body>
            <h1>Успех!</h1>
            <p>Настройки успешно сохранены!</p>
            <p><a href="/settings">← Вернуться к настройкам</a></p>
            <p><a href="/">← Вернуться к генератору</a></p>
        </body>
        </html>
        """

    except ValueError as e:
        logger.error(f"ValueError in save_settings: {str(e)}")
        return """
        <!DOCTYPE html>
        <html>
        <head><title>Ошибка - Генератор случайных чисел</title></head>
        <body>
            <h1>Ошибка</h1>
            <p>Пожалуйста, введите корректные числа!</p>
            <p><a href="/settings">← Вернуться к настройкам</a></p>
        </body>
        </html>
        """
    except Exception as e:
        logger.error(f"Error in save_settings: {str(e)}")
        return """
        <!DOCTYPE html>
        <html>
        <head><title>Ошибка - Генератор случайных чисел</title></head>
        <body>
            <h1>Ошибка</h1>
            <p>Произошла ошибка при сохранении настроек!</p>
            <p><a href="/settings">← Вернуться к настройкам</a></p>
        </body>
        </html>
        """

@app.route('/generate', methods=['POST'])
def generate():
    try:
        logger.info("Processing POST request to /generate")
        min_num, max_num = get_number_range()
        logger.info(f"Generating number in range: {min_num} - {max_num}")

        number = random.randint(min_num, max_num)
        logger.info(f"Generated number: {number}")

        return jsonify(number=number)
    except Exception as e:
        logger.error(f"Error in generate route: {str(e)}")
        return jsonify(error=str(e)), 500

# Глобальная обработка ошибок
@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return "Internal Server Error", 500

@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"Not found error: {error}")
    return "Not Found", 404

# Тестовый маршрут для проверки работоспособности
@app.route('/test')
def test():
    try:
        logger.info("Test route called")
        return {
            "status": "OK",
            "template_folder": app.template_folder,
            "static_folder": app.static_folder,
            "templates_exist": os.path.exists(app.template_folder),
            "static_exist": os.path.exists(app.static_folder)
        }
    except Exception as e:
        logger.error(f"Error in test route: {str(e)}")
        return {"error": str(e)}, 500

# Экспорт приложения для Vercel
application = app

if __name__ == '__main__':
    # Для Docker контейнера нужно слушать на всех интерфейсах
    app.run(host='0.0.0.0', port=5000, debug=False) 
