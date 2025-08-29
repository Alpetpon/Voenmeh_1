from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import random
import os

app = Flask(__name__)

# Настройка секретного ключа для сессий
app.secret_key = os.environ.get('SECRET_KEY', 'development-secret-key-12345')

# Настройка для Vercel - автоматическое определение путей
if os.environ.get('VERCEL'):
    app.template_folder = 'templates'
    app.static_folder = 'static'

# Настройка для serverless среды
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 час

def get_number_range():
    """Получить диапазон чисел из сессии или использовать значения по умолчанию"""
    min_num = session.get('min_num', 1)
    max_num = session.get('max_num', 100)
    return min_num, max_num

@app.route('/', methods=['GET'])
def index():
    min_num, max_num = get_number_range()
    return render_template('index.html', min_num=min_num, max_num=max_num)

@app.route('/settings', methods=['GET'])
def settings():
    min_num, max_num = get_number_range()
    return render_template('settings.html', min_num=min_num, max_num=max_num)

@app.route('/save_settings', methods=['POST'])
def save_settings():
    try:
        min_num = int(request.form['min_num'])
        max_num = int(request.form['max_num'])
        
        if min_num >= max_num:
            flash('Минимальное число должно быть меньше максимального!', 'error')
            return redirect(url_for('settings'))
        
        session['min_num'] = min_num
        session['max_num'] = max_num
        
        flash('Настройки успешно сохранены!', 'success')
        return redirect(url_for('settings'))
    
    except ValueError:
        flash('Пожалуйста, введите корректные числа!', 'error')
        return redirect(url_for('settings'))

@app.route('/generate', methods=['POST'])
def generate():
    min_num, max_num = get_number_range()
    number = random.randint(min_num, max_num)
    return jsonify(number=number)

# Экспорт приложения для Vercel
application = app

if __name__ == '__main__':
    # Для Docker контейнера нужно слушать на всех интерфейсах
    app.run(host='0.0.0.0', port=5000, debug=False) 
