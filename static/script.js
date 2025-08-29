document.getElementById('transparent-button').addEventListener('click', function() {
    // Используем настройки пользователя для генерации случайного числа
    var randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    document.getElementById('number').textContent = randomNumber;
});
