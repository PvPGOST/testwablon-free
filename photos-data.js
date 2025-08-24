// Fallback изображения убраны для оптимизации производительности
// При ошибке загрузки показывается только текстовое сообщение

// Данные о фото шаблонах
const photoData = [
  {
    "id": "photo1",
    "image_url": "/photo/photos/templates/template_1.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_1_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №1",
    "displayName": "Шаблон №1" // Название для пользователя
  },
  {
    "id": "photo2", 
    "image_url": "/photo/photos/templates/template_2.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_2_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №2",
    "displayName": "Шаблон №2" // Название для пользователя
  },
  {
    "id": "photo3",
    "image_url": "/photo/photos/templates/template_3.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_3_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №3",
    "displayName": "Шаблон №3" // Название для пользователя
  },
  {
    "id": "photo4",
    "image_url": "/photo/photos/templates/template_4.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_4_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №4", 
    "displayName": "Шаблон №4" // Название для пользователя
  },
  {
    "id": "photo5",
    "image_url": "/photo/photos/templates/template_5.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_5_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №5", 
    "displayName": "Шаблон №5" // Название для пользователя
  },
  {
    "id": "photo6",
    "image_url": "/photo/photos/templates/template_6", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_6_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №6", 
    "displayName": "Шаблон №6" // Название для пользователя
  },
  {
    "id": "photo7",
    "image_url": "/photo/photos/templates/template_7.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_7_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №7", 
    "displayName": "Шаблон №7" // Название для пользователя
  },
  {
    "id": "photo8",
    "image_url": "/photo/photos/templates/template_8.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_8_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №8", 
    "displayName": "Шаблон №8" // Название для пользователя
  },
  {
    "id": "photo9",
    "image_url": "/photo/photos/templates/template_9.jpg", // Версия с вотермарком для обработки
    "preview_image": "/photo/photos/previews/template_9_preview.jpg", // Чистое превью для показа
    "title": "Шаблон №9", 
    "displayName": "Шаблон №9" // Название для пользователя
  }
];

// Категории не используются - показываем все фото-шаблоны в одном списке

// Функция для получения описания фото-шаблона
function getDurationText(photoId) {
  const photo = photoData.find(p => p.id === photoId);
  if (!photo) {
    return 'Шаблон не найден';
  }
  
  return photo.displayName; // Только название без "Фото-шаблон:"
}

// === СИСТЕМА ИЗБРАННОГО ===

// Переменная для хранения избранных фото (кэш)
let favoritePhotosCache = [];

// Функция для получения избранных фото
function getFavoritePhotos() {
  return photoData.filter(photo => favoritePhotosCache.includes(photo.id));
}

// Функция для проверки, находится ли фото в избранном
function isPhotoFavorite(photoId) {
  return favoritePhotosCache.includes(photoId);
}

// Функция для добавления/удаления фото из избранного
async function togglePhotoFavorite(photoId) {
  console.log('=== ПЕРЕКЛЮЧЕНИЕ ИЗБРАННОГО ===');
  console.log('ID фото:', photoId);
  console.log('Текущее избранное до изменения:', favoritePhotosCache);
  
  const isFavorite = isPhotoFavorite(photoId);
  console.log('Фото в избранном до изменения:', isFavorite);
  
  if (isFavorite) {
    // Удаляем из избранного
    favoritePhotosCache = favoritePhotosCache.filter(id => id !== photoId);
    console.log('Удаляем из избранного');
  } else {
    // Добавляем в избранное
    favoritePhotosCache.push(photoId);
    console.log('Добавляем в избранное');
  }
  
  console.log('Избранное после изменения:', favoritePhotosCache);
  
  // Сохраняем в Telegram Cloud Storage
  try {
    await saveFavoritesToCloud();
    console.log('Данные сохранены успешно');
  } catch (error) {
    console.error('Ошибка сохранения избранного:', error);
  }
  
  const newStatus = !isFavorite;
  console.log('Новый статус избранного:', newStatus);
  console.log('=== КОНЕЦ ПЕРЕКЛЮЧЕНИЯ ИЗБРАННОГО ===');
  
  return newStatus; // Возвращаем новый статус
}

// Функция для сохранения избранного в Cloud Storage
async function saveFavoritesToCloud() {
  return new Promise((resolve, reject) => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      const favoritesData = JSON.stringify(favoritePhotosCache);
      window.Telegram.WebApp.CloudStorage.setItem('photoFavorites', favoritesData, (error) => {
        if (error) {
          console.error('Ошибка сохранения избранного в Cloud Storage:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      // Fallback для локальной разработки
      localStorage.setItem('photoFavorites', JSON.stringify(favoritePhotosCache));
      resolve();
    }
  });
}

// Функция для загрузки избранного из Cloud Storage
async function loadFavoritesFromCloud() {
  return new Promise((resolve) => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      window.Telegram.WebApp.CloudStorage.getItem('photoFavorites', (error, data) => {
        if (error) {
          console.error('Ошибка загрузки избранного из Cloud Storage:', error);
          favoritePhotosCache = [];
        } else {
          try {
            favoritePhotosCache = data ? JSON.parse(data) : [];
          } catch (e) {
            console.error('Ошибка парсинга избранного:', e);
            favoritePhotosCache = [];
          }
        }
        resolve();
      });
    } else {
      // Fallback для локальной разработки
      try {
        const data = localStorage.getItem('photoFavorites');
        favoritePhotosCache = data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Ошибка загрузки избранного из localStorage:', e);
        favoritePhotosCache = [];
      }
      resolve();
    }
  });
}

// Инициализация избранного при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  await loadFavoritesFromCloud();
});

// Система избранного готова для фото-шаблонов

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
- template_url - основной шаблон (отправляется на обработку) 
- preview_url - превью для показа (показывается пользователю)
- displayName - красивое название, которое показывается пользователю при выборе шаблона
- title - техническое название для интерфейса приложения

ДВОЙНАЯ СИСТЕМА ФАЙЛОВ:
- Превью: Красивые превью шаблонов (для просмотра пользователем)
- Шаблон: Основные файлы шаблонов (для обработки на сервере)
- Пользователь видит только превью - это обеспечивает лучший UX
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
