// Telegram Web App initialization
let tg = null;

// Loading screen management - ВРЕМЕННО ОТКЛЮЧЕНО
/*
let loadingProgress = 0;
let loadingSteps = [
    { name: 'Инициализация...', progress: 10 },
    { name: 'Грузим змей...', progress: 30 },
    { name: 'Подготовка к сражениям', progress: 60 },
    { name: 'Подписываем блокчейн', progress: 90 },
    { name: 'Готово!', progress: 100 }
];

function updateLoadingProgress(step, customText = null) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const loadingText = document.querySelector('.loading-text');
    
    if (progressFill && progressText && loadingText) {
        const targetProgress = loadingSteps[step]?.progress || step;
        const text = customText || loadingSteps[step]?.name || 'Загрузка...';
        
        loadingProgress = targetProgress;
        progressFill.style.width = `${targetProgress}%`;
        progressText.textContent = `${targetProgress}%`;
        loadingText.textContent = text;
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.querySelector('.app-container');
    
    if (loadingScreen && appContainer) {
        // Скрываем экран загрузки
        loadingScreen.classList.add('hidden');
        
        // Показываем основное приложение
        appContainer.classList.add('loaded');
        
        // Удаляем экран загрузки после анимации
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}
*/

// Initialize Telegram Web App
function initTelegramApp() {
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg) {
            tg.expand();
            tg.setHeaderColor('#16213e');
            tg.setBackgroundColor('#16213e');
            tg.enableClosingConfirmation();
            // Блокируем жест закрытия (свайп снизу) и просим Telegram не закрывать мини‑эпп случайно
            try { tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch(_) {}
            try { tg.isClosingConfirmationEnabled || tg.enableClosingConfirmation(); } catch(_) {}
        }
    } catch (e) {
        console.warn('Telegram WebApp API unavailable');
    }
}

// Set viewport height for mobile devices
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update on resize
    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

// Safe area handling for different devices
function handleSafeAreas() {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
    
    // Apply safe area insets
    document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
    
    // Update top bar position
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.paddingTop = `calc(20px + ${safeAreaTop})`;
    }
}

// Multiplier button functionality
function initMultiplierButtons() {
    const multiplierBtns = document.querySelectorAll('.multiplier-btn');
    
    multiplierBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Check if this is the custom multiplier button
            if (this.classList.contains('custom-multiplier-btn')) {
                openCustomMultiplierModal();
                return;
            }
            
            // Remove active class from all buttons
            multiplierBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get multiplier value
            const multiplier = parseInt(this.getAttribute('data-multiplier'));
            console.log('Selected multiplier:', multiplier);
            
            // Update snake length
            if (window.snakeAnimation) {
                window.snakeAnimation.setMultiplier(multiplier);
            }
            
            // Update play button texts
            updatePlayButtonTexts(multiplier);
            
            // Add animation class
            this.classList.add('pulse-animation');
            setTimeout(() => {
                this.classList.remove('pulse-animation');
            }, 300);
        });
    });
}

// Update play button texts
function updatePlayButtonTexts(multiplier) {
    const playTonText = document.getElementById('play-ton-text');
    if (playTonText) {
        playTonText.textContent = `Играть ${multiplier}`;
    }
    
    const playStarText = document.getElementById('play-star-text');
    if (playStarText) {
        const starAmount = 220 * multiplier;
        playStarText.textContent = `Играть ${starAmount}`;
    }
}

// Custom Multiplier Modal functionality
function initCustomMultiplierModal() {
    const modal = document.getElementById('custom-multiplier-modal');
    const closeBtn = document.getElementById('close-modal');
    const customInput = document.getElementById('custom-value');
    const keyBtns = document.querySelectorAll('.key-btn');
    const modalPlayBtns = document.querySelectorAll('.modal-play-btn');
    
    // Close modal handlers
    closeBtn.addEventListener('click', closeCustomMultiplierModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCustomMultiplierModal();
        }
    });
    
    // Keyboard handlers
    keyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            handleKeyPress(key);
        });
    });
    
    // Modal play button handlers
    modalPlayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const inputValue = customInput.value;
            const customValue = parseFloat(inputValue);
            
            // Check if input is valid
            if (!inputValue || isNaN(customValue) || customValue <= 0) {
                showNotification('Введите корректную сумму');
                return;
            }
            
            const isStarBtn = btn.classList.contains('modal-play-star');
            
            console.log(`Custom ${isStarBtn ? 'Star' : 'TON'} game with multiplier:`, customValue);
            
            // Apply custom multiplier to snake
            if (window.snakeAnimation) {
                window.snakeAnimation.setMultiplier(customValue);
            }
            
            // Update main play buttons
            updatePlayButtonTexts(customValue);
            
            // Update multiplier buttons state
            const multiplierBtns = document.querySelectorAll('.multiplier-btn');
            multiplierBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.custom-multiplier-btn').classList.add('active');
            
            closeCustomMultiplierModal();
            showNotification(`Запуск игры с множителем ${customValue}`);
        });
    });
}

function openCustomMultiplierModal() {
    const modal = document.getElementById('custom-multiplier-modal');
    const customInput = document.getElementById('custom-value');
    
    // Reset input to empty
    customInput.value = '';
    updatePreview();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeCustomMultiplierModal() {
    const modal = document.getElementById('custom-multiplier-modal');
    
    // Hide modal
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function handleKeyPress(key) {
    const customInput = document.getElementById('custom-value');
    let currentValue = customInput.value;
    
    if (key === 'delete') {
        // Remove last character
        currentValue = currentValue.slice(0, -1);
    } else if (key === '.') {
        // Add decimal point only if not already present and not empty
        if (currentValue && !currentValue.includes('.')) {
            currentValue += key;
        } else if (!currentValue) {
            currentValue = '0.';
        }
    } else {
        // Add number
        if (currentValue === '0' && key !== '.') {
            currentValue = key;
        } else {
            currentValue += key;
        }
    }
    
    // Validate and limit input
    if (currentValue && currentValue !== '.' && currentValue !== '0.') {
        let numValue = parseFloat(currentValue);
        if (numValue > 999.9) {
            currentValue = '999.9';
        }
    }
    
    customInput.value = currentValue;
    updatePreview();
}

function updatePreview() {
    const customInput = document.getElementById('custom-value');
    const modalTonText = document.getElementById('modal-ton-text');
    const modalStarText = document.getElementById('modal-star-text');
    
    const inputValue = customInput.value;
    const multiplier = parseFloat(inputValue) || 0;
    const starsAmount = Math.round(220 * multiplier);
    
    // Update button texts
    if (inputValue === '' || multiplier === 0) {
        modalTonText.textContent = 'Играть TON';
        modalStarText.textContent = 'Играть Звезды';
    } else {
        modalTonText.textContent = `Играть ${multiplier}`;
        modalStarText.textContent = `Играть ${starsAmount}`;
    }
}

// Play button functionality
function initPlayButtons() {
    const playBtns = document.querySelectorAll('.play-btn');
    
    playBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const isTonGame = this.classList.contains('play-ton');
            const gameType = isTonGame ? 'TON' : 'Star';
            
            console.log(`Starting ${gameType} game`);
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Here you would typically start the game
            // For now, just show a message
            showNotification(`Запуск игры ${gameType}`);
        });
    });
}

// Shop filter functionality
function initShopFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filters
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Get filter type
            const filterType = this.getAttribute('data-filter');
            console.log('Selected filter:', filterType);
            
            // Подавляем снэп и сохраняем позицию скролла на время фильтрации
            const prevY = window.pageYOffset || document.documentElement.scrollTop;
            suppressSnap(900);
            
            // Применяем фильтр
            filterShopItems(filterType);
            
            // После перерисовки раскладки возвращаем позицию, не выходя за пределы
            setTimeout(() => {
                const maxY = Math.max(0, (document.documentElement.scrollHeight - window.innerHeight));
                const targetY = Math.min(prevY, maxY);
                window.scrollTo(0, targetY);
            }, 50);
        });
    });
}

// Filter shop items based on selected category
function filterShopItems(filterType) {
    const shopItems = document.querySelectorAll('.shop-item');
    
    shopItems.forEach(item => {
        // Здесь должен быть реальный критерий; пока: показываем все при 'all'
        const shouldShow = filterType === 'all' ? true : Math.random() > 0.5;
        item.classList.toggle('hidden', !shouldShow);
    });
}

// Navigation buttons functionality
function initNavigationButtons() {
    const leftNav = document.querySelector('.nav-left');
    const rightNav = document.querySelector('.nav-right');
    
    if (leftNav) {
        leftNav.addEventListener('click', () => {
            console.log('Navigate left - previous snake');
            if (window.snakeAnimation) {
                window.snakeAnimation.previousSnake();
            }
        });
    }
    
    if (rightNav) {
        rightNav.addEventListener('click', () => {
            console.log('Navigate right - next snake');
            if (window.snakeAnimation) {
                window.snakeAnimation.nextSnake();
            }
        });
    }
}

// Edit button functionality
function initEditButton() {
    const editBtn = document.querySelector('.edit-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openCharacterEditModal();
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('light');
                else if (navigator.vibrate) navigator.vibrate(10);
            } catch(_) {}
        });
    }
}

// Help button functionality
function initHelpButton() {
    const helpBtn = document.querySelector('.help-btn');
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            openHelpModal();
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('light');
                else if (navigator.vibrate) navigator.vibrate(10);
            } catch(_) {}
        });
    }
}

