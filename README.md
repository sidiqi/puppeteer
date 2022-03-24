⚠️ P.S. естессно не будет работать с двухфакторной авторизацией

## Установка и запуск

Установка зависимостей
> npm i

Копируем настройки (в .env вводим *логин / пароль*) 
> cp .env.example .env

``
опционально: можно указать в .env файле TELEGRAM_BOT_TOKEN и TELEGRAM_USER_ID для отправки логов в тг бота
``

Запуск

> node bxtime.js start

> node bxtime.js stop

## Примеры crontab c UTC+3
*Начали работу 7:50 (пн-пт)*
> 50 7 * * 1-5 cd /root/projects/puppeteer && node bxtime.js start >/dev/null 2>&1

*Закончили работу 17:00 (пн-пт)*
> 0 17 * * 1-5 cd /root/projects/puppeteer && node bxtime.js stop >/dev/null 2>&1

## Посмотреть логи
> cat logs/log.txt
