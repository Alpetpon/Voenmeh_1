document.getElementById('transparent-button').addEventListener('click', function() {
    var randomNumber = Math.floor(Math.random() * 100) + 1; // Генерация случайного числа от 1 до 100
    document.getElementById('number').textContent = randomNumber;
});