// Rewards: init "Проверить" buttons (no navigation yet)
function initRewardCheckButtons() {
    const buttons = document.querySelectorAll('.reward-check');
    if (!buttons.length) return;
    const haptic = (kind = 'light') => {
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.HapticFeedback) {
                if (kind === 'selection' && tg.HapticFeedback.selectionChanged) tg.HapticFeedback.selectionChanged();
                else if (tg.HapticFeedback.impactOccurred) tg.HapticFeedback.impactOccurred(kind);
            } else if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        } catch (_) {}
    };
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // не переходим по ссылке блока и не скроллим
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            haptic('soft');
            btn.disabled = true;
            showNotification('Проверяем задание...');
            setTimeout(() => {
                btn.disabled = false;
                showNotification('Готово. Проверка выполнена');
            }, 700);
        }, { passive: false });
    });
}

// Settings button functionality
function initSettingsButton() {
    const settingsBtn = document.querySelector('.settings-btn');
    if (!settingsBtn) return;
    
    const sheet = document.getElementById('settings-modal');
    if (!sheet) return;
    
    // Функция закрытия модального окна
    const closeSettingsModal = () => {
        sheet.style.display = 'none';
        // Восстанавливаем скролл
        try {
            const b = document.body;
            b.style.position = '';
            b.style.top = '';
            b.style.left = '';
            b.style.right = '';
            b.style.width = '';
            if (window.__sheetScrollY !== undefined) {
                window.scrollTo(0, window.__sheetScrollY);
                delete window.__sheetScrollY;
            }
        } catch(_) {}
        // Скрываем Telegram Back Button
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            tg?.BackButton?.hide?.();
        } catch(_) {}
    };
    
    // Открытие модального окна
    settingsBtn.addEventListener('click', () => {
        sheet.style.display = 'block';
        
        // Lock background scroll
        try {
            window.__sheetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const b = document.body;
            b.style.position = 'fixed';
            b.style.top = `-${window.__sheetScrollY}px`;
            b.style.left = '0';
            b.style.right = '0';
            b.style.width = '100%';
        } catch(_) {}
        // Показать Telegram Back Button
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            tg?.BackButton?.show?.();
        } catch(_) {}
        
        // Haptic feedback
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('light');
            else if (navigator.vibrate) navigator.vibrate(10);
        } catch(_) {}
    });
    
    // Закрытие по клику вне модального окна
    sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSettingsModal(); });
    // Блокируем скролл на оверлее
    sheet.addEventListener('touchmove', (e) => { 
        if (e.cancelable) e.preventDefault(); 
    }, { passive: false });
    sheet.addEventListener('wheel', (e) => { 
        e.preventDefault(); 
    }, { passive: false });
    // Свайп вниз для закрытия
    let startY = 0, dy = 0, dragging = false;
    sheet.addEventListener('touchstart', (e) => { if (!e.touches.length) return; dragging = true; startY = e.touches[0].clientY; dy = 0; }, { passive: true });
    sheet.addEventListener('touchmove', (e) => { if (!dragging) return; dy = e.touches[0].clientY - startY; if (dy > 0) content.style.transform = `translateY(${dy}px)`; }, { passive: true });
    sheet.addEventListener('touchend', () => { if (!dragging) return; dragging = false; if (dy > 80) closeSettingsModal(); content.style.transform = ''; }, { passive: true });
    // Telegram Back Button
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && tg.BackButton) {
            tg.BackButton.onClick(closeSettingsModal);
        }
    } catch(_) {}
    // Убираем ссылку на несуществующую backBtn
    // Языки
    sheet.querySelectorAll('.lang-option').forEach(btn => btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        showNotification(`Язык: ${lang}`);
    }));
    // Поддержка
    const sup = document.getElementById('support-btn');
    sup?.addEventListener('click', () => {
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            tg?.openTelegramLink?.('https://t.me/your_support_here');
        } catch(_) {}
    });
}

// Swap wallet media to smaller versions when available
function optimizeWalletMedia() {
    // Поддержка .tgs (Lottie) при наличии
    const lotties = document.querySelectorAll('.wallet-lottie[data-tgs]');
    if (window.lottie && window.pako && lotties.length) {
        lotties.forEach(el => {
            const url = el.getAttribute('data-tgs');
            fetch(url)
                .then(r => r.arrayBuffer())
                .then(buf => window.pako.inflate(new Uint8Array(buf), { to: 'string' }))
                .then(json => {
                    window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, animationData: JSON.parse(json) });
                })
                .catch(() => {});
        });
    }
    // Инициализация lottie для других секций (кубок в лидерборде)
    const lottieAny = document.querySelectorAll('.lottie[data-tgs]');
    if (window.lottie && window.pako && lottieAny.length) {
        lottieAny.forEach(el => {
            const url = el.getAttribute('data-tgs');
            fetch(url)
                .then(r => r.arrayBuffer())
                .then(buf => window.pako.inflate(new Uint8Array(buf), { to: 'string' }))
                .then(json => {
                    window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, animationData: JSON.parse(json) });
                })
                .catch(() => {});
        });
    }
    // WebP/GIF больше не используем
}

// Add currency button functionality
function initAddCurrencyButton() {
    const addCurrencyBtn = document.querySelector('.add-currency-btn');
    
    if (addCurrencyBtn) {
        addCurrencyBtn.addEventListener('click', () => {
            console.log('Add currency');
            showNotification('Пополнение баланса');
        });
    }
}

// Bottom navigation functionality
function initBottomNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const views = {
        0: 'view-leaderboard',
        1: 'view-referrals',
        2: 'view-home',
        3: 'view-rewards',
        4: 'view-withdraw'
    };

    const showView = (id) => {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('visible');
            v.setAttribute('aria-hidden', 'true');
        });
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('visible');
            el.setAttribute('aria-hidden', 'false');
        }
        // ленивое наполнение нужной страницы
        if (id === 'view-leaderboard') {
            const lb = document.getElementById('lb-list');
            if (lb && !lb.children.length) populateLeaderboard();
        } else if (id === 'view-referrals') {
            const rl = document.getElementById('ref-list');
            if (rl && !rl.children.length) populateReferrals();
        }
    };

    // лёгкая тактильная отдача
    const haptic = (kind = 'selection') => {
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.HapticFeedback) {
                if (kind === 'selection' && tg.HapticFeedback.selectionChanged) tg.HapticFeedback.selectionChanged();
                else if (tg.HapticFeedback.impactOccurred) tg.HapticFeedback.impactOccurred(kind);
            } else if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        } catch (_) {}
    };

    let activeIndex = 2; // текущее состояние

    const setActive = (index) => {
        activeIndex = index;
        navItems.forEach((n, i) => n.classList.toggle('active', i === index));
        const viewId = views[index];
        if (viewId) {
            showView(viewId);
            // хаптик при переходе между вкладками
            haptic('light');
            // Всегда начинаем новую вкладку сверху
            window.scrollTo(0, 0);
            // Кошелёк: показываем help/settings, но скрываем баланс мгновенно
            const topLeft = document.querySelector('.top-left-actions');
            if (topLeft) {
                topLeft.style.visibility = '';
            }
            const currency = document.querySelector('.currency-display');
            if (currency) {
                currency.style.display = (viewId === 'view-withdraw') ? 'none' : '';
            }
        }
    };

    // начальное состояние — home (индекс 2)
    setActive(2);

    navItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // хаптик при нажатии кнопки (всегда)
            haptic('soft');

            // Повторный клик по текущей вкладке: не перезагружаем view, просто скроллим к верху
            if (index === activeIndex) {
                window.scrollTo(0, 0);
            } else {
                setActive(index);
            }

            this.style.transform = 'scale(0.94)';
            setTimeout(() => { this.style.transform = ''; }, 120);
        });
    });
}

