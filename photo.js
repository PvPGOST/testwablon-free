// Инициализация Telegram Mini App
// Проверяем, доступен ли Telegram Web App API
const isTelegramEnvironment = window.Telegram && window.Telegram.WebApp;

let tg;
if (isTelegramEnvironment) {
    // Реальный Telegram Web App API
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
} else {
    // Mock для локальной разработки
    tg = {
        ready: () => console.log('Mock: Telegram WebApp ready'),
        expand: () => console.log('Mock: Telegram WebApp expand'),
        sendData: (data) => console.log('Mock sendData:', data),
        close: () => console.log('Mock close'),
        showPopup: (options) => console.log('Mock showPopup:', options)
    };
}

function loadBotParams() {
    // First try to get from global variable
    if (window.botParams && window.botParams.saved) {
        console.log('Loading bot params from global variable');
        return window.botParams;
    }
    
    // Fallback to localStorage
    try {
        const saved = localStorage.getItem('botParams');
        if (saved) {
            window.botParams = JSON.parse(saved);
            console.log('Loading bot params from localStorage');
            return window.botParams;
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
    
    // If nothing found, return empty params
    console.log('No bot params found');
    return {
        bot_id: null,
        user_id: null,
        message_id: null,
        saved: false
    };
}

// Запускаем всё после того как документ загрузится
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что переменная photoData или videoData существует
    const dataToUse = (typeof photoData !== 'undefined' && Array.isArray(photoData)) ? photoData : videoData;
    if (typeof dataToUse === 'undefined' || !Array.isArray(dataToUse)) {
        showError('Ошибка загрузки данных о фото. Перезагрузите страницу или обратитесь к администратору.');
        return;
    }
    
    // Получаем ID фото из URL
    const photoId = getPhotoIdFromURL();
    
    if (!photoId) {
        showError('ID фото не указан в URL');
        return;
    }
    
    // Находим фото по ID
    const photo = findPhotoById(photoId);
    
    if (!photo) {
        showError('Фото не найдено');
        return;
    }
    
    // Устанавливаем заголовок и описание
    document.title = photo.title;
    document.getElementById('photoTitle').textContent = photo.title || 'Без названия';
    
    // Устанавливаем описание шаблона
    const descriptionText = (typeof getDurationText === 'function') ? getDurationText(photo.id) : photo.displayName || 'Фото-шаблон';
    document.getElementById('photoDescription').textContent = descriptionText;
    
    // Отображаем фото
    displayPhoto(photo);
    
    // Кнопки лайков и избранного убраны
    
    // Настраиваем кнопки навигации
    setupBackButton();
    setupConfirmButton(photo);
});

// Получаем id фото из URL параметров
function getPhotoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Категории убраны - функция не используется

// Функция для поиска фото по id в массиве данных
function findPhotoById(id) {
    const dataToUse = (typeof photoData !== 'undefined' && Array.isArray(photoData)) ? photoData : videoData;
    if (typeof dataToUse === 'undefined' || !Array.isArray(dataToUse)) {
        return null;
    }
    return dataToUse.find(photo => photo.id === id);
}

// Совместимость со старыми названиями
function getVideoIdFromURL() {
    return getPhotoIdFromURL();
}

function findVideoById(id) {
    return findPhotoById(id);
}

// Функция для отображения сообщения об ошибке
function showError(message) {
    const photoContainer = document.getElementById('photoContainer');
    if (photoContainer) {
        photoContainer.innerHTML = `
            <div class="error-message" style="
                color: white;
                background-color: rgba(255, 0, 0, 0.7);
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                margin: 20px auto;
                max-width: 80%;
            ">
                ${message}
            </div>
        `;
    }
}

