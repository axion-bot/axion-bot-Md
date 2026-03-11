import fs from 'fs';

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner }) => {

  const isEnable = /attiva|enable|on|1/i.test(command);
  const chats = global.db.data.chats;
  const settings = global.db.data.settings;

  chats[m.chat] ??= {};
  settings[conn.user.jid] ??= {};

  const chat = chats[m.chat];
  const bot = settings[conn.user.jid];

  // ================== RECUPERO IMMAGINE PROFILO ==================
  let pp;
  try { 
    pp = await conn.profilePictureUrl(m.sender, 'image'); 
  } catch { 
    pp = null; 
  }

  const getBuffer = async (url) => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  };

  const profileBuffer = await getBuffer(pp);

  // ================== GRAFICA 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ==================
  const box = (title, stato, desc) => {
    return `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐂𝐎𝐑𝐄 』
╼━━━━━━━━━━━━━━╾
  ◈ *ғᴜɴᴢɪᴏɴᴇ:* ${title}
  ◈ *sᴛᴀᴛᴏ:* ${stato}
╼━━━━━━━━━━━━━━╾
  ⌬ ${desc}
`.trim();
  };

  const noAdmin = box('ᴀᴄᴄᴇssᴏ NEGATO', '🛑 sɪsᴛᴇᴍ ʟᴏᴄᴋ', 'Permessi amministratore mancanti.');
  const noOwner = box('ᴘʀɪᴠɪʟᴇɢɪᴏ 𝛥𝐗𝐈𝚶𝐍', '⚠️ ʀᴇsᴛʀɪᴛᴛᴏ', 'Accesso riservato al Mainframe Owner.');

  if (!args[0]) {
    throw `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐈𝐍𝐓𝐄𝐑𝐅𝐀𝐂𝐄 』
╼━━━━━━━━━━━━━━╾
  💡 *ᴄᴍᴅ:*
.1 <funzione>
.0 <funzione>

  *sɪᴄᴜʀᴇᴢᴢᴀ:*
  🛡️ antilink, antispam, antibot
  🔞 antiporno, antigore, antitrava
  🔒 antinuke, antitag, antiprivato
  
  **ʀᴇᴛᴇ:**
  📱 antiinsta, antitelegram, antitiktok
  
  **ɢᴇsᴛɪᴏɴᴇ:**
  ⚙️ modoadmin, benvenuto, addio
╼━━━━━━━━━━━━━━╾`.trim();
  }

  let feature = args[0].toLowerCase();
  let result = '';

  // ================== SWITCH FUNZIONI ==================
  switch(feature) {
    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiLink = isEnable;
      result = box('ᴀɴᴛɪʟɪɴᴋ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Protocollo blocco link attivo');
      break;

    case 'antiinsta':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiInsta = isEnable;
      result = box('ᴀɴᴛɪ-ɪɴsᴛᴀɢʀᴀᴍ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Filtro sorgente Instagram');
      break;

    case 'antitelegram':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiTelegram = isEnable;
      result = box('ᴀɴᴛɪ-ᴛᴇʟᴇɢʀᴀᴍ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Filtro sorgente Telegram');
      break;

    case 'antitiktok':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiTiktok = isEnable;
      result = box('ᴀɴᴛɪ-ᴛɪᴋᴛᴏᴋ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Filtro sorgente TikTok');
      break;

    case 'antitag':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiTag = isEnable;
      result = box('ᴀɴᴛɪ-ᴛᴀɢ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Protezione tag invasivi');
      break;

    case 'antinuke':
      if (!isOwner && !isROwner) return m.reply(noOwner);
      chat.antinuke = isEnable;
      result = box('ᴀɴᴛɪ-ɴᴜᴋᴇ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Integrità gruppo garantita');
      break;

    case 'antigore':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antigore = isEnable;
      result = box('ᴀɴᴛɪ-ɢᴏʀᴇ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Soppressione contenuti violenti');
      break;

    case 'antiporno':
    case 'antiporn':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiporno = isEnable;
      result = box('ᴀɴᴛɪ-ᴘᴏʀɴᴏ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Filtro neurale NSFW');
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.modoadmin = isEnable;
      result = box('ᴍᴏᴅᴏ ᴀᴅᴍɪɴ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Restrizione comandi allo staff');
      break;

    case 'benvenuto':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.welcome = isEnable;
      result = box('ᴡᴇʟᴄᴏᴍᴇ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Log d\'ingresso abilitato');
      break;

    case 'addio':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.goodbye = isEnable;
      result = box('ɢᴏᴏᴅʙʏᴇ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Log d\'uscita abilitato');
      break;

    case 'antiprivato':
      if (!isOwner && !isROwner) return m.reply(noOwner);
      bot.antiprivato = isEnable;
      result = box('ᴀɴᴛɪ-ᴘʀɪᴠᴀᴛᴏ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Firewall DM attivato');
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antiBot = isEnable;
      result = box('ᴀɴᴛɪ-ʙᴏᴛ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Neutralizzazione bot esterni');
      break;

    case 'antispam':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antispam = isEnable;
      result = box('ᴀɴᴛɪ-sᴘᴀᴍ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Analisi traffico messaggi');
      break;

    case 'antitrava':
      if (m.isGroup && !(isAdmin || isOwner || isROwner)) return m.reply(noAdmin);
      chat.antitrava = isEnable;
      result = box('ᴀɴᴛɪ-ᴛʀᴀᴠᴀ', (isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'), 'Difesa crash-payload');
      break;

    default:
      return m.reply(box('ᴜɴᴋɴᴏᴡɴ', '⚠️ ᴡᴀʀɴɪɴɢ', 'Modulo non riconosciuto dal sistema Axion.'));
  }

  // ================== INVIO FINALE ==================
  await conn.sendMessage(m.chat, {
    text: result,
    contextInfo: {
      externalAdReply: {
        title: '𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐒',
        body: `Utenza: ${m.pushName}`,
        thumbnail: profileBuffer,
        sourceUrl: '', 
        mediaType: 1,
        renderLargerThumbnail: false 
      }
    }
  }, { quoted: m });
};

handler.help = ['attiva','disattiva'];
handler.tags = ['group'];
handler.command = ['attiva','disattiva','enable','disable','on','off','1','0'];

export default handler;
