const { Telegraf } = require('telegraf');
const conf = require('../src/config/config.secret.json').telegram;

const botToken = conf.botToken;
const webhookUrl = conf.webhook+"/api/telegram";

if (!botToken || !webhookUrl) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN or BACKGROUND_SERVER_URL in env');
}

const bot = new Telegraf(botToken);

(async () => {
  try {
    const result = await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook set successfully:', result, "| token:",botToken,"| url:", webhookUrl);
  } catch (err) {
    console.error('❌ Failed to set webhook:', err);
  }
})();