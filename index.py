from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__, template_folder='../templates', static_folder='../static')

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    number = random.randint(1, 100)
    return jsonify(number=number) 