// Функция для отображения фото и его информации
function displayPhoto(photo) {
    if (!photo) {
        showError('Фото не найдено');
        return;
    }
    
    const photoContainer = document.getElementById('photoContainer');
    if (!photoContainer) {
        return;
    }
    
    photoContainer.innerHTML = '';
    
    // Отображаем фото
    photoContainer.innerHTML = `
        <div class="photo-display-container">
            <!-- Индикатор загрузки -->
            <div class="photo-loading-indicator">
                <div class="photo-loading-spinner"></div>
                <div class="photo-loading-text">Загружаем фото...</div>
            </div>
            
            <!-- Fallback изображение -->
            <img class="photo-fallback-image" src="${typeof UNIVERSAL_FALLBACK_IMAGE !== 'undefined' ? UNIVERSAL_FALLBACK_IMAGE : ''}" alt="${photo.title}" style="display: none;">
            
            <!-- Основное фото -->
            <img 
                id="photoElement"
                style="width: 100%; height: auto; min-height: 250px; max-height: 70vh; border: none !important; background-color: #000; object-fit: contain; display: none;"
                src="${photo.image_url}" 
                alt="${photo.title}">
            
            <!-- Overlay с ошибкой -->
            <div class="photo-error-overlay" style="display: none;">
                <div class="photo-error-icon">⚠️</div>
                <div class="photo-error-text">Фото временно недоступно</div>
                <div class="photo-error-subtext">Попробуйте перезагрузить страницу</div>
            </div>
        </div>
    `;
    
    const photoElement = document.getElementById('photoElement');
    const loadingIndicator = photoContainer.querySelector('.photo-loading-indicator');
    const fallbackImage = photoContainer.querySelector('.photo-fallback-image');
    const errorOverlay = photoContainer.querySelector('.photo-error-overlay');

    if (photoElement) {
        const showPhoto = () => {
            loadingIndicator.style.display = 'none';
            fallbackImage.style.display = 'none';
            photoElement.style.display = 'block';
        };

        photoElement.addEventListener('load', function() {
            console.log('Основное фото загружено успешно');
            showPhoto();
        });

        photoElement.addEventListener('error', function() {
            console.error('Ошибка загрузки основного фото');
            loadingIndicator.style.display = 'none';
            fallbackImage.style.display = 'block';
            errorOverlay.style.display = 'flex';
        });

        fallbackImage.addEventListener('load', function() {
            console.log('Fallback изображение загружено');
        });

        fallbackImage.addEventListener('error', function() {
            console.error('Ошибка загрузки fallback изображения');
            loadingIndicator.style.display = 'none';
            errorOverlay.style.display = 'flex';
        });

        // Если фото уже загружено
        if (photoElement.complete && photoElement.naturalHeight !== 0) {
            showPhoto();
        }

        // Таймаут для медленной загрузки
        setTimeout(() => {
            if (photoElement.style.display === 'none' && loadingIndicator.style.display !== 'none') {
                showPhoto();
            }
        }, 3000);
    }
}

// Функция для настройки кнопки "Назад"
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (!backButton) {
        return;
    }
    
    backButton.addEventListener('click', function() {
        // Возвращаемся на главную страницу
        window.location.href = 'index.html';
    });
}

function setupConfirmButton(photo) {
    const confirmButton = document.getElementById('confirmButton');
    if (!confirmButton) {
        return;
    }
    
    if (!photo) {
        confirmButton.style.display = 'none';
        return;
    }

    // Отображаем кнопку
    confirmButton.style.display = 'block';
    
    // Очищаем предыдущие обработчики событий
    const newButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newButton, confirmButton);
    
    newButton.addEventListener('click', function() {
        // Создаем и показываем уведомление
        const notificationElement = document.createElement('div');
        notificationElement.className = 'success-notification';
        notificationElement.textContent = 'Отправка шаблона...';
        notificationElement.style.position = 'fixed';
        notificationElement.style.bottom = '20px';
        notificationElement.style.left = '50%';
        notificationElement.style.transform = 'translateX(-50%)';
        notificationElement.style.backgroundColor = 'rgba(0, 100, 150, 0.9)';
        notificationElement.style.color = 'white';
        notificationElement.style.padding = '15px 20px';
        notificationElement.style.borderRadius = '5px';
        notificationElement.style.zIndex = '1000';
        notificationElement.style.textAlign = 'center';
        
        document.body.appendChild(notificationElement);
        
        try {
             // Получаем данные пользователя Telegram
            let userData = null;
            let telegramUserId = null;
            
            if (isTelegramEnvironment && window.Telegram.WebApp.initDataUnsafe) {
                // Получаем данные пользователя из Telegram WebApp
                userData = window.Telegram.WebApp.initDataUnsafe.user;
                telegramUserId = userData ? userData.id : null;
                
                console.log('Telegram user ID:', telegramUserId);
            } else {
                // Для разработки/тестирования - используем моковые данные
                console.log('Mock environment - using test user ID');
                telegramUserId = '0';
                userData = {
                    id: '0',
                };
            }
            const botParams = loadBotParams();
            
            // Формируем данные для отправки (изменено для фото)
            const requestData = {
                photo_id: photo.id, // Изменено с video_id на photo_id
                bot_id: botParams.bot_id,
                user_id: botParams.user_id,
                message_id: botParams.message_id,
            };
            
            const jsonData = JSON.stringify(requestData);
            console.log('JSON для отправки:', jsonData);
            
            // Отправляем POST на наш API через NGINX
            const serverUrl = '/api/web-app-data';
            fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonData,
            })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                notificationElement.textContent = 'Шаблон отправлен на обработку!';
                notificationElement.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
                return response.text().catch(() => '');
            })
            .catch((error) => {
                console.error('Ошибка отправки:', error);
                notificationElement.textContent = `Ошибка отправки: ${error.message}`;
                notificationElement.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            })
            .finally(() => {
                setTimeout(() => {
                    notificationElement.style.opacity = '0';
                    notificationElement.style.transition = 'opacity 0.5s';
                    setTimeout(() => notificationElement.remove(), 500);
                }, 3000);
            });
        } catch (error) {
            console.error('Ошибка:', error);
            notificationElement.textContent = `Ошибка: ${error.message}`;
            notificationElement.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            
            // Закрываем уведомление об ошибке через 5 секунд
            setTimeout(() => {
                notificationElement.style.opacity = '0';
                notificationElement.style.transition = 'opacity 0.5s';
                
                setTimeout(() => {
                    notificationElement.remove();
                }, 500);
            }, 5000);
        }
    });
}

// Функции лайков и избранного убраны
