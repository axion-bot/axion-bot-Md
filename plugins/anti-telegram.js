let telegramRegex = /(?:https?:\/\/)?(?:www\.)?(t\.me|telegram\.me)\/[^\s]*/i;

export async function before(m, { isAdmin, isPrems, isBotAdmin, conn }) {
  if (m.isBaileys || m.fromMe) return true;
  if (!m.isGroup) return false;

  let chat = global.db.data.chats[m.chat];
  if (!chat) return false;

  const warnLimit = 3;
  const senderId = m.key.participant;
  const messageId = m.key.id;

  const isTelegramLink = telegramRegex.exec(m.text);

  if (chat.antiTelegram && isTelegramLink && !isAdmin && !isPrems && isBotAdmin) {

    global.db.data.users[m.sender] ??= {};
    global.db.data.users[m.sender].warn ??= 0;
    global.db.data.users[m.sender].warnReasons ??= [];

    global.db.data.users[m.sender].warn += 1;
    global.db.data.users[m.sender].warnReasons.push('link telegram');

    // Cancella il messaggio
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: messageId,
          participant: senderId,
        },
      });
    } catch (e) {
      console.error('Errore nella cancellazione del messaggio:', e);
    }

    let warnCount = global.db.data.users[m.sender].warn;
    let remaining = warnLimit - warnCount;

    if (warnCount < warnLimit) {
      await conn.sendMessage(m.chat, {
        text: `
🚨 Link Telegram rilevato

🔹 Avvertimento: ${warnCount}/${warnLimit}
🔹 Rimangono: ${remaining}

Prossima violazione → espulsione.
━━━━━━━━━━━━━━━━━━`
      });
    } else {
      global.db.data.users[m.sender].warn = 0;
      global.db.data.users[m.sender].warnReasons = [];

      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        await conn.sendMessage(m.chat, {
          text: `⛔ @${m.sender.split('@')[0]} RIMOSSO DAL GRUPPO DOPO 3 AVVERTIMENTI`,
          mentions: [m.sender]
        });
      } catch {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${m.sender.split('@')[0]} DOVREBBE ESSERE RIMOSSO, MA IL BOT NON È ADMIN`,
          mentions: [m.sender]
        });
      }
    }
  }

  return true;
}