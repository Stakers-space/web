//import { Telegraf, Markup } from 'telegraf';
const { Telegraf } = require('telegraf');
const config = require('../config/config.secret.json').telegram;
// connect MySQL DB

const bot = new Telegraf(config.botToken);

// Menu commands options
bot.telegram.setMyCommands([
  { command: 'connect', description: 'Connect account' },
]);

bot.start((ctx) => ctx.reply('Hi! Use /connect to link your account.'));
bot.command('connect', (ctx) => { ctx.reply('Enter the unique hash from your web account:');});

bot.command('overview', (ctx) => { 
  ctx.reply('Feature under construction');
});

bot.on('text', (ctx) => {
    const hash = ctx.message.text.trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(hash)) {
        console.log("TelegramBOT | Connect Telegram to user account |", /*ctx,*/ hash, ctx.chat.id);
        
        // connect telegram to user account
        // MySQL - find hash → update telegram id - ctx.chat.id
        
        ctx.reply('✅ Telegram chat has been linked to your Stakers.space account.');
    } else {
        ctx.reply('TelegramBOT | Invalid hash.');
    }
});

function sendTelegramMessage(acc_telegram_id, text) {
    // get chat id from DB
  if (acc_telegram_id) {
    try {
      bot.telegram.sendMessage(acc_telegram_id, text, { parse_mode: 'MarkdownV2' });
    } catch(err){
      console.error('❌ TelegramBOT | Failed to send message:', err.message);
    }
  } else {
    console.log('❌ TelegramBOT | Account telegram connection not found:');
  }
}

module.exports = {
  bot,
  sendTelegramMessage,
};