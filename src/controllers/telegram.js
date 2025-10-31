const { bot } = require('../services/telegramBot');

async function handleTelegramWebhook(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Telegram webhook error:', err);
    res.status(500).send('Internal error');
  }
}

module.exports = { handleTelegramWebhook };