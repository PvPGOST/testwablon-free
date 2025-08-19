// Универсальное fallback изображение для всех фото
const UNIVERSAL_FALLBACK_IMAGE = "https://i.ibb.co/bMy6p7zV/20250712-1125-simple-compose-01jzyvrr00fmd9nx0y3x5yb2n0.png";

// Функция для получения универсального fallback изображения
function getUniversalFallbackImage() {
    return UNIVERSAL_FALLBACK_IMAGE;
}

// Данные о фото шаблонах
const photoData = [
  {
    "id": "photo1",
    "image_url": "https://github.com/PvPGOST/testwablon-free/blob/c83fe13b15997e9d23e2b599c2a4d3609b52d672/photos/templates/template_1.jpg?raw=true",
    "title": "Шаблон №1",
    "displayName": "Романтический шаблон" // Красивое название для пользователя
  },
  {
    "id": "photo2", 
    "image_url": "/photos/templates/template_2.jpg",
    "title": "Шаблон №2",
    "displayName": "Элегантный портрет" // Красивое название для пользователя
  },
  {
    "id": "photo3",
    "image_url": "/photos/templates/template_3.jpg", 
    "title": "Шаблон №3",
    "displayName": "Стильный коллаж" // Красивое название для пользователя
  },
  {
    "id": "photo4",
    "image_url": "/photos/templates/template_4.jpg",
    "title": "Шаблон №4", 
    "displayName": "Минималистичный дизайн" // Красивое название для пользователя
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
  
  return `Фото-шаблон: ${photo.displayName}`;
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
- УНИВЕРСАЛЬНЫЙ FALLBACK: Используется одно изображение для всех фото (UNIVERSAL_FALLBACK_IMAGE)
- displayName - красивое название, которое показывается пользователю при выборе шаблона
- title - техническое название для интерфейса приложения

СИСТЕМА FALLBACK:
- Если фото не загрузится, показывается универсальное изображение
- Универсальный fallback: https://i.ibb.co/bMy6p7zV/20250712-1125-simple-compose-01jzyvrr00fmd9nx0y3x5yb2n0.png
- Функция getUniversalFallbackImage() возвращает URL универсального fallback
- Можно изменить UNIVERSAL_FALLBACK_IMAGE в начале файла для смены изображения

СХЕМА ОТПРАВКИ ДАННЫХ:
При выборе фото отправляется:
{
  "photo_id": "photo1",                    // ID выбранного фото-шаблона
  "bot_id": "bot_params.bot_id",          // ID бота из URL параметров
  "user_id": "bot_params.user_id",        // ID пользователя из URL параметров  
  "message_id": "bot_params.message_id"   // ID сообщения из URL параметров
}
*/