// Show notification (placeholder for actual implementation)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Compute vertical position at the same level as top bar controls
    let notifTop = 20;
    try {
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            const rect = topBar.getBoundingClientRect();
            // приблизительно по центру топ-бара
            notifTop = Math.max(10, Math.round(rect.top + rect.height / 2 - 20));
        }
    } catch(_) {}

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 123, 255, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 10000;
        font-weight: 500;
        animation: slideDown 0.3s ease;
        pointer-events: none;
    `;
    notification.style.top = `${notifTop}px`;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add liquid glass effect to elements
function addLiquidGlassEffect() {
    const elements = document.querySelectorAll('.shop-section, .currency-display, .connection-status');
    
    elements.forEach(element => {
        element.classList.add('liquid-glass');
    });
}

// Handle device orientation changes
function handleOrientationChange() {
    setTimeout(() => {
        setViewportHeight();
        handleSafeAreas();
        // Пересчитываем ограничения прокрутки при смене ориентации
        if (isScrollInitialized) {
            initScrollControl();
        }
    }, 100);
}

// Контроль прокрутки страницы
let minScrollTop = 0; // Минимальная позиция прокрутки (оставляем 0, чтобы не резать верх)
let isScrollInitialized = false;
let isSnapping = false;       // блокировка повторного срабатывания во время анимации
let snapIdleTimer = null;     // таймер паузы перед снэпом
let suppressSnapUntil = 0;
let lastScrollDir = 0;        // 1 = вниз, -1 = вверх, 0 = нет
let lastSnappedTo = null;     // 'top' | 'shop' | null
let lastSnapY = 0;
let initialSnapArmed = true;  // мгновенный снеп при первом малом прокруте вниз от верха

function suppressSnap(ms = 800) {
    suppressSnapUntil = Date.now() + ms;
}

function isSnapSuppressed() {
    return Date.now() < suppressSnapUntil;
}

function snapTo(targetY, anchorKey) {
    isSnapping = true;
    lastSnappedTo = anchorKey;
    lastSnapY = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setTimeout(() => { isSnapping = false; }, 350);
}

function getSafeTop(value) {
	return Math.max(0, Math.round(value));
}

const SHOP_SNAP_OFFSET = 16; // остановка чуть выше шапки магазина
const SHOP_EXIT_THRESHOLD = 24; // на сколько выше рамки магазина нужно выйти, чтобы снэпнуть кверху

function getShopHeadTop() {
	const shopHead = document.querySelector('.shop-head');
	if (!shopHead) return null;
	const rect = shopHead.getBoundingClientRect();
	return getSafeTop(window.pageYOffset + rect.top - SHOP_SNAP_OFFSET);
}

function getShopSectionTop() {
	const section = document.querySelector('.shop-section');
	if (!section) return null;
	const rect = section.getBoundingClientRect();
	return getSafeTop(window.pageYOffset + rect.top);
}

function getPlayButtonsTop() {
	const play = document.querySelector('.play-buttons');
	if (!play) return null;
	const rect = play.getBoundingClientRect();
	// небольшой зазор, чтобы не обрезать сверху
	return getSafeTop(window.pageYOffset + rect.top - 8);
}

function getTopAnchor() {
	// верх страницы
	return 0;
}

function initScrollControl() {
	// только отмечаем инициализацию, без принудительной прокрутки
	minScrollTop = 0;
	isScrollInitialized = true;
	initialSnapArmed = true; // включаем начальный снеп
}

function handleScrollRestriction() {
	// больше не режем верх — позволяем прокручивать к 0
	if (!isScrollInitialized) return;
}

function snapIfNearAnchors() {
    if (isSnapping || isSnapSuppressed()) return;
    const y = window.pageYOffset || document.documentElement.scrollTop;

    const topAnchor = getTopAnchor(); // 0
    const shopTop = getShopHeadTop();
    const sectionTop = getShopSectionTop();
    const playTop = getPlayButtonsTop();

    const movedEnough = Math.abs(y - lastSnapY) > 150;

    // Вниз от самого верха → к шапке магазина (только если реально близко к верху)
    if (lastScrollDir > 0) {
        const nearTopStart = y <= (topAnchor + 24);
        if (nearTopStart && shopTop !== null && (lastSnappedTo !== 'shop' || movedEnough)) {
            snapTo(shopTop, 'shop');
            return;
        }
    }

    // Вверх: если вышли НАД рамкой магазина чуть больше порога — сразу к самому верху
    if (lastScrollDir < 0) {
        if (sectionTop !== null && y <= (sectionTop - SHOP_EXIT_THRESHOLD) && (lastSnappedTo !== 'top' || movedEnough)) {
            snapTo(topAnchor, 'top');
            return;
        }
        if (playTop !== null) {
            // если мы слишком далеко ушли вниз (более экрана от шапки), не снэпаем
            if (y > (shopTop || 0) + window.innerHeight) return;
            if (y <= (playTop + 24) && (lastSnappedTo !== 'top' || movedEnough)) {
                snapTo(topAnchor, 'top');
                return;
            }
        }
    }
}

function setupScrollListener() {
    let scrollTimeout;
    let lastY = window.pageYOffset || document.documentElement.scrollTop;

    const scheduleSnap = () => {
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        const delta = currentY - lastY;
        const topAnchor = getTopAnchor();
        lastScrollDir = delta === 0 ? 0 : (delta > 0 ? 1 : -1);

        // МГНОВЕННЫЙ начальный снеп: любое смещение вниз от самого верха (>=1px)
        if (initialSnapArmed && currentY > (topAnchor + 0) && lastScrollDir >= 0 && !isSnapping && !isSnapSuppressed()) {
            const shopTop = getShopHeadTop();
            if (shopTop !== null) {
                initialSnapArmed = false; // однократно
                snapTo(shopTop, 'shop');
                lastY = currentY;
                return;
            }
        }

        // Немедленный directional snap: первый явный свайп вниз, начавшийся у верха
        const wasNearTop = lastY <= (topAnchor + 12);
        if (lastScrollDir > 0 && wasNearTop && !isSnapping && !isSnapSuppressed()) {
            const shopTop = getShopHeadTop();
            if (shopTop !== null) {
                snapTo(shopTop, 'shop');
                lastY = currentY; // обновим последнее значение
                return;
            }
        }

        lastY = currentY;

        // Мягкий directional-only снэп после паузы
        if (snapIdleTimer) clearTimeout(snapIdleTimer);
        snapIdleTimer = setTimeout(() => {
            if (!isSnapping && !isSnapSuppressed()) snapIfNearAnchors();
        }, 140);
    };

    window.addEventListener('scroll', scheduleSnap, { passive: true });
    window.addEventListener('touchmove', scheduleSnap, { passive: true });
    window.addEventListener('wheel', scheduleSnap, { passive: true });
    window.addEventListener('touchend', scheduleSnap, { passive: true });
    window.addEventListener('pointerup', scheduleSnap, { passive: true });
}

// Тап по области магазина: мгновенный снэп к шапке магазина
function initTapSnapToShop() {
	const shopContent = document.querySelector('.shop-content');
	const shopHead = document.querySelector('.shop-head');
	if (!shopContent && !shopHead) return;

	const TAP_MOVE_THRESHOLD = 8; // px
	const TAP_TIME_THRESHOLD = 300; // ms
	let tapStartY = 0;
	let tapStartX = 0;
	let tapStartTime = 0;
	let tapMoved = false;

	const beginTap = (e) => {
		const t = (e.touches && e.touches[0]) || e;
		tapStartY = t.clientY;
		tapStartX = t.clientX;
		tapStartTime = Date.now();
		tapMoved = false;
	};

	const trackMove = (e) => {
		const t = (e.touches && e.touches[0]) || e;
		if (Math.abs(t.clientY - tapStartY) > TAP_MOVE_THRESHOLD || Math.abs(t.clientX - tapStartX) > TAP_MOVE_THRESHOLD) {
			tapMoved = true;
			// Прокрутка внутри магазина — временно подавляем снэп, чтобы не дёргало
			suppressSnap(700);
		}
	};

	const trySnapEnd = (e) => {
		// Не срабатываем при нажатии на фильтры
		if (e && (e.target.closest && (e.target.closest('.shop-filters') || e.target.closest('.filter-btn')))) {
			return;
		}
		const dt = Date.now() - tapStartTime;
		if (!tapMoved && dt <= TAP_TIME_THRESHOLD) {
			// Это «тап», а не скролл — снэпаем к шапке
			if (isSnapping) return;
			const shopTop = getShopHeadTop();
			if (shopTop !== null) {
				isSnapping = true;
				window.scrollTo({ top: shopTop, behavior: 'smooth' });
				setTimeout(() => { isSnapping = false; }, 350);
			}
		}
	};

	const attachTapHandlers = (el) => {
		el.addEventListener('touchstart', beginTap, { passive: true });
		el.addEventListener('touchmove', trackMove, { passive: true });
		el.addEventListener('touchend', trySnapEnd, { passive: true });
		el.addEventListener('click', (e) => {
			// Клик мышью/тапом без заметного скролла
			trySnapEnd(e);
		});
		// Любая прокрутка внутри магазина — подавляем снэп на короткое время
		el.addEventListener('wheel', () => suppressSnap(700), { passive: true });
	};

	if (shopContent) attachTapHandlers(shopContent);
	if (shopHead) attachTapHandlers(shopHead);
}

function preventTopBounce() {
    let startY = 0;
    document.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            startY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const y = window.pageYOffset || document.documentElement.scrollTop;
        if (y <= 0) {
            const currentY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : startY;
            // если жест тянет вниз при самом верху — блокируем
            if (currentY > startY + 2) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
}

// Блокируем случайный системный жест закрытия (свайп снизу вверх) внутри мини‑эппа
function preventEdgeCloseGestures() {
    let startY = 0;
    let startX = 0;
    let startNearBottom = false;
    const bottomThreshold = 28; // зона от нижней кромки, где блокируем жест

    document.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        startY = t.clientY;
        startX = t.clientX;
        startNearBottom = (window.innerHeight - startY) <= bottomThreshold;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        const dy = t.clientY - startY;
        const dx = t.clientX - startX;
        // если жест начался у нижнего края и идёт вверх — не даём системе перехватить
        if (startNearBottom && Math.abs(dy) > Math.abs(dx) && dy < -6) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
}

async function initTelegramSDKFullscreen() {
    // Пытаемся использовать @telegram-apps/sdk (ESM через CDN). Фолбэк — Telegram.WebApp.
    try {
        const sdk = await import('https://cdn.jsdelivr.net/npm/@telegram-apps/sdk/+esm');
        const { isTMA, init, viewport } = sdk;
        if (await isTMA()) {
            init();
            if (viewport?.mount?.isAvailable?.()) {
                await viewport.mount();
                viewport.expand?.();
            }
            if (viewport?.requestFullscreen?.isAvailable?.()) {
                await viewport.requestFullscreen();
            }
            return true;
        }
    } catch (e) {
        console.warn('TMA SDK init failed, fallback to Telegram.WebApp', e);
    }
    // Фолбэк на Telegram.WebApp API
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg) {
            tg.expand?.();
            // Начиная с новых версий клиент сам управляет фуллскрином, но пробуем
            tg.requestFullscreen?.();
            return true;
        }
    } catch (e) {
        console.warn('Telegram.WebApp fallback failed', e);
    }
    return false;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Начинаем с экрана загрузки - ОТКЛЮЧЕНО
    // updateLoadingProgress(0, 'Инициализация...');
    
    // Пытаемся открыть мини‑апп в полноэкранном режиме как можно раньше
    initTelegramSDKFullscreen();
    
    // Initialize Telegram Web App
    initTelegramApp();
    
    // Set viewport height
    setViewportHeight();
    
    // Handle safe areas
    handleSafeAreas();
    
    // Add liquid glass effects
    addLiquidGlassEffect();
    
    // Initialize all interactive elements
    initMultiplierButtons();
    initCustomMultiplierModal();
    initPlayButtons();
    initShopFilters();
    initNavigationButtons();
    initEditButton();
    initHelpButton();
    initHelpModal();
    initRewardCheckButtons();
    initSettingsButton();
    initAddCurrencyButton();
    initBottomNavigation();
    initCharacterEditModal();
    
    // Initialize snake animation
    initSnakeAnimation();
    
    // Обновляем прогресс после инициализации основных компонентов - ОТКЛЮЧЕНО
    // updateLoadingProgress(1, 'Загрузка ресурсов...');
    
    // Инициализируем 3D монетку с небольшой задержкой для плавности
    setTimeout(() => {
        init3DCoin();
    }, 500);
    
    // Initialize scroll control (disabled: remove auto-snap/auto-scroll on home)
    // setupScrollListener();
    // initTapSnapToShop();
    preventEdgeCloseGestures();
    // Во время активного скролла снижаем нагрузку на анимацию змейки
    let lpTimer = null;
    const setLP = (enabled) => { if (window.snakeAnimation) window.snakeAnimation.lowPower = !!enabled; };
    const onScrollLP = () => {
        setLP(true);
        if (lpTimer) clearTimeout(lpTimer);
        lpTimer = setTimeout(() => setLP(false), 150);
    };
    window.addEventListener('scroll', onScrollLP, { passive: true });

    // Оптимизация: при уходе со страницы «Реварды»/кошелек — анимации WebP могут лагать, поэтому ставим паузу змейке
    const onVisibilityChange = () => {
        const rewardsVisible = document.getElementById('view-rewards')?.classList.contains('visible');
        const withdrawVisible = document.getElementById('view-withdraw')?.classList.contains('visible');
        if (window.snakeAnimation) window.snakeAnimation.paused = !!(rewardsVisible || withdrawVisible);
    };
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.addEventListener('click', () => setTimeout(onVisibilityChange, 0)));

    // Попытка автоматически использовать сжатые вебп, если они есть
    optimizeWalletMedia();

    // Settings sheet interactions
    (function initSettingsSheet(){
        const overlay = document.getElementById('settings-modal');
        if (!overlay) return;
        const content = overlay.querySelector('.sheet-content');
        const backBtn = overlay.querySelector('.sheet-back-btn');
        const close = () => {
            overlay.style.display = 'none';
            // Unlock background scroll and restore position
            try {
                const b = document.body;
                const y = window.__sheetScrollY || 0;
                b.style.position = '';
                b.style.top = '';
                b.style.left = '';
                b.style.right = '';
                b.style.width = '';
                window.scrollTo(0, y);
            } catch(_) {}
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                tg?.BackButton?.hide?.();
            } catch(_) {}
        };
        // Закрытие по клику вне
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        // Блокируем скролл на оверлее
        overlay.addEventListener('touchmove', (e) => { 
            if (e.cancelable) e.preventDefault(); 
        }, { passive: false });
        overlay.addEventListener('wheel', (e) => { 
            e.preventDefault(); 
        }, { passive: false });
        // Свайп вниз для закрытия
        let startY = 0, dy = 0, dragging = false;
        content.addEventListener('touchstart', (e) => { if (!e.touches.length) return; dragging = true; startY = e.touches[0].clientY; dy = 0; }, { passive: true });
        content.addEventListener('touchmove', (e) => { if (!dragging) return; dy = e.touches[0].clientY - startY; if (dy > 0) content.style.transform = `translateY(${dy}px)`; }, { passive: true });
        content.addEventListener('touchend', () => { if (!dragging) return; dragging = false; if (dy > 80) close(); content.style.transform = ''; }, { passive: true });
        // Telegram Back Button
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.BackButton) {
                tg.BackButton.onClick(close);
            }
        } catch(_) {}
        if (backBtn) backBtn.addEventListener('click', close);
        // Языки
        content.querySelectorAll('.lang-option').forEach(btn => btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            showNotification(`Язык: ${lang}`);
        }));
        // Поддержка
        const sup = document.getElementById('support-btn');
        sup?.addEventListener('click', () => {
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                tg?.openTelegramLink?.('https://t.me/your_support_here');
            } catch(_) {}
        });
    })();

    // Глобальная защита: отключаем pinch-zoom/масштабирование и системные жесты браузера
    const preventMultiTouch = (e) => {
        if (e.touches && e.touches.length > 1) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        }
    };
    document.addEventListener('touchstart', preventMultiTouch, { passive: false });
    document.addEventListener('touchmove', preventMultiTouch, { passive: false });
    document.addEventListener('gesturestart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturechange', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    document.addEventListener('gestureend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });

    // Отключаем контекстное меню (долгое нажатие)
    document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        // Разрешаем контекстное меню в полях ввода
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
        e.preventDefault();
    });
    
    // Устанавливаем позицию прокрутки после небольшой задержки
    setTimeout(() => {
        initScrollControl();
        
        // Дополнительная проверка видимости магазина (без автопрокрутки и принудительных стилей)
        setTimeout(() => {
            const shopItems = document.querySelector('.shop-items');
            if (shopItems) {
                console.log('Магазин готов');
            }
        }, 300);
    }, 200);
    
    // Add event listeners for device changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleSafeAreas);
    
    console.log('App initialized successfully');
});

// Handle visibility change (when app goes to background)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('App went to background');
    } else {
        console.log('App came to foreground');
        // Refresh safe areas when coming back
        handleSafeAreas();
    }
});

// Export functions for external use if needed
window.ZMEIFI = {
    initTelegramApp,
    showNotification,
    filterShopItems
};

// Character Edit Modal functionality
function openCharacterEditModal() {
    const modal = document.getElementById('character-edit-modal');
    if (!modal) return;

    modal.style.display = 'block';
    
    // Lock background scroll
    try {
        window.__characterEditScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const b = document.body;
        b.style.position = 'fixed';
        b.style.top = `-${window.__characterEditScrollY}px`;
        b.style.left = '0';
        b.style.right = '0';
        b.style.width = '100%';
    } catch(_) {}

    // Show Telegram Back Button
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        tg?.BackButton?.show?.();
    } catch(_) {}

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeCharacterEditModal() {
    const modal = document.getElementById('character-edit-modal');
    if (!modal) return;

    modal.classList.remove('show');
    
    // Hide Telegram Back Button
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        tg?.BackButton?.hide?.();
    } catch(_) {}

    // Restore background scroll
    try {
        const b = document.body;
        b.style.position = '';
        b.style.top = '';
        b.style.left = '';
        b.style.right = '';
        b.style.width = '';
        if (window.__characterEditScrollY !== undefined) {
            window.scrollTo(0, window.__characterEditScrollY);
            delete window.__characterEditScrollY;
        }
    } catch(_) {}

    // Hide modal after animation
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Initialize Character Edit Modal
function initCharacterEditModal() {
    const modal = document.getElementById('character-edit-modal');
    if (!modal) return;

    const content = modal.querySelector('.character-edit-content');
    const backBtn = modal.querySelector('.sheet-back-btn');
    const resetBtn = modal.querySelector('.reset-btn');
    const acceptBtn = modal.querySelector('.accept-btn');
    const editItems = modal.querySelectorAll('.edit-item');

    // Close modal handlers - исправляем логику закрытия
    modal.addEventListener('click', (e) => {
        // Закрываем модальное окно ТОЛЬКО при клике на overlay (фон), а не на его содержимое
        if (e.target === modal) {
            closeCharacterEditModal();
        }
    });

    // Back button handler
    if (backBtn) {
        backBtn.addEventListener('click', closeCharacterEditModal);
    }
    
    // Reset button handler
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove all selections
            editItems.forEach(item => item.classList.remove('selected'));
            showNotification('Настройки сброшены');
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('medium');
                else if (navigator.vibrate) navigator.vibrate(20);
            } catch(_) {}
        });
    }

    // Accept button handler
    if (acceptBtn) {
        acceptBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedItems = modal.querySelectorAll('.edit-item.selected');
            if (selectedItems.length === 0) {
                showNotification('Выберите хотя бы один предмет');
                return;
            }
            
            // Apply selections (here you would typically save to backend)
            const selections = {};
            selectedItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const id = item.getAttribute('data-id');
                if (!selections[type]) selections[type] = [];
                selections[type].push(id);
            });
            
            console.log('Applied selections:', selections);
            showNotification('Изменения применены');
            closeCharacterEditModal();
            
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('success');
                else if (navigator.vibrate) navigator.vibrate(30);
            } catch(_) {}
        });
    }

    // Edit item selection - исправляем логику выбора
    editItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const type = item.getAttribute('data-type');
            
            // Remove selection from other items of the same type
            modal.querySelectorAll(`.edit-item[data-type="${type}"]`).forEach(otherItem => {
                otherItem.classList.remove('selected');
            });
            
            // Toggle selection for clicked item
            item.classList.toggle('selected');
            
            try {
                const tg = window.Telegram && window.Telegram.WebApp;
                if (tg && tg.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred('light');
                else if (navigator.vibrate) navigator.vibrate(10);
            } catch(_) {}
        });
    });

    // Touch/swipe support for carousels - исправляем логику свайпов
    const carouselElements = modal.querySelectorAll('.items-carousel');
    carouselElements.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startTransform = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            
            // Получаем текущую позицию трека
            const currentTransform = getComputedStyle(track).transform;
            const matrix = new DOMMatrix(currentTransform);
            startTransform = matrix.m41;
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            // Move track with finger
            const newTransform = startTransform - diff;
            track.style.transform = `translateX(${newTransform}px)`;
            
            // Убираем transition во время перетаскивания для плавности
            track.style.transition = 'none';
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = startX - currentX;
            const threshold = 50; // Minimum swipe distance
            
            // Определяем размер прокрутки в зависимости от устройства
            const isMobile = window.innerWidth <= 480;
            const scrollAmount = isMobile ? 112 : 136; // 100px + 12px gap для мобильных, 120px + 16px для десктопа
            
            if (Math.abs(diff) > threshold) {
                // Snap to next/previous item
                const currentTransform = getComputedStyle(track).transform;
                const matrix = new DOMMatrix(currentTransform);
                const currentTrackX = matrix.m41;
                
                let targetX;
                if (diff > 0) {
                    // Swipe left - go to next item
                    const maxScroll = -(track.scrollWidth - carousel.offsetWidth);
                    targetX = Math.max(maxScroll, currentTrackX - scrollAmount);
                } else {
                    // Swipe right - go to previous item
                    targetX = Math.min(0, currentTrackX + scrollAmount);
                }
                
                // Плавная анимация к целевой позиции
                track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform = `translateX(${targetX}px)`;
                
                // Убираем transition после анимации
                setTimeout(() => {
                    track.style.transition = '';
                }, 300);
            } else {
                // Snap back to current position
                const currentTransform = getComputedStyle(track).transform;
                const matrix = new DOMMatrix(currentTransform);
                const currentTrackX = matrix.m41;
                
                // Округляем до ближайшего элемента с учетом отступов
                const adjustedScrollAmount = scrollAmount;
                const targetX = Math.round(currentTrackX / adjustedScrollAmount) * adjustedScrollAmount;
                
                // Ensure we don't go beyond bounds
                const maxScroll = -(track.scrollWidth - carousel.offsetWidth);
                const finalTargetX = Math.max(maxScroll, Math.min(0, targetX));
                
                track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                track.style.transform = `translateX(${finalTargetX}px)`;
                
                setTimeout(() => {
                    track.style.transition = '';
                }, 300);
            }
        }, { passive: true });
    });

    // Swipe to close (like settings modal) - исправляем логику свайпа
    let startY = 0;
    let currentY = 0;
    let isSwipeDown = false;

    modal.addEventListener('touchstart', (e) => {
        // Начинаем отслеживание свайпа только если касание началось на граббере или заголовке
        const target = e.target;
        if (target.closest('.sheet-grabber') || target.closest('.sheet-header')) {
            startY = e.touches[0].clientY;
            isSwipeDown = true;
            console.log('Swipe started on grabber/header');
        } else {
            isSwipeDown = false;
        }
    }, { passive: true });

    modal.addEventListener('touchmove', (e) => {
        if (!isSwipeDown) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 50) { // Swipe down
            content.style.transform = `translateY(${Math.min(diff, 100)}px)`;
        }
    }, { passive: true });

    modal.addEventListener('touchend', () => {
        if (!isSwipeDown) return;
        
        const diff = currentY - startY;
        console.log('Swipe ended, diff:', diff);
        
        if (diff > 100) { // Swipe down threshold
            closeCharacterEditModal();
        } else {
            content.style.transform = 'translateY(0)';
        }
        
        isSwipeDown = false;
    }, { passive: true });

    // Добавляем поддержку свайпа для граббера через mouse events (для десктопа)
    const grabber = modal.querySelector('.sheet-grabber');
    if (grabber) {
        let isMouseDown = false;
        let mouseStartY = 0;
        let mouseCurrentY = 0;

        grabber.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartY = e.clientY;
            console.log('Mouse down on grabber');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            mouseCurrentY = e.clientY;
            const diff = mouseCurrentY - mouseStartY;
            
            if (diff > 50) {
                content.style.transform = `translateY(${Math.min(diff, 100)}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (!isMouseDown) return;
            
            const diff = mouseCurrentY - mouseStartY;
            console.log('Mouse up on grabber, diff:', diff);
            
            if (diff > 100) {
                closeCharacterEditModal();
            } else {
                content.style.transform = 'translateY(0)';
            }
            
            isMouseDown = false;
        });

        // Добавляем визуальную обратную связь для граббера
        grabber.addEventListener('mousedown', () => {
            grabber.style.background = 'rgba(255,255,255,0.6)';
        });

        document.addEventListener('mouseup', () => {
            grabber.style.background = 'rgba(255,255,255,0.3)';
        });
    }

    // Telegram Back Button handler
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && tg.BackButton) {
            tg.BackButton.onClick(closeCharacterEditModal);
        }
    } catch(_) {}

    // Block scroll on modal
    modal.addEventListener('touchmove', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    modal.addEventListener('wheel', (e) => { e.preventDefault(); }, { passive: false });
}

// Snake Animation
class SnakeAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.cssWidth = 0;
        this.cssHeight = 0;
        this.paused = false;
        this.lowPower = false;
        this.lastDrawMs = 0;
        // Профиль производительности для мобильных
        this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.innerWidth <= 480);

        this.baseSegments = this.isMobile ? 12 : 15; // меньше сегментов на мобилках
        this.currentMultiplier = 1; // Текущий множитель
        this.segments = this.baseSegments; // Текущее количество сегментов
        this.bodyWidth = this.isMobile ? 32 : 45; // более тонкая линия на мобилках
        this.positions = []; // Позиции точек тела
        this.time = 0;
        this.speed = this.isMobile ? 0.018 : 0.02; // слегка медленнее на мобилках для плавности

        // Свечение: яркое и заметное (голова + тело)
        this.glowBlurBody = 12;
        this.glowBlurHead = 22;
        
        // Змейки и их характеристики
        this.snakeTypes = {
            blue: {
                name: 'Синяя змейка',
                image: 'assets/snake-blue.png',
                bodyColor: '#1343DE',
                bodyGradient: '#0F2FB8',
                glowColor: '#0066FF' // Очень яркое синее свечение
            },
            red: {
                name: 'Красная змейка', 
                image: 'assets/snake-red.png',
                bodyColor: '#DB0D52',
                bodyGradient: '#A50D42',
                glowColor: '#FF0055' // Очень яркое красное свечение
            }
        };
        
        this.snakeTypeKeys = Object.keys(this.snakeTypes);
        this.currentSnakeIndex = 0; // Индекс текущей змейки
        this.currentSnakeType = this.snakeTypeKeys[this.currentSnakeIndex];
        
        console.log('Available snakes:', this.snakeTypeKeys);
        console.log('Current snake type:', this.currentSnakeType);
        
        // Устанавливаем размер canvas динамически
        this.updateCanvasSize();
        
        // Загружаем изображения змеек
        this.snakeImages = {};
        this.loadSnakeImages();
        
        this.init();
        this.animate();
    }
    
    loadSnakeImages() {
        Object.keys(this.snakeTypes).forEach(key => {
            this.snakeImages[key] = new Image();
            this.snakeImages[key].src = this.snakeTypes[key].image;
        });
    }
    
    // Переключение на следующую змейку
    nextSnake() {
        this.currentSnakeIndex = (this.currentSnakeIndex + 1) % this.snakeTypeKeys.length;
        this.currentSnakeType = this.snakeTypeKeys[this.currentSnakeIndex];
        console.log('Switched to:', this.snakeTypes[this.currentSnakeType].name);
        
        // Показываем уведомление
        if (window.showNotification) {
            window.showNotification(this.snakeTypes[this.currentSnakeType].name);
        }
    }
    
    // Переключение на предыдущую змейку
    previousSnake() {
        this.currentSnakeIndex = (this.currentSnakeIndex - 1 + this.snakeTypeKeys.length) % this.snakeTypeKeys.length;
        this.currentSnakeType = this.snakeTypeKeys[this.currentSnakeIndex];
        console.log('Switched to:', this.snakeTypes[this.currentSnakeType].name);
        
        // Показываем уведомление
        if (window.showNotification) {
            window.showNotification(this.snakeTypes[this.currentSnakeType].name);
        }
    }
    
    // Метод для изменения длины змейки
    setMultiplier(multiplier) {
        this.currentMultiplier = multiplier;
        this.segments = this.baseSegments + (multiplier - 1) * 8; // Увеличиваем на 8 сегментов за каждый уровень
        
        // Пересоздаем позиции с новым количеством сегментов
        this.positions = [];
        this.init();
    }
    
    updateCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.cssWidth = Math.max(1, Math.floor(rect.width));
        this.cssHeight = Math.max(1, Math.floor(rect.height));
        // HiDPI: увеличиваем внутренний буфер, но оставляем CSS‑размер
        this.canvas.width = Math.max(1, Math.floor(this.cssWidth * this.dpr));
        this.canvas.height = Math.max(1, Math.floor(this.cssHeight * this.dpr));
        this.canvas.style.width = this.cssWidth + 'px';
        this.canvas.style.height = this.cssHeight + 'px';
        // Масштабируем контекст так, чтобы координаты были в CSS‑пикселях
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    
    init() {
        // Инициализируем позиции точек S-образно
        const centerY = this.cssHeight / 2;
        const startX = this.cssWidth * 0.7; // Голова справа
        const endX = this.cssWidth * 0.3; // Хвост слева
        
        for (let i = 0; i < this.segments; i++) {
            const progress = i / (this.segments - 1);
            
            // Линейная интерполяция по X от правого края к левому
            const x = startX + (endX - startX) * progress;
            
            // S-образная кривая по Y
            const sWave = Math.sin(progress * Math.PI * 2) * 20;
            const y = centerY + sWave;
            
            this.positions.push({ x, y });
        }
    }
    
    animate() {
        if (this.paused) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        const now = performance.now();
        if (this.lowPower && (now - this.lastDrawMs) < 33) { // ~30fps в lowPower
            requestAnimationFrame(() => this.animate());
            return;
        }
        this.lastDrawMs = now;

        this.time += this.speed;

        // Очищаем canvas (сброс трансформации для корректного clearRect на HiDPI)
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        // Рисуем змею
        this.drawSnake();
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawSnake() {
        // Обновляем позиции с анимацией
        this.updatePositions();
        
        // Рисуем тело змеи как плавную кривую
        if (this.positions.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.positions[0].x, this.positions[0].y);
        
            // Используем quadraticCurveTo для плавных S-образных кривых
            for (let i = 1; i < this.positions.length - 1; i++) {
                const current = this.positions[i];
                const next = this.positions[i + 1];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                
                this.ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }
            
            // Добавляем последнюю точку
            const lastPos = this.positions[this.positions.length - 1];
            this.ctx.lineTo(lastPos.x, lastPos.y);
            
            // Получаем цвета для текущей змейки
            const currentSnake = this.snakeTypes[this.currentSnakeType];
            
            // Проверяем что змейка существует
            if (!currentSnake) {
                console.error('Snake type not found:', this.currentSnakeType);
                return;
            }
            
            // Стили для тела с умеренным свечением  
            const glowColor = currentSnake.glowColor || currentSnake.bodyColor;
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = this.lowPower ? Math.max(2, this.glowBlurBody - 10) : this.glowBlurBody;
            this.ctx.strokeStyle = currentSnake.bodyColor;
        this.ctx.lineWidth = this.bodyWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
            // Ранее здесь накладывался градиент (создавал "хвостик" другого цвета). Убрано для единообразия цвета.
            // this.ctx.strokeStyle = gradient; this.ctx.stroke();
            
            // Убираем свечение после рисования тела
            this.ctx.shadowBlur = 0;
        }
        
        // Рисуем голову змеи (больше тела)
        const currentSnakeImage = this.snakeImages[this.currentSnakeType];
        const currentSnake = this.snakeTypes[this.currentSnakeType];
        
        if (currentSnakeImage && currentSnakeImage.complete && this.positions.length > 0 && currentSnake) {
            const headSize = this.isMobile ? 64 : 75; // чуть меньше на мобилках
            const headPos = this.positions[0];
            const headX = headPos.x - headSize / 2;
            const headY = headPos.y - headSize / 2;
            
            // Добавляем свечение вокруг головы (цвет соответствует змейке)
            const glowColor = currentSnake.glowColor || currentSnake.bodyColor;
            //console.log('Current snake:', this.currentSnakeType, 'Glow color:', glowColor);
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = this.lowPower ? Math.max(3, this.glowBlurHead - 12) : this.glowBlurHead;
            
            // Рисуем голову
            this.ctx.drawImage(currentSnakeImage, headX, headY, headSize, headSize);
            
            // Убираем свечение
            this.ctx.shadowBlur = 0;
        }
    }
    
    updatePositions() {
        const centerY = this.cssHeight / 2;
        const headX = this.cssWidth - 110; // Голова левее как было раньше
        
        // Двигаем голову (первый элемент - справа) - уменьшенная амплитуда
        const headMovement = Math.sin(this.time * 1.2) * 5;
        this.positions[0].x = headX;
        this.positions[0].y = Math.max(35, Math.min(this.canvas.height - 35, centerY + headMovement));
        
        // Тело следует за головой с S-образными движениями
        for (let i = 1; i < this.positions.length; i++) {
            const prevSegment = this.positions[i - 1]; // Предыдущий сегмент (ближе к голове)
            const currentSegment = this.positions[i];
            
            // Базовое следование за предыдущим сегментом
            const followSpeed = 0.15;
            // Адаптивное расстояние между сегментами для длинных змеек
            const segmentSpacing = this.currentMultiplier <= 2 ? 10 : Math.max(7, 10 - (this.currentMultiplier - 2) * 1);
            const targetX = prevSegment.x - segmentSpacing; // Смещение влево
            let targetY = prevSegment.y;
            
            // Добавляем S-образную волну, которая распространяется от головы
            // Увеличиваем амплитуду И частоту для длинных змеек (X3+)
            const frequency = this.currentMultiplier <= 2 ? 2 : 2 + (this.currentMultiplier - 2) * 0.4;
            const wavePhase = this.time * frequency - i * 0.4; // Задержка волны для каждого сегмента
            const baseAmplitude = this.currentMultiplier <= 2 ? 4 : 4 + (this.currentMultiplier - 2) * 2;
            const waveAmplitude = Math.sin(wavePhase) * (baseAmplitude - i * 0.15); 
            targetY += waveAmplitude;
            
            // Плавно двигаемся к целевой позиции
            currentSegment.x += (targetX - currentSegment.x) * followSpeed;
            currentSegment.y += (targetY - currentSegment.y) * followSpeed;
            
            // Ограничиваем движения границами canvas - с учетом свечения
            currentSegment.x = Math.max(25, Math.min(this.cssWidth - 25, currentSegment.x));
            currentSegment.y = Math.max(25, Math.min(this.cssHeight - 25, currentSegment.y));
        }
    }
}

// Initialize Snake Animation
function initSnakeAnimation() {
    const snakeCanvas = document.getElementById('snakeCanvas');
    if (snakeCanvas) {
        window.snakeAnimation = new SnakeAnimation('snakeCanvas');
    }
}

let coinInitDone = false;

async function init3DCoin() {
    const stage = document.getElementById('coin-stage');
    if (!stage) return;
    if (coinInitDone && stage.children.length) return; // уже инициализировано
    
    // Обновляем прогресс загрузки - ОТКЛЮЧЕНО
    // updateLoadingProgress(2, 'Подготовка 3D модели...');

    const showImage = (srcs = []) => {
        stage.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'coin-fallback';
        let idx = 0;
        const tryNext = () => {
            if (idx >= srcs.length) return; // нечего больше пробовать
            img.src = srcs[idx++];
        };
        img.onerror = tryNext;
        img.alt = ''; /* убираем текст "Монета" */
        stage.appendChild(img);
        tryNext();
    };

    const showFallback = () => {
        // Пробуем набор популярных имён
        showImage([
            stage.getAttribute('data-model') || '',
            'assets/result-webp.webp',
            'assets/result-webp.png',
            'assets/result-webp',
            'assets/coin.webp',
            'assets/coin.png',
            'assets/ton-icon.png' // Используем иконку TON как fallback
        ].filter(Boolean));
    };

    // Если явно указана картинка — сразу показываем как изображение
    const attr = stage.getAttribute('data-model') || '';
    if (/(\.webp|\.png|\.jpg|\.jpeg|\.gif)$/i.test(attr)) {
        showImage([attr]);
        coinInitDone = true;
        return;
    }

    try {
        const [
            { WebGLRenderer, Scene, PerspectiveCamera, SRGBColorSpace, ACESFilmicToneMapping, HemisphereLight, DirectionalLight, Box3, Vector3 },
            { GLTFLoader },
            { MeshoptDecoder }
        ] = await Promise.all([
            import('https://unpkg.com/three@0.160.0/build/three.module.js'),
            import('https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'),
            import('https://unpkg.com/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')
        ]).then(([three, gltf, meshopt]) => [
            {
                WebGLRenderer: three.WebGLRenderer,
                Scene: three.Scene,
                PerspectiveCamera: three.PerspectiveCamera,
                SRGBColorSpace: three.SRGBColorSpace,
                ACESFilmicToneMapping: three.ACESFilmicToneMapping,
                HemisphereLight: three.HemisphereLight,
                DirectionalLight: three.DirectionalLight,
                Box3: three.Box3,
                Vector3: three.Vector3,
            },
            { GLTFLoader: gltf.GLTFLoader },
            { MeshoptDecoder: meshopt.MeshoptDecoder }
        ]);

        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4; // ещё ярче рендер
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new Scene();
        const camera = new PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 2.6);

        // lights (чуть ярче + контровой)
        const hemi = new HemisphereLight(0xffffff, 0x222233, 1.45);
        const dir = new DirectionalLight(0xffffff, 1.6);
        dir.position.set(3, 5, 4);
        const rim = new DirectionalLight(0xffffff, 0.9);
        rim.position.set(-3, 3, -4);
        scene.add(hemi, dir, rim);

        stage.innerHTML = '';
        stage.appendChild(renderer.domElement);

        function resize() {
            const rect = stage.getBoundingClientRect();
            const w = Math.max(100, Math.floor(rect.width));
            const h = Math.max(100, Math.floor(rect.height));
            renderer.setSize(w, h); // обновляем и буфер, и CSS-стили
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        new ResizeObserver(resize).observe(stage);

        let model = null;
        let isDown = false;
        let lastX = 0, lastY = 0;
        let velX = 0, velY = 0;
        let lastInputAt = performance.now();

        // Настройка чувствительности под устройство и размер сцены
        const isCoarsePointer = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
        const baseSensY = 0.0045;
        const baseSensX = 0.0040;
        const sizeFactor = (() => {
            const rect = stage.getBoundingClientRect();
            const w = Math.max(1, Math.floor(rect.width || 220));
            // чем меньше контейнер, тем чувствительнее, но в разумных пределах
            const raw = 220 / Math.min(320, w);
            return Math.max(0.95, Math.min(1.2, raw));
        })();
        const sensY = baseSensY * (isCoarsePointer ? 1.8 : 1.0) * sizeFactor;
        const sensX = baseSensX * (isCoarsePointer ? 1.6 : 1.0) * sizeFactor;
        const clampX = 1.35;

        // Лёгкий импульс вращения
        const kickSpin = (strength = 1) => {
            velY = 0.022 * strength;   // вокруг вертикали (y)
            velX = 0.004 * strength;   // небольшой наклон (x)
            lastInputAt = performance.now();
        };

        const url = attr || 'assets/result-webp.glb';
        const loader = new GLTFLoader();
        // ВАЖНО: настраиваем декодер meshopt до загрузки
        if (MeshoptDecoder) {
            loader.setMeshoptDecoder(MeshoptDecoder);
        }
        let loaded = false;
        // updateLoadingProgress(3, 'Загрузка 3D монетки...'); // ВРЕМЕННО ОТКЛЮЧЕНО
        loader.load(url, (gltf) => {
            loaded = true;
            model = gltf.scene;
            const box = new Box3().setFromObject(model);
            const size = new Vector3();
            const center = new Vector3();
            box.getSize(size);
            box.getCenter(center);
            model.position.sub(center);
            const targetSize = 1.35; // масштаб больше, чтобы меньше пустого места сверху/снизу
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
            scene.add(model);
            // стартовый мягкий проворот при загрузке
            kickSpin(1);
            
            // Обновляем прогресс и скрываем экран загрузки - ВРЕМЕННО ОТКЛЮЧЕНО
            // updateLoadingProgress(4, 'Готово!');
            // setTimeout(() => {
            //     hideLoadingScreen();
            // }, 500);
        }, undefined, (err) => {
            console.error('GLB load error:', err);
            showFallback();
            
            // Даже при ошибке скрываем экран загрузки - ВРЕМЕННО ОТКЛЮЧЕНО
            // updateLoadingProgress(4, 'Готово!');
            // setTimeout(() => {
            //     hideLoadingProgress();
            // }, 500);
        });

        // таймаут на случай тишины от loader'а
        setTimeout(() => { 
            if (!loaded) { 
                console.warn('GLB load timeout, showing fallback'); 
                showFallback(); 
                
                // При таймауте тоже скрываем экран загрузки - ВРЕМЕННО ОТКЛЮЧЕНО
                // updateLoadingProgress(4, 'Готово!');
                // setTimeout(() => {
                //     hideLoadingProgress();
                // }, 500);
            } 
        }, 4000);
        
        // Принудительно показываем fallback через 5 секунд, если ничего не загрузилось
        setTimeout(() => {
            if (!loaded && !stage.children.length) {
                console.warn('Force showing fallback after 5 seconds');
                showFallback();
            }
        }, 5000);

        const onDown = (e) => {
            isDown = true;
            lastX = (e.touches ? e.touches[0].clientX : e.clientX);
            lastY = (e.touches ? e.touches[0].clientY : e.clientY);
            if (e.pointerId != null && stage.setPointerCapture) {
                try { stage.setPointerCapture(e.pointerId); } catch(_) {}
            }
        };
        const onMove = (e) => {
            if (!isDown || !model) return;
            const cx = (e.touches ? e.touches[0].clientX : e.clientX);
            const cy = (e.touches ? e.touches[0].clientY : e.clientY);
            const dx = cx - lastX;
            const dy = cy - lastY;
            lastX = cx; lastY = cy;
            // Более высокая отзывчивость на мобильных/коурс-поинтерах
            const gain = isCoarsePointer ? 1.25 : 1.1;
            velY = dx * sensY;
            velX = dy * sensX;
            model.rotation.y += velY * gain;
            model.rotation.x = Math.max(-clampX, Math.min(clampX, model.rotation.x + velX * gain));
            lastInputAt = performance.now();
        };
        const onUp = (e) => {
            isDown = false;
            lastInputAt = performance.now(); // старт отсчёта простоя с момента отпускания
            if (e && e.pointerId != null && stage.releasePointerCapture) {
                try { stage.releasePointerCapture(e.pointerId); } catch(_) {}
            }
        };

        // Жёстко отделяем жесты на монетке от прокрутки страницы
        const onDownStop = (e) => { onDown(e); if (e.cancelable) e.preventDefault(); e.stopPropagation(); };
        const onMoveStop = (e) => { onMove(e); if (e.cancelable) e.preventDefault(); e.stopPropagation(); };
        const onWheelStop = (e) => { if (e.cancelable) e.preventDefault(); e.stopPropagation(); };

        stage.addEventListener('pointerdown', onDownStop, { passive: false });
        stage.addEventListener('pointermove', onMoveStop, { passive: false });
        window.addEventListener('pointerup', onUp, { passive: true });
        stage.addEventListener('touchstart', onDownStop, { passive: false });
        stage.addEventListener('touchmove', onMoveStop, { passive: false });
        stage.addEventListener('wheel', onWheelStop, { passive: false });
        window.addEventListener('touchend', onUp, { passive: true });

        function animate() {
            requestAnimationFrame(animate);
            // чуть сильнее демпфирование — меньше инерции/"супер-отзывчивости"
            velX *= 0.975;
            velY *= 0.98;
            if (model) {
                model.rotation.y += velY;
                model.rotation.x = Math.max(-clampX, Math.min(clampX, model.rotation.x + velX));
                const idleMs = performance.now() - lastInputAt;
                if (idleMs > 250) {
                    const t = Math.min((idleMs - 250) / 500, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    const k = 0.11 * ease; // ещё быстрее начинаем возвращать к центру
                    velX *= 0.9; velY *= 0.9;
                    model.rotation.x += (0 - model.rotation.x) * k;
                    model.rotation.y += (0 - model.rotation.y) * k;
                    if (Math.abs(model.rotation.x) < 0.002) model.rotation.x = 0;
                    if (Math.abs(model.rotation.y) < 0.002) model.rotation.y = 0;
                }
            }
            renderer.render(scene, camera);
        }
        animate();

        const rewardsView = document.getElementById('view-rewards');
        const visibilityObserver = new MutationObserver(() => {
            const hidden = rewardsView.getAttribute('aria-hidden') === 'true';
            renderer.domElement.style.visibility = hidden ? 'hidden' : 'visible';
            if (!hidden) {
                resize();
                // при входе на вкладку — лёгкий автопроворот
                kickSpin(0.8);
            }
        });
        visibilityObserver.observe(rewardsView, { attributes: true, attributeFilter: ['aria-hidden'] });

        coinInitDone = true;
    } catch (e) {
        console.warn('Three/Loader import failed', e);
        showFallback();
        coinInitDone = true;
    }
}

// initialize 3D coin lazily - теперь управляется через экран загрузки
// setTimeout(() => { init3DCoin(); }, 0);

// при переходе на вкладку Реварды — убеждаемся, что инициализация выполнена и размер обновлён
(function hookRewardsInit() {
    const rewardsBtnIndex = 3; // 0:leaderboard,1:referrals,2:home,3:rewards,4:withdraw
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (!navItems.length) return;
    navItems.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            if (idx === rewardsBtnIndex) {
                init3DCoin();
                const stage = document.getElementById('coin-stage');
                if (stage) {
                    // небольшая задержка для пересчёта размеров
                    setTimeout(() => {
                        const evt = new Event('resize');
                        window.dispatchEvent(evt);
                    }, 60);
                }
            }
        });
    });
})();

