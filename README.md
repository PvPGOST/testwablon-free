# Telegram Mini App - Каталог фото-шаблонов

Это Telegram Mini App для просмотра и выбора фото-шаблонов из каталога. Приложение открывается по нажатию на кнопку в Telegram-боте и позволяет пользователю:

1. Просматривать список доступных фото-шаблонов
2. Открывать выбранное фото для просмотра
3. Отправлять информацию о выбранном фото-шаблоне обратно в бот

## Структура проекта

- `index.html` - главная страница со списком превью фото
- `photo.html` - страница просмотра выбранного фото
- `video.html` - перенаправление для совместимости со старыми ссылками
- `styles.css` - стили для оформления приложения
- `app.js` - JavaScript для главной страницы
- `photo.js` - JavaScript для страницы просмотра фото
- `photos-data.js` - файл с данными о фото-шаблонах
- `photos/templates/` - папка с изображениями шаблонов

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

Когда пользователь нажимает кнопку "ВЫБРАТЬ ШАБЛОН" в Mini App, информация о выбранном фото отправляется обратно в бот в формате JSON:

```json
{
  "photo_id": "photo1",
  "bot_id": "bot_params.bot_id",
  "user_id": "bot_params.user_id",
  "message_id": "bot_params.message_id"
}
```

### Пример обработки данных в боте (Python, aiogram):

```python
@dp.message_handler(content_types=types.ContentTypes.WEB_APP_DATA)
async def web_app_data(message: types.Message):
    # Получаем данные от Mini App
    data = json.loads(message.web_app_data.data)
    
    # Извлекаем информацию о выбранном фото
    photo_id = data.get("photo_id")
    
    # Отправляем ответ пользователю
    await message.answer(f"Вы выбрали фото-шаблон: {photo_id}")
```

## Настройка данных

Для использования своих фото-шаблонов:

1. Поместите изображения в папку `photos/templates/`
2. Обновите массив `photoData` в файле `photos-data.js`

### Пример добавления нового фото:

```javascript
{
  "id": "photo5",
  "image_url": "/photos/templates/new_template.jpg",
  "title": "Шаблон №5",
  "displayName": "Новый красивый шаблон"
}
```

## Требования

- Современный веб-браузер с поддержкой JavaScript и CSS3
- Веб-сервер с поддержкой HTTPS (требование Telegram для Mini Apps)

## Особенности

- **Простота**: Нет категорий, лайков и избранного - только выбор фото
- **Быстрота**: Фото загружаются быстрее видео
- **Совместимость**: Старые ссылки на `video.html` автоматически перенаправляются
- **Универсальный fallback**: При ошибке загрузки показывается резервное изображение

## Лицензия

Это приложение распространяется под лицензией MIT.