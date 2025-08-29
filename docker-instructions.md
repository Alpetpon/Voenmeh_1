# Инструкции по Docker

## Сборка образа

```bash
docker build -t voenmeh-randomizer .
```

## Запуск контейнера

```bash
docker run -p 5000:5000 voenmeh-randomizer
```

## Запуск в фоновом режиме

```bash
docker run -d -p 5000:5000 --name voenmeh-app voenmeh-randomizer
```

## Остановка контейнера

```bash
docker stop voenmeh-app
```

## Удаление контейнера

```bash
docker rm voenmeh-app
```

## Просмотр логов

```bash
docker logs voenmeh-app
```

## Доступ к приложению

После запуска контейнера приложение будет доступно по адресу:
http://localhost:5000

## Переменные окружения

Для продакшена рекомендуется установить переменную окружения для секретного ключа:

```bash
docker run -p 5000:5000 -e SECRET_KEY=your-secret-key voenmeh-randomizer
```