function populateLeaderboard() {
    const lb = document.getElementById('lb-list');
    if (!lb) return;

    // 1 место сверху, далее 2..10; значения убывают вниз
    const sampleNicks = [
        'crypto_kid','DeFiNinja','ton_whale','satoshi_rus','airdrop_hunter','chain_monk','Mr.Mint','NebulaCat','MoonRider','hodl_panda',
        'alphaWolf','MetaBear','PixelFox','StormBringer','ice_dragon','nova_girl','xXx_tg_xXx','KappaMan','rippledude','arbiter_bot'
    ];
    const rndNick = () => sampleNicks[Math.floor(Math.random()*sampleNicks.length)] + '_' + Math.random().toString(36).slice(2,4);

    const placeMedal = (place) => {
        if (place === 1) return '🥇';
        if (place === 2) return '🥈';
        if (place === 3) return '🥉';
        return `#${place}`;
    };

    const players = Array.from({ length: 10 }).map((_, i) => {
        const place = i + 1; // 1..10
        const nick = rndNick();
        const tokensTop = 10500; // верхняя планка
        const profitTop = 2250;  // верхняя планка $, для примера
        const tokens = Math.max(100, Math.floor(tokensTop - i * 950));
        const profit = Math.max(10, (profitTop - i * 200)).toFixed(2);
        return { nick, tokens, profit, place };
    });

    lb.innerHTML = '';
    players.forEach(p => {
        const row = document.createElement('div');
        row.className = 'lb-item';
        row.innerHTML = `<span>${p.nick}</span><span>${p.tokens}</span><span>$${p.profit}</span><span>${placeMedal(p.place)}</span>`;
        lb.appendChild(row);
    });
}

