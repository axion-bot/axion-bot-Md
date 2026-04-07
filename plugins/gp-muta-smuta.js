const handler = async (m, { conn, command, text, isAdmin }) => {
  // Ottieni l'elenco degli owner globali del bot
  const BOT_OWNERS = (global.owner || []).map(o => o[0] + '@s.whatsapp.net');

  // Estrai l'utente da tag o numero
  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentionedJid && text) {
    if (text.endsWith('@s.whatsapp.net') || text.endsWith('@c.us')) {
      mentionedJid = text.trim();
    } else {
      let number = text.replace(/[^0-9]/g, '');
      if (number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net';
      }
    }
  }

  const chatId = m.chat;
  const botNumber = conn.user.jid;

  // Ottieni owner del gruppo
  let groupOwner = null;
  try {
    const metadata = await conn.groupMetadata(chatId);
    groupOwner = metadata.owner;
  } catch { groupOwner = null }

  if (!isAdmin)
    throw '╭━━━❌━━━╮\n 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n╰━━━❌━━━╯\n\nSolo gli admin possono usare questo comando.';

  if (!mentionedJid)
    return conn.reply(
      chatId,
      `╭━━━⚠️━━━╮\n 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎\n╰━━━⚠️━━━╯\nTagga un utente da ${
        command === 'muta' ? 'mutare 🔇' : 'smutare 🔊'
      }`,
      m
    );

  // Protezioni
  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid))
    throw '╭━━━👑━━━╮\n 𝐏𝐑𝐎𝐓𝐄𝐓𝐓𝐎\n╰━━━👑━━━╯\nNon puoi mutare questo utente (owner/creator/bot).';

  // Prepara dati utente nel db
  const user = global.db.data.users[mentionedJid];
  const isMute = command === 'muta';
  const tag = '@' + mentionedJid.split('@')[0];

  if (isMute) {
    if (user.muto) throw '⚠️ L’utente è già mutato.';
    user.muto = true;

    return conn.sendMessage(chatId, {
      text: `╭━━━━━━━🔇━━━━━━━╮
   ✦ 𝐌𝐔𝐓𝐄 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎 ✦
╰━━━━━━━🔇━━━━━━━╯

👤 Utente: ${tag}
🔒 Stato: Mutato
⏳ Durata: Fino a .smuta`,
      mentions: [mentionedJid],
    });
  }

  // SMUTA
  if (!user.muto) throw '⚠️ L’utente non è mutato.';
  user.muto = false;

  return conn.sendMessage(chatId, {
    text: `╭━━━━━━━🔊━━━━━━━╮
   ✦ 𝐌𝐔𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ✦
╰━━━━━━━🔊━━━━━━━╯

👤 Utente: ${tag}
🔓 Stato: Smutato`,
    mentions: [mentionedJid],
  });
};

handler.command = /^(muta|smuta)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
