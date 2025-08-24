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
    // Проверяем, что переменная photoData существует
    if (typeof photoData === 'undefined' || !Array.isArray(photoData)) {
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
    
    // Настраиваем кнопку избранного
    setupFavoriteButton(photo);
    
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
    if (typeof photoData === 'undefined' || !Array.isArray(photoData)) {
        return null;
    }
    return photoData.find(photo => photo.id === id);
}

// Функции готовы для работы с фото-шаблонами

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
            <!-- Fallback изображение убрано для оптимизации -->
            
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
    // fallbackImage убрано для оптимизации
    const errorOverlay = photoContainer.querySelector('.photo-error-overlay');

    if (photoElement) {
        const showPhoto = () => {
            loadingIndicator.style.display = 'none';
            photoElement.style.display = 'block';
        };

        photoElement.addEventListener('load', function() {
            console.log('Основное фото загружено успешно');
            showPhoto();
        });

        photoElement.addEventListener('error', function() {
            console.error('Ошибка загрузки основного фото');
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
        // Создаем красивое уведомление (скрыто до успеха)
        const notificationElement = document.createElement('div');
        notificationElement.className = 'success-notification';
        notificationElement.innerHTML = `
            <div class="success-icon">🎨</div>
            <div class="success-text">Фото отправлено на обработку!</div>
        `;
        notificationElement.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 20px;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-weight: 600;
            font-size: 16px;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: none;
        `;
        
        // Добавляем стили для иконки и текста
        const style = document.createElement('style');
        style.textContent = `
            .success-icon {
                font-size: 24px;
                animation: bounce 0.6s ease-in-out;
            }
            .success-text {
                font-size: 16px;
                font-weight: 600;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-8px); }
                60% { transform: translateY(-4px); }
            }
        `;
        document.head.appendChild(style);
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
            const serverUrl = '/api/photo_template';
            fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonData,
            })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                
                // Показываем красивое уведомление с анимацией
                notificationElement.style.display = 'flex';
                setTimeout(() => {
                    notificationElement.style.opacity = '1';
                    notificationElement.style.transform = 'translateX(-50%) translateY(0)';
                }, 10);
                
                // НЕ закрываем миниапп для фото - пользователь остается в интерфейсе
                
                return response.text().catch(() => '');
            })
            .catch((error) => {
                console.error('Ошибка отправки:', error);
                
                // Меняем содержимое на ошибку
                notificationElement.innerHTML = `
                    <div class="error-icon">❌</div>
                    <div class="error-text">Ошибка отправки</div>
                `;
                notificationElement.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
                notificationElement.style.boxShadow = '0 8px 25px rgba(244, 67, 54, 0.4)';
                
                // Показываем уведомление об ошибке
                notificationElement.style.display = 'flex';
                setTimeout(() => {
                    notificationElement.style.opacity = '1';
                    notificationElement.style.transform = 'translateX(-50%) translateY(0)';
                }, 10);
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
            
            // Меняем содержимое на ошибку
            notificationElement.innerHTML = `
                <div class="error-icon">⚠️</div>
                <div class="error-text">Произошла ошибка</div>
            `;
            notificationElement.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
            notificationElement.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.4)';
            
            // Показываем уведомление об ошибке
            notificationElement.style.display = 'flex';
            setTimeout(() => {
                notificationElement.style.opacity = '1';
                notificationElement.style.transform = 'translateX(-50%) translateY(0)';
            }, 10);
            
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

// Функция для настройки кнопки избранного
function setupFavoriteButton(photo) {
    console.log('=== НАСТРОЙКА КНОПКИ ИЗБРАННОГО ===');
    console.log('Фото:', photo);
    
    const favoriteButton = document.getElementById('favoriteButton');
    const favoriteIcon = favoriteButton?.querySelector('.favorite-icon');
    
    console.log('Кнопка избранного найдена:', !!favoriteButton);
    console.log('Иконка избранного найдена:', !!favoriteIcon);
    
    if (!favoriteButton || !photo) {
        console.log('Кнопка или фото не найдены, выходим');
        return;
    }
    
    // Функция для обновления состояния кнопки
    function updateFavoriteButton() {
        console.log('Обновляем состояние кнопки избранного');
        console.log('Функция isPhotoFavorite доступна:', typeof isPhotoFavorite === 'function');
        
        const isFavorite = (typeof isPhotoFavorite === 'function') ? isPhotoFavorite(photo.id) : false;
        console.log('Фото в избранном:', isFavorite);
        
        if (isFavorite) {
            favoriteIcon.textContent = '★';
            favoriteButton.classList.add('favorite-active');
            console.log('Установлена заполненная звезда');
        } else {
            favoriteIcon.textContent = '☆';
            favoriteButton.classList.remove('favorite-active');
            console.log('Установлена пустая звезда');
        }
    }
    
    // Обновляем состояние при загрузке
    updateFavoriteButton();
    
    // Обработчик клика
    favoriteButton.addEventListener('click', async function() {
        console.log('=== КЛИК ПО КНОПКЕ ИЗБРАННОГО ===');
        console.log('ID фото:', photo.id);
        
        try {
            if (typeof togglePhotoFavorite === 'function') {
                console.log('Вызываем togglePhotoFavorite');
                const newFavoriteStatus = await togglePhotoFavorite(photo.id);
                console.log('Получен новый статус:', newFavoriteStatus);
                
                updateFavoriteButton();
                
                // Показываем уведомление пользователю
                const message = newFavoriteStatus ? 'Добавлено в избранное' : 'Удалено из избранного';
                console.log(message + ': ' + photo.title);
                
                // Тактильная обратная связь
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            } else {
                console.warn('togglePhotoFavorite не найдена');
            }
        } catch (error) {
            console.error('Ошибка при переключении избранного:', error);
        }
        
        console.log('=== КОНЕЦ КЛИКА ПО КНОПКЕ ИЗБРАННОГО ===');
    });
    
    console.log('=== КОНЕЦ НАСТРОЙКИ КНОПКИ ИЗБРАННОГО ===');
}