function populateReferrals() {
    const list = document.getElementById('ref-list');
    const totalSumEl = document.querySelector('.ref-total-sum');
    if (!list) return;

    const tgNames = ['alexei','maria','nikita','olga','sergei','dmitry','irina','andrey','viktor','inna','polina','arkady','egor','sveta','kira','lev'];
    const rndNick = () => '@' + tgNames[Math.floor(Math.random()*tgNames.length)] + '_' + Math.random().toString(36).slice(2,4);
    const friends = Array.from({ length: 8 }).map((_) => ({ nick: rndNick(), profit: (10 + Math.random() * 300).toFixed(2) }));

    list.innerHTML = '';
    let total = 0;
    friends.forEach(f => {
        const row = document.createElement('div');
        row.className = 'ref-item';
        row.innerHTML = `<span>${f.nick}</span><span>$${f.profit}</span>`;
        list.appendChild(row);
        total += parseFloat(f.profit);
    });
    if (totalSumEl) totalSumEl.textContent = `$${total.toFixed(2)}`;
}

function initLeaderboardShare() {
    const btnTop = document.getElementById('lb-share');
    const btnBottom = document.getElementById('lb-bottom-share');
    if (btnTop) btnTop.textContent = 'Поделиться результатом';
    if (btnBottom) btnBottom.textContent = 'Поделиться результатом';
    const tokensEl = document.getElementById('lb-my-tokens') || document.getElementById('lb-bottom-tokens');
    const profitEl = document.getElementById('lb-my-profit') || document.getElementById('lb-bottom-profit');

    const handler = async () => {
        const tokens = tokensEl?.textContent || '0';
        const profit = profitEl?.textContent || '0.00';
        const text = `Мой заработок в ZMEIFI: ${tokens} токенов, ${profit} профита!`;
        try {
            if (navigator.share) {
                await navigator.share({ title: 'ZMEIFI', text });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                showNotification('Текст скопирован');
            } else {
                showNotification(text);
            }
        } catch(e) {
            showNotification('Не удалось поделиться');
        }
    };

    btnTop?.addEventListener('click', handler);
    btnBottom?.addEventListener('click', handler);
}

