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

// Переменная для хранения выбранного фото
let selectedPhotoId = null;
// Совместимость со старым кодом
let selectedVideoId = selectedPhotoId;

// Категории убраны - функция не используется
window.botParams = {
    bot_id: null,
    user_id: null,
    message_id: null,
    saved: false
};
// Function to save bot parameters from URL
function saveBotParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    window.botParams.bot_id = urlParams.get('bot');
    window.botParams.user_id = urlParams.get('user');
    window.botParams.message_id = urlParams.get('message');
    window.botParams.saved = true;
    
    console.log('=== BOT PARAMETERS SAVED ===');
    console.log('Bot ID:', window.botParams.bot_id);
    console.log('User ID:', window.botParams.user_id);
    console.log('Message ID:', window.botParams.message_id);
    console.log('=== END SAVE ===');
    
    // Also save to localStorage as backup
    try {
        localStorage.setItem('botParams', JSON.stringify(window.botParams));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
    
    return window.botParams;
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

// Функция для создания элементов превью фото
function createPhotoPreview(photo) {
    const previewElement = document.createElement('div');
    previewElement.className = 'photo-preview';
    previewElement.setAttribute('data-id', photo.id);
    
    // Убираем NEW бейджи - категории не используются
    const newBadge = '';
    
    // Добавляем фото превью
    previewElement.innerHTML = `
        <div class="photo-container">
            <!-- Индикатор загрузки -->
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка...</div>
            </div>
            
            <!-- Основное фото -->
            <img class="preview-image" src="${photo.image_url}" alt="${photo.title}" style="display: none;">
            
            <!-- Fallback изображение (показывается при ошибке) -->
            <img class="fallback-image" src="${typeof UNIVERSAL_FALLBACK_IMAGE !== 'undefined' ? UNIVERSAL_FALLBACK_IMAGE : ''}" alt="${photo.title}" style="display: none;">
            
            <!-- Overlay с информацией об ошибке -->
            <div class="error-overlay" style="display: none;">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Фото недоступно</div>
            </div>
            
            ${newBadge}
        </div>
    `;
    
    // Получаем элементы для работы с превью
    const imageElement = previewElement.querySelector('.preview-image');
    const loadingIndicator = previewElement.querySelector('.loading-indicator');
    const fallbackImage = previewElement.querySelector('.fallback-image');
    const errorOverlay = previewElement.querySelector('.error-overlay');
    
    // Обработчик успешной загрузки фото
    imageElement.addEventListener('load', function() {
        console.log(`Фото ${photo.id} загружено`);
        
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
        
        // Показываем фото
        imageElement.style.display = 'block';
    });
    
    // Обработчик ошибки загрузки фото
    imageElement.addEventListener('error', function(e) {
        console.error(`Ошибка загрузки фото ${photo.id}:`, e);
        
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
        
        // Показываем fallback и ошибку
        fallbackImage.style.display = 'block';
        errorOverlay.style.display = 'flex';
    });
    
    // Обработчик загрузки fallback изображения
    fallbackImage.addEventListener('load', function() {
        console.log(`Fallback изображение ${photo.id} загружено`);
        // Fallback изображение загружено, но показываем его только при ошибке основного фото
    });
    
    // Обработчик ошибки загрузки fallback изображения
    fallbackImage.addEventListener('error', function() {
        console.error(`Ошибка загрузки fallback изображения ${photo.id}`);
        loadingIndicator.style.display = 'none';
        errorOverlay.style.display = 'flex';
    });
    
    // Таймаут для фото, которые долго загружаются (5 секунд)
    setTimeout(() => {
        if (imageElement.style.display === 'none' && loadingIndicator.style.display !== 'none') {
            console.warn(`Фото ${photo.id} не загрузилось за 5 секунд, показываем fallback`);
            loadingIndicator.style.display = 'none';
            fallbackImage.style.display = 'block';
            errorOverlay.style.display = 'flex';
        }
    }, 5000);
    
    // Добавляем обработчик клика для перехода к странице просмотра фото
    previewElement.addEventListener('click', () => {
        // Сначала убираем класс 'selected' у всех элементов
        document.querySelectorAll('.photo-preview, .video-preview').forEach(el => el.classList.remove('selected'));
        
        // Добавляем класс 'selected' только выбранному элементу
        previewElement.classList.add('selected');
        
        // Сохраняем ID выбранного фото в localStorage
        localStorage.setItem('selectedPhotoId', photo.id);
        localStorage.setItem('selectedVideoId', photo.id); // Совместимость
        
        // Переходим на страницу фото без категорий
        window.location.href = `photo.html?id=${photo.id}`;
    });
    
    return previewElement;
}

// Совместимость со старым кодом
function createVideoPreview(video) {
    return createPhotoPreview(video);
}

// Функции лайков и избранного убраны

// Функции категорий удалены - теперь простая сетка

// Функция для загрузки и отображения сетки фото
async function loadPhotoGrid() {
    const photoGridElement = document.getElementById('photoGrid') || document.getElementById('videoGrid');
    
    // Очищаем сетку перед загрузкой новых данных
    photoGridElement.innerHTML = '';
    
    // Проверяем, есть ли данные в глобальной переменной (photoData или videoData)
    const dataToUse = (typeof photoData !== 'undefined' && Array.isArray(photoData)) ? photoData : videoData;
    if (typeof dataToUse !== 'undefined' && Array.isArray(dataToUse)) {
        
        if (dataToUse.length === 0) {
            photoGridElement.innerHTML = '<p class="no-videos">🔥 Скоро тут будет горячо! 🔥<br><span class="coming-soon">Новые фото уже готовятся...</span></p>';
            return;
        }
        
        // Загружаем все фото
        dataToUse.forEach(photo => {
            const previewElement = createPhotoPreview(photo);
            photoGridElement.appendChild(previewElement);
        });
    } else {
        // Если данных нет, показываем сообщение об ошибке
        photoGridElement.innerHTML = '<p class="error-message">Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>';
    }
    
    // Проверяем, есть ли сохраненный выбор
    const savedPhotoId = localStorage.getItem('selectedPhotoId') || localStorage.getItem('selectedVideoId');
    if (savedPhotoId) {
        // Находим элемент и выделяем его
        const element = document.querySelector(`.photo-preview[data-id="${savedPhotoId}"], .video-preview[data-id="${savedPhotoId}"]`);
        if (element) {
            element.classList.add('selected');
            selectedPhotoId = savedPhotoId;
        }
    }
}

// Совместимость со старым кодом
async function loadVideoGrid() {
    return loadPhotoGrid();
}
// Загружаем категории и сетку видео при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    saveBotParamsFromURL();

    try {
        await loadPhotoGrid();
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        await loadPhotoGrid();
    }
}); 