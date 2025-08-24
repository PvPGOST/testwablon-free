# Telegram Mini App - Платные фото-шаблоны

Это премиум-версия Telegram Mini App для просмотра и выбора фото-шаблонов. Приложение открывается по нажатию на инлайн-кнопку в Telegram-боте и позволяет пользователю:

1. Просматривать список премиум фото-шаблонов
2. Добавлять шаблоны в избранное (синхронизация через Telegram Cloud Storage)
3. Просматривать детальную информацию о шаблоне
4. Отправлять выбранный шаблон обратно в бот для обработки

## Структура проекта

- `index.html` - главная страница со списком превью фото-шаблонов
- `photo.html` - страница просмотра выбранного фото с избранным
- `video.html` - перенаправление для совместимости со старыми ссылками
- `styles.css` - стили для оформления приложения
- `app.js` - JavaScript для главной страницы
- `photo.js` - JavaScript для страницы просмотра фото (избранное)
- `photos-data.js` - данные о фото-шаблонах и система избранного
- `stagewise-init.js` - инициализация Stagewise toolbar для разработки
- `photos/templates/` - папка с основными файлами шаблонов
- `photos/previews/` - папка с превью шаблонов для показа пользователю

## Использование в Telegram-боте

Для интеграции Mini App с ботом необходимо:

1. Загрузить все файлы проекта на веб-сервер с поддержкой HTTPS
2. Зарегистрировать Mini App через @BotFather, указав URL вашего приложения
3. Добавить кнопку для открытия Mini App в бота

### Пример кнопки для открытия Mini App в боте (Python, aiogram):

```python
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo

# Создаем кнопку для открытия Mini App
webapp_button = types.KeyboardButton(
    text="Выбрать фото-шаблон", 
    web_app=WebAppInfo(url="https://ваш-домен.com/путь-к-мини-аппу/")
)

# Создаем клавиатуру с этой кнопкой
keyboard = types.ReplyKeyboardMarkup(
    keyboard=[[webapp_button]], 
    resize_keyboard=True
)

# Отправляем сообщение с клавиатурой
@dp.message_handler(commands=["start"])
async def cmd_start(message: types.Message):
    await message.answer(
        "Нажмите на кнопку ниже, чтобы выбрать фото-шаблон:", 
        reply_markup=keyboard
    )
```

## Обработка данных от Mini App

Когда пользователь нажимает кнопку "ВЫБРАТЬ ШАБЛОН" в Mini App, данные отправляются на API endpoint `/api/photo_template` в формате JSON:

```json
{
  "photo_id": "photo1",
  "bot_id": "ваш_bot_id",
  "user_id": "telegram_user_id",
  "message_id": "message_id_для_редактирования"
}
```

### Пример обработки на сервере (FastAPI/Flask):

```python
from fastapi import FastAPI, Request
import json

app = FastAPI()

@app.post("/api/photo_template")
async def handle_photo_selection(request: Request):
    data = await request.json()
    
    photo_id = data.get("photo_id")
    bot_id = data.get("bot_id")
    user_id = data.get("user_id")
    message_id = data.get("message_id")
    
    # Обработка выбранного фото-шаблона
    # Например, генерация персонализированного фото и отправка пользователю
    
    return {"status": "success"}
```

### Особенности работы:

- **Автоматическое закрытие**: Mini App закрывается через 2 секунды после отправки
- **Красивые уведомления**: Показываются стильные анимированные уведомления
- **Обработка ошибок**: При ошибке API показывается соответствующее сообщение

## Настройка данных

Для использования своих фото-шаблонов:

1. Поместите изображения в папку `photos/templates/`
2. Обновите массив `photoData` в файле `photos-data.js`

### Пример добавления нового шаблона:

```javascript
{
  "id": "photo10",
  "template_url": "/photo/photos/templates/template_10_template.jpg",
  "preview_url": "/photo/photos/previews/template_10_preview.jpg", 
  "title": "Шаблон №10",
  "displayName": "Премиум шаблон №10"
}
```

## Система избранного

- **Telegram Cloud Storage**: Избранное синхронизируется между устройствами пользователя
- **Fallback на localStorage**: Для локальной разработки
- **Визуальная обратная связь**: Кнопки меняют состояние (☆ ↔ ★)
- **Тактильный отклик**: Вибрация при нажатии в Telegram

## Требования

- **Сервер**: Веб-сервер с поддержкой HTTPS (требование Telegram для Mini Apps)
- **API**: Endpoint `/api/photo_template` для обработки выбора шаблонов
- **Браузер**: Современный браузер с поддержкой JavaScript ES6+ и CSS3

## Особенности

- **Премиум качество**: Высококачественные фото-шаблоны
- **Двойная система файлов**: Отдельные превью и основные шаблоны
- **Система избранного**: Персональная коллекция пользователя
- **Быстрая загрузка**: Оптимизированные превью для лучшего UX
- **Совместимость**: Старые ссылки на `video.html` автоматически перенаправляются

## Отличия от бесплатной версии

- ✅ **Система избранного** (синхронизация через Telegram Cloud Storage)
- ✅ **Премиум шаблоны** (высокое качество)
- ✅ **Персонализация** (избранные коллекции)
- ✅ **Улучшенный UX** (тактильная обратная связь)

## Лицензия

Это приложение распространяется под лицензией MIT.