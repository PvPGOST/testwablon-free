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
    
    // Добавляем фото превью с ленивой загрузкой
    previewElement.innerHTML = `
        <div class="photo-container">
            <!-- Индикатор загрузки -->
            <div class="loading-indicator" style="display: none;">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка...</div>
            </div>
            
            <!-- Плейсхолдер до загрузки (для ленивой загрузки) -->
            <div class="preview-placeholder" style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 14px;
                border-radius: 12px;
            ">
                🖼️ Загрузится при прокрутке
            </div>
            
            <!-- Превью изображение (для ленивой загрузки) -->
            <img class="preview-image lazy-load" 
                 data-src="${photo.preview_image || photo.image_url}" 
                 alt="${photo.title}" 
                 style="display: none;">
            
            <!-- Overlay с информацией об ошибке -->
            <div class="error-overlay" style="display: none;">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Фото недоступно</div>
            </div>
            
            ${newBadge}
        </div>
    `;
    
    // Ленивая загрузка изображений - изображения загружаются только при появлении в области видимости
    // Этот элемент будет обработан системой ленивой загрузки
    
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
// === СИСТЕМА ЛЕНИВОЙ ЗАГРУЗКИ ===

// Intersection Observer для ленивой загрузки превью фото
let lazyLoadObserver = null;

// Функция инициализации ленивой загрузки
function initLazyLoading() {
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver не поддерживается, загружаем все изображения сразу');
        loadAllImagesImmediately();
        return;
    }
    
    // Создаем наблюдатель
    lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadPreviewImage(entry.target);
                lazyLoadObserver.unobserve(entry.target);
            }
        });
    }, {
        // Загружаем изображения за 200px до появления в области видимости
        rootMargin: '200px',
        threshold: 0.1
    });
    
    // Наблюдаем за всеми превью элементами
    document.querySelectorAll('.photo-preview').forEach(element => {
        lazyLoadObserver.observe(element);
    });
}

// Функция загрузки превью изображения
function loadPreviewImage(previewElement) {
    const previewImage = previewElement.querySelector('.preview-image.lazy-load');
    const loadingIndicator = previewElement.querySelector('.loading-indicator');
    const placeholder = previewElement.querySelector('.preview-placeholder');
    const errorOverlay = previewElement.querySelector('.error-overlay');
    
    if (!previewImage || !previewImage.dataset.src) {
        console.warn('Нет данных для загрузки превью фото');
        return;
    }
    
    // Показываем индикатор загрузки
    placeholder.style.display = 'none';
    loadingIndicator.style.display = 'flex';
    
    // Обработчик успешной загрузки
    previewImage.addEventListener('load', function() {
        console.log(`Превью фото загружено: ${previewImage.src}`);
        loadingIndicator.style.display = 'none';
        previewImage.style.display = 'block';
    }, { once: true });
    
    // Обработчик ошибки загрузки
    previewImage.addEventListener('error', function() {
        console.error(`Ошибка загрузки превью фото: ${previewImage.src}`);
        loadingIndicator.style.display = 'none';
        errorOverlay.style.display = 'flex';
    }, { once: true });
    
    // Таймаут для медленных соединений (5 секунд)
    const timeout = setTimeout(() => {
        if (loadingIndicator.style.display !== 'none') {
            console.warn(`Превью фото долго загружается: ${previewImage.dataset.src}`);
            loadingIndicator.style.display = 'none';
            errorOverlay.style.display = 'flex';
        }
    }, 5000);
    
    // Убираем таймаут при успешной загрузке
    previewImage.addEventListener('load', () => clearTimeout(timeout), { once: true });
    previewImage.addEventListener('error', () => clearTimeout(timeout), { once: true });
    
    // Начинаем загрузку
    previewImage.src = previewImage.dataset.src;
    previewImage.classList.remove('lazy-load');
}

// Fallback для браузеров без поддержки Intersection Observer
function loadAllImagesImmediately() {
    document.querySelectorAll('.photo-preview').forEach(previewElement => {
        loadPreviewImage(previewElement);
    });
}

// Переменная для отслеживания режима избранного
let showingFavorites = false;

// Функция для переключения между всеми фото и избранными
function toggleFavoriteView() {
    showingFavorites = !showingFavorites;
    const toggleButton = document.getElementById('favoritesToggle');
    const toggleIcon = toggleButton?.querySelector('.favorites-toggle-icon');
    
    if (showingFavorites) {
        // Показываем только избранные
        loadFavoritePhotoGrid();
        toggleIcon.textContent = '★';
        toggleButton.classList.add('active');
    } else {
        // Показываем все фото
        loadPhotoGrid();
        toggleIcon.textContent = '☆';
        toggleButton.classList.remove('active');
    }
}

// Функция для загрузки только избранных фото
async function loadFavoritePhotoGrid() {
    console.log('=== ЗАГРУЗКА ИЗБРАННЫХ ФОТО ===');
    const photoGridElement = document.getElementById('photoGrid') || document.getElementById('videoGrid');
    
    // Очищаем сетку перед загрузкой новых данных
    photoGridElement.innerHTML = '';
    
    // Проверяем кэш избранного
    console.log('favoritePhotosCache:', favoritePhotosCache);
    console.log('Функция getFavoritePhotos доступна:', typeof getFavoritePhotos === 'function');
    
    // Получаем избранные фото
    const favoritePhotos = getFavoritePhotos();
    console.log('Найдено избранных фото:', favoritePhotos.length);
    console.log('Избранные фото:', favoritePhotos);
    
    if (favoritePhotos.length === 0) {
        photoGridElement.innerHTML = '<p class="no-videos">⭐ У вас пока нет избранных шаблонов ⭐<br><span class="coming-soon">Добавьте шаблоны в избранное нажав на звездочку</span></p>';
        return;
    }
    
    // Загружаем избранные фото
    favoritePhotos.forEach(photo => {
        const previewElement = createPhotoPreview(photo);
        photoGridElement.appendChild(previewElement);
    });
    
    // Инициализируем ленивую загрузку
    setTimeout(() => {
        initLazyLoading();
    }, 100);
}

// Загружаем сетку фото при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    saveBotParamsFromURL();

    try {
        // Ждем загрузки избранного из Cloud Storage
        if (typeof loadFavoritesFromCloud === 'function') {
            await loadFavoritesFromCloud();
            console.log('Избранное загружено:', favoritePhotosCache);
        } else {
            console.warn('loadFavoritesFromCloud не найдена');
        }
        
        await loadPhotoGrid();
        
        // Настраиваем кнопку переключения избранного
        const favoritesToggle = document.getElementById('favoritesToggle');
        if (favoritesToggle) {
            favoritesToggle.addEventListener('click', toggleFavoriteView);
        }
        
        // Инициализируем ленивую загрузку после создания элементов
        setTimeout(() => {
            initLazyLoading();
        }, 100);
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        
        // Все равно пытаемся загрузить избранное
        try {
            if (typeof loadFavoritesFromCloud === 'function') {
                await loadFavoritesFromCloud();
            }
        } catch (e) {
            console.warn('Ошибка загрузки избранного:', e);
        }
        
        await loadPhotoGrid();
        
        // Все равно инициализируем ленивую загрузку
        setTimeout(() => {
            initLazyLoading();
        }, 100);
    }
}); 