from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import random
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here')  # Используем переменную окружения

@app.route('/', methods=['GET'])
def index():
    # Получаем настройки из сессии или используем значения по умолчанию
    min_num = session.get('min_num', 1)
    max_num = session.get('max_num', 100)
    return render_template('index.html', min_num=min_num, max_num=max_num)

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        # Получаем новые значения из формы
        min_num = int(request.form.get('min_num', 1))
        max_num = int(request.form.get('max_num', 100))
        
        # Проверяем корректность значений
        if min_num >= max_num:
            return render_template('settings.html', 
                                 min_num=session.get('min_num', 1), 
                                 max_num=session.get('max_num', 100),
                                 error="Минимальное значение должно быть меньше максимального")
        
        # Сохраняем настройки в сессии
        session['min_num'] = min_num
        session['max_num'] = max_num
        
        return redirect(url_for('index'))
    
    # GET запрос - показываем форму с текущими настройками
    min_num = session.get('min_num', 1)
    max_num = session.get('max_num', 100)
    return render_template('settings.html', min_num=min_num, max_num=max_num)

@app.route('/generate', methods=['POST'])
def generate():
    # Используем настройки из сессии
    min_num = session.get('min_num', 1)
    max_num = session.get('max_num', 100)
    number = random.randint(min_num, max_num)
    return jsonify(number=number)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
