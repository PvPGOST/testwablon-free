// Fallback изображения убраны для оптимизации производительности
// При ошибке загрузки показывается только текстовое сообщение

// Данные о фото шаблонах
const photoData = [
  {
    "id": "photo1",
    "image_url": "/photo/photos/templates/template_1_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_1_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №1",
    "displayName": "Шаблон №1" // Название для пользователя
  },
  {
    "id": "photo2", 
    "image_url": "/photo/photos/templates/template_2_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_2_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №2",
    "displayName": "Шаблон №2" // Название для пользователя
  },
  {
    "id": "photo3",
    "image_url": "/photo/photos/templates/template_3_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_3_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №3",
    "displayName": "Шаблон №3" // Название для пользователя
  },
  {
    "id": "photo4",
    "image_url": "/photo/photos/templates/template_4_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_4_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №4", 
    "displayName": "Шаблон №4" // Название для пользователя
  },
  {
    "id": "photo5",
    "image_url": "/photo/photos/templates/template_5_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_5_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №5", 
    "displayName": "Шаблон №5" // Название для пользователя
  },
  {
    "id": "photo6",
    "image_url": "/photo/photos/templates/template_6_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_6_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №6", 
    "displayName": "Шаблон №6" // Название для пользователя
  },
  {
    "id": "photo7",
    "image_url": "/photo/photos/templates/template_7_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_7_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №7", 
    "displayName": "Шаблон №7" // Название для пользователя
  },
  {
    "id": "photo8",
    "image_url": "/photo/photos/templates/template_8_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_8_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №8", 
    "displayName": "Шаблон №8" // Название для пользователя
  },
  {
    "id": "photo9",
    "image_url": "/photo/photos/templates/template_9_watermark.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_9_clean.jpg", // Чистое превью для показа
    "title": "Шаблон №9", 
    "displayName": "Шаблон №9" // Название для пользователя
  }
];

// Совместимость со старым кодом - алиас для videoData
const videoData = photoData;

// Категории удалены - теперь простая сетка фото

// Функция для получения всех фото (без категорий)
function getVideosByCategory(category) {
  // Всегда возвращаем все фото, игнорируя категории
  return photoData;
}

// Совместимость со старыми названиями функций
function getPopularVideos() {
  return photoData;
}

// Функция для получения описания фото-шаблона
function getDurationText(photoId) {
  const photo = photoData.find(p => p.id === photoId);
  if (!photo) {
    return 'Шаблон не найден';
  }
  
  return photo.displayName; // Только название без "Фото-шаблон:"
}

// Системы лайков и избранного убраны

// Выводим в консоль для проверки при загрузке
console.log("Данные о фото загружены:", photoData);

// Тестовые функции лайков и избранного убраны

/*
=== ПАМЯТКА ПО ФОТО-ШАБЛОНАМ ===

Шаблон для нового фото:
{
  "id": "photo_NEW_ID",
  "image_url": "URL_К_ИЗОБРАЖЕНИЮ",
  "title": "НАЗВАНИЕ",
  "displayName": "КРАСИВОЕ НАЗВАНИЕ ДЛЯ ПОЛЬЗОВАТЕЛЯ" // Показывается при отправке в Telegram
}

ВАЖНО: 
- image_url - версия с вотермарком (отправляется на обработку) 
- preview_image - чистое превью (показывается пользователю)
- displayName - красивое название, которое показывается пользователю при выборе шаблона
- title - техническое название для интерфейса приложения

ДВОЙНАЯ СИСТЕМА ФАЙЛОВ:
- Превью: Чистые фото без вотермарков (красиво для пользователя)
- Обработка: Автоматически используются версии с вотермарками
- Пользователь не знает о вотермарках - это скрытая функция
- Ленивая загрузка - превью загружаются только при прокрутке

СХЕМА ОТПРАВКИ ДАННЫХ:
При выборе фото отправляется:
{
  "photo_id": "photo1",                    // ID выбранного фото-шаблона
  "bot_id": "bot_params.bot_id",          // ID бота из URL параметров
  "user_id": "bot_params.user_id",        // ID пользователя из URL параметров  
  "message_id": "bot_params.message_id"   // ID сообщения из URL параметров
}
*/
