// Telegram Web App initialization
let tg = null;

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
            console.log('Edit character');
            showNotification('Редактирование персонажа');
        });
    }
}

// Help button functionality
function initHelpButton() {
    const helpBtn = document.querySelector('.help-btn');
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            console.log('Help requested');
            showNotification('Помощь');
        });
    }
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
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
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
    `;
    
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
    initAddCurrencyButton();
    initBottomNavigation();
    
    // Initialize snake animation
    initSnakeAnimation();
    
    // Initialize scroll control (disabled: remove auto-snap/auto-scroll on home)
    // setupScrollListener();
    // initTapSnapToShop();
    preventEdgeCloseGestures();

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

// Snake Animation
class SnakeAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.cssWidth = 0;
        this.cssHeight = 0;
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
            this.ctx.shadowBlur = this.glowBlurBody; // меньшее свечение на мобилках
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
            this.ctx.shadowBlur = this.glowBlurHead;
            
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
        img.alt = 'Монета';
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
            'assets/coin.png'
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
        renderer.toneMappingExposure = 1.35; // ярче рендер
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new Scene();
        const camera = new PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 3);

        // lights (чуть ярче + контровой)
        const hemi = new HemisphereLight(0xffffff, 0x222233, 1.2);
        const dir = new DirectionalLight(0xffffff, 1.15);
        dir.position.set(3, 5, 4);
        const rim = new DirectionalLight(0xffffff, 0.6);
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
        loader.load(url, (gltf) => {
            loaded = true;
            model = gltf.scene;
            const box = new Box3().setFromObject(model);
            const size = new Vector3();
            const center = new Vector3();
            box.getSize(size);
            box.getCenter(center);
            model.position.sub(center);
            const targetSize = 1.15; // было 0.9 — монета чуть больше в том же контейнере
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
            scene.add(model);
            // стартовый мягкий проворот при загрузке
            kickSpin(1);
        }, undefined, (err) => {
            console.error('GLB load error:', err);
            showFallback();
        });

        // таймаут на случай тишины от loader'а
        setTimeout(() => { if (!loaded) { console.warn('GLB load timeout, showing fallback'); showFallback(); } }, 4000);

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
                if (idleMs > 900) {
                    const t = Math.min((idleMs - 900) / 900, 1);
                    const ease = 1 - Math.pow(1 - t, 3);
                    const k = 0.075 * ease; // быстрее возвращаем к центру
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
    }
}

// initialize 3D coin lazily
setTimeout(() => { init3DCoin(); }, 0);

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
    const players = Array.from({ length: 10 }).map((_, i) => {
        const place = i + 1; // 1..10
        const nick = `player_${(place).toString().padStart(2,'0')}`;
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
        row.innerHTML = `<span>${p.nick}</span><span>${p.tokens}</span><span>$${p.profit}</span><span>#${p.place}</span>`;
        lb.appendChild(row);
    });
}

function populateReferrals() {
    const list = document.getElementById('ref-list');
    const genBtn = document.getElementById('generate-ref');
    const linkBox = document.getElementById('ref-link');
    if (!list || !genBtn || !linkBox) return;

    const friends = Array.from({ length: 8 }).map((_, i) => {
        const nick = `friend_${Math.random().toString(36).slice(2, 7)}`;
        const profit = (10 + Math.random() * 300).toFixed(2);
        return { nick, profit };
    });

    list.innerHTML = '';
    friends.forEach(f => {
        const row = document.createElement('div');
        row.className = 'ref-item';
        row.innerHTML = `<span>${f.nick}</span><span>$${f.profit}</span>`;
        list.appendChild(row);
    });

    genBtn.addEventListener('click', () => {
        // простая генерация ссылки
        const code = Math.random().toString(36).slice(2, 10);
        const url = `${location.origin}${location.pathname}?ref=${code}`;
        linkBox.textContent = url;
        linkBox.style.display = 'block';
        // копирование в буфер
        navigator.clipboard?.writeText(url).catch(() => {});
        showNotification('Реферальная ссылка сгенерирована и скопирована');
    });
}

function initLeaderboardShare() {
    const btnTop = document.getElementById('lb-share');
    const btnBottom = document.getElementById('lb-bottom-share');
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
