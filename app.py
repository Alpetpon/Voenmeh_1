from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
import random
import os
import logging

# Настройка логирования для отладки
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here')  # Используем переменную окружения

# Настройка для Vercel
app.template_folder = 'templates'
app.static_folder = 'static'

# Настройка для serverless среды
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600

logger.info("Flask app initialized successfully")

@app.route('/', methods=['GET'])
def index():
    try:
        logger.info("Processing GET request to /")
        # Получаем настройки из сессии или используем значения по умолчанию
        min_num = session.get('min_num', 1)
        max_num = session.get('max_num', 100)
        logger.info(f"Number range: {min_num} - {max_num}")
        return render_template('index.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in index route: {str(e)}")
        # Возвращаем простую HTML страницу если шаблон не найден
        min_num = session.get('min_num', 1)
        max_num = session.get('max_num', 100)
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

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        try:
            logger.info("Processing POST request to /settings")
            # Получаем новые значения из формы
            min_num = int(request.form.get('min_num', 1))
            max_num = int(request.form.get('max_num', 100))
            
            # Проверяем корректность значений
            if min_num >= max_num:
                logger.warning("Invalid range: min >= max")
                return render_template('settings.html', 
                                     min_num=session.get('min_num', 1), 
                                     max_num=session.get('max_num', 100),
                                     error="Минимальное значение должно быть меньше максимального")
            
            # Сохраняем настройки в сессии
            session['min_num'] = min_num
            session['max_num'] = max_num
            logger.info(f"Settings saved: min={min_num}, max={max_num}")
            
            return redirect(url_for('index'))
        except Exception as e:
            logger.error(f"Error in settings POST: {str(e)}")
            return render_template('settings.html', 
                                 min_num=session.get('min_num', 1), 
                                 max_num=session.get('max_num', 100),
                                 error="Ошибка при сохранении настроек")
    
    try:
        logger.info("Processing GET request to /settings")
        # GET запрос - показываем форму с текущими настройками
        min_num = session.get('min_num', 1)
        max_num = session.get('max_num', 100)
        logger.info(f"Number range: {min_num} - {max_num}")
        return render_template('settings.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in settings GET: {str(e)}")
        # Возвращаем простую HTML страницу настроек
        min_num = session.get('min_num', 1)
        max_num = session.get('max_num', 100)
        return f"""
        <!DOCTYPE html>
        <html>
        <head><title>Настройки - Генератор случайных чисел</title></head>
        <body>
            <h1>Настройки генератора</h1>
            <p>Текущий диапазон: {min_num} - {max_num}</p>
            <form method="POST" action="/settings">
                <label>Минимальное число: <input type="number" name="min_num" value="{min_num}"></label><br>
                <label>Максимальное число: <input type="number" name="max_num" value="{max_num}"></label><br>
                <button type="submit">Сохранить</button>
            </form>
            <p><a href="/">← Вернуться к генератору</a></p>
        </body>
        </html>
        """

@app.route('/generate', methods=['POST'])
def generate():
    try:
        logger.info("Processing POST request to /generate")
        # Используем настройки из сессии
        min_num = session.get('min_num', 1)
        max_num = session.get('max_num', 100)
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

# Маршрут для обслуживания статических файлов на Vercel
@app.route('/static/<path:filename>')
def static_files(filename):
    try:
        logger.info(f"Serving static file: {filename}")
        return send_from_directory(app.static_folder, filename)
    except Exception as e:
        logger.error(f"Error serving static file {filename}: {str(e)}")
        return "File not found", 404

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
            "static_exist": os.path.exists(app.static_folder),
            "background_exists": os.path.exists(os.path.join(app.static_folder, 'background.png'))
        }
    except Exception as e:
        logger.error(f"Error in test route: {str(e)}")
        return {"error": str(e)}, 500

# Экспорт приложения для Vercel
application = app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
