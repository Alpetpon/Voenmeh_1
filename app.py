from flask import Flask, render_template, request
import random

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    number = None
    if request.method == 'POST':
        number = random.randint(1, 100)
    return render_template('index.html', number=number)

if __name__ == '__main__':
    app.run(debug=True)
