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

# Настройка путей для шаблонов и статических файлов
current_dir = os.path.dirname(os.path.abspath(__file__))
templates_dir = os.path.join(current_dir, 'templates')
static_dir = os.path.join(current_dir, 'static')

app.template_folder = templates_dir
app.static_folder = static_dir

logger.info(f"Template folder set to: {templates_dir}")
logger.info(f"Static folder set to: {static_dir}")
logger.info(f"Templates directory exists: {os.path.exists(templates_dir)}")
logger.info(f"Static directory exists: {os.path.exists(static_dir)}")

# Настройка для serverless среды
app.config['SESSION_COOKIE_SECURE'] = False  # Отключаем для тестирования
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 час

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

        # Проверяем, что шаблоны существуют
        template_path = os.path.join(app.template_folder, 'index.html')
        logger.info(f"Template path: {template_path}")
        logger.info(f"Template exists: {os.path.exists(template_path)}")

        if not os.path.exists(template_path):
            logger.error(f"Template file not found: {template_path}")
            return f"Template not found: {template_path}", 404

        return render_template('index.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in index route: {str(e)}")
        logger.error(f"Template folder: {app.template_folder}")
        logger.error(f"Static folder: {app.static_folder}")
        return f"Internal Server Error: {str(e)}", 500

@app.route('/settings', methods=['GET'])
def settings():
    try:
        logger.info("Processing GET request to /settings")
        min_num, max_num = get_number_range()
        logger.info(f"Number range: {min_num} - {max_num}")

        template_path = os.path.join(app.template_folder, 'settings.html')
        logger.info(f"Settings template path: {template_path}")
        logger.info(f"Settings template exists: {os.path.exists(template_path)}")

        if not os.path.exists(template_path):
            logger.error(f"Settings template file not found: {template_path}")
            return f"Settings template not found: {template_path}", 404

        return render_template('settings.html', min_num=min_num, max_num=max_num)
    except Exception as e:
        logger.error(f"Error in settings route: {str(e)}")
        return f"Internal Server Error: {str(e)}", 500

@app.route('/save_settings', methods=['POST'])
def save_settings():
    try:
        logger.info("Processing POST request to /save_settings")

        min_num = int(request.form['min_num'])
        max_num = int(request.form['max_num'])
        logger.info(f"Saving settings: min={min_num}, max={max_num}")

        if min_num >= max_num:
            logger.warning("Invalid range: min >= max")
            flash('Минимальное число должно быть меньше максимального!', 'error')
            return redirect(url_for('settings'))

        session['min_num'] = min_num
        session['max_num'] = max_num
        logger.info("Settings saved successfully")

        flash('Настройки успешно сохранены!', 'success')
        return redirect(url_for('settings'))

    except ValueError as e:
        logger.error(f"ValueError in save_settings: {str(e)}")
        flash('Пожалуйста, введите корректные числа!', 'error')
        return redirect(url_for('settings'))
    except Exception as e:
        logger.error(f"Error in save_settings: {str(e)}")
        flash('Произошла ошибка при сохранении настроек!', 'error')
        return redirect(url_for('settings'))

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
