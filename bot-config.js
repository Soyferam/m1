// Пример конфигурации для Telegram Bot с интеграцией ZMEIFI Web App
// Используйте с библиотекой node-telegram-bot-api или telegraf

const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен бота
const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// URL вашего Web App (должен быть HTTPS)
const WEBAPP_URL = 'https://your-domain.com';

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, 
        '🎮 Добро пожаловать в ZMEIFI!\n\n' +
        'Нажмите кнопку ниже, чтобы открыть игру:',
        {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🎮 Открыть игру',
                        web_app: { url: WEBAPP_URL }
                    }
                ]]
            }
        }
    );
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        '📚 Справка по ZMEIFI:\n\n' +
        '🎯 Цель игры: Управляйте змейкой и собирайте монеты\n' +
        '💰 Валюты: TON и игровые монеты\n' +
        '🎨 Кастомизация: Покупайте шапки и одежду\n' +
        '⚡ Множители: X1-X5 для увеличения наград\n\n' +
        'Используйте /start для запуска игры!'
    );
});

// Обработка данных от Web App
bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data.data;
    
    try {
        const parsedData = JSON.parse(data);
        console.log('Получены данные от Web App:', parsedData);
        
        // Обработка различных типов данных
        switch (parsedData.action) {
            case 'game_start':
                bot.sendMessage(chatId, `🎮 Игра запущена! Множитель: X${parsedData.multiplier}`);
                break;
                
            case 'purchase':
                bot.sendMessage(chatId, `🛒 Покупка: ${parsedData.item_name}`);
                break;
                
            case 'currency_add':
                bot.sendMessage(chatId, `💰 Баланс пополнен на ${parsedData.amount} TON`);
                break;
                
            default:
                bot.sendMessage(chatId, '📱 Данные получены от приложения');
        }
        
    } catch (error) {
        console.error('Ошибка парсинга данных:', error);
        bot.sendMessage(chatId, '❌ Ошибка обработки данных');
    }
});

// Обработка callback query (кнопки)
bot.on('callback_query', (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    
    if (action === 'open_shop') {
        bot.sendMessage(chatId,
            '🛍️ Магазин открыт!\n\n' +
            'Используйте Web App для покупок:',
            {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '🛒 Открыть магазин',
                            web_app: { url: WEBAPP_URL + '#shop' }
                        }
                    ]]
                }
            }
        );
    }
    
    // Отвечаем на callback query
    bot.answerCallbackQuery(callbackQuery.id);
});

// Обработка ошибок
bot.on('error', (error) => {
    console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
});

// Запуск бота
bot.on('polling_start', () => {
    console.log('🤖 Бот ZMEIFI запущен и ожидает сообщения...');
    console.log('📱 Web App URL:', WEBAPP_URL);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка бота...');
    bot.stopPolling();
    process.exit(0);
});

// Пример отправки данных в Web App
function sendDataToWebApp(chatId, data) {
    bot.sendMessage(chatId, '📤 Отправка данных в приложение...', {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '📱 Открыть с данными',
                    web_app: { 
                        url: WEBAPP_URL + '?data=' + encodeURIComponent(JSON.stringify(data))
                    }
                }
            ]]
        }
    });
}

// Пример использования
// sendDataToWebApp(chatId, {
//     action: 'update_balance',
//     balance: 1000,
//     currency: 'TON'
// });

module.exports = {
    bot,
    sendDataToWebApp,
    WEBAPP_URL
};