// Help Modal functionality
function initHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (!helpModal) return;

    const helpImage = document.getElementById('help-image');
    const helpLottie = document.getElementById('help-lottie');
    const helpText = document.getElementById('help-text');
    const helpBack = document.getElementById('help-back');
    const helpNext = document.getElementById('help-next');

    // Help content data (Russian translations)
    const helpSteps = [
        {
            image: 'assets/help-1.png',
            text: 'Добро пожаловать в ZmeiFi, крипто-игру где можно заработать.'
        },
        {
            image: 'assets/help-2.png',
            text: 'Заставь других змей сталкиваться с тобой и защищай свою голову!'
        },
        {
            image: 'assets/help-3.png',
            text: 'Ешь остатки других змей и увеличивай свой депозит.'
        },
        {
            image: 'assets/help-4.png',
            text: 'Собирай токены. На них можно купить скины для своей змеи.'
        },
        {
            image: 'assets/help-5.png',
            text: 'Выводи заработанные деньги на любой кошелек или Stars.'
        }
    ];

    let currentStep = 0;

    // Preload all help images for instant switching
    const helpImages = {};
    helpSteps.forEach((step, index) => {
        const img = new Image();
        img.src = step.image;
        helpImages[index] = img;
    });

    function showStep(step) {
        if (step < 0 || step >= helpSteps.length) return;
        
        currentStep = step;
        const stepData = helpSteps[step];
        
        // Показываем изображение и Lottie в зависимости от шага
        if (step === helpSteps.length - 1) {
            // Последний шаг - показываем и картинку, и Lottie снизу
            helpImage.style.display = 'block';
            helpLottie.style.display = 'block';
            
            // Используем предзагруженное изображение для мгновенного переключения
            if (helpImages[step] && helpImages[step].complete) {
                helpImage.src = helpImages[step].src;
            } else {
                helpImage.src = stepData.image;
            }
            
            // Инициализируем Lottie если еще не инициализирована
            if (!helpLottie.hasAttribute('data-lottie-loaded')) {
                try {
                    if (window.lottie && window.pako) {
                        const url = helpLottie.getAttribute('data-tgs');
                        fetch(url)
                            .then(r => r.arrayBuffer())
                            .then(buf => window.pako.inflate(new Uint8Array(buf), { to: 'string' }))
                            .then(json => {
                                window.lottie.loadAnimation({ 
                                    container: helpLottie, 
                                    renderer: 'svg', 
                                    loop: true, 
                                    autoplay: true, 
                                    animationData: JSON.parse(json) 
                                });
                                helpLottie.setAttribute('data-lottie-loaded', 'true');
                            })
                            .catch(() => {});
                    }
                } catch(_) {}
            }
        } else {
            // Обычные шаги - показываем только изображение
            helpImage.style.display = 'block';
            helpLottie.style.display = 'none';
            
            // Используем предзагруженное изображение для мгновенного переключения
            if (helpImages[step] && helpImages[step].complete) {
                helpImage.src = helpImages[step].src;
            } else {
                helpImage.src = stepData.image;
            }
        }
        
        helpText.textContent = stepData.text;
        
        // Show/hide navigation buttons
        helpBack.style.display = step === 0 ? 'none' : 'block';
        
        if (step === helpSteps.length - 1) {
            helpNext.textContent = 'Принять';
        } else {
            helpNext.textContent = 'Далее';
        }
    }

    function nextStep() {
        if (currentStep === helpSteps.length - 1) {
            // Last step - close modal
            closeHelpModal();
        } else {
            showStep(currentStep + 1);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    }

    // Event listeners
    helpNext.addEventListener('click', nextStep);
    helpBack.addEventListener('click', prevStep);

    // Swipe to close (like settings modal)
    let startY = 0;
    let currentY = 0;

    helpModal.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    helpModal.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 50) { // Swipe down
            const sheet = helpModal.querySelector('.sheet-content');
            sheet.style.transform = `translateY(${Math.min(diff, 100)}px)`;
        }
    }, { passive: true });

    helpModal.addEventListener('touchend', () => {
        const sheet = helpModal.querySelector('.sheet-content');
        const diff = currentY - startY;
        
        if (diff > 100) { // Swipe down threshold
            closeHelpModal();
        } else {
            sheet.style.transform = 'translateY(0)';
        }
    }, { passive: true });

    // Initialize first step
    showStep(0);

    // Telegram Back Button handler
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && tg.BackButton) {
            tg.BackButton.onClick(closeHelpModal);
        }
    } catch(_) {}

    // Сохраняем экземпляр глобально для доступа из openHelpModal
    window.helpModalInstance = {
        showStep: showStep,
        currentStep: () => currentStep
    };
}

function openHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (!helpModal) return;

    // Сброс на первый шаг при каждом открытии
    if (window.helpModalInstance) {
        window.helpModalInstance.showStep(0);
    }

    helpModal.style.display = 'block';
    
    // Lock background scroll
    try {
        window.__helpScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const b = document.body;
        b.style.position = 'fixed';
        b.style.top = `-${window.__helpScrollY}px`;
        b.style.left = '0';
        b.style.right = '0';
        b.style.width = '100%';
    } catch(_) {}

    // Show Telegram Back Button
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        tg?.BackButton?.show?.();
    } catch(_) {}

    // Show modal with animation
    setTimeout(() => {
        helpModal.classList.add('show');
    }, 10);
}

function closeHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (!helpModal) return;

    helpModal.classList.remove('show');
    
    // Hide Telegram Back Button
    try {
        const tg = window.Telegram && window.Telegram.WebApp;
        tg?.BackButton?.hide?.();
    } catch(_) {}

    // Restore background scroll
    try {
        const b = document.body;
        b.style.position = '';
        b.style.top = '';
        b.style.left = '';
        b.style.right = '';
        b.style.width = '';
        if (window.__helpScrollY !== undefined) {
            window.scrollTo(0, window.__helpScrollY);
            delete window.__helpScrollY;
        }
    } catch(_) {}

    // Hide modal after animation
    setTimeout(() => {
        helpModal.style.display = 'none';
    }, 300);
}
