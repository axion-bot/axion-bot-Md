import { md5 } from '@realvare/baileys'
import fs from 'fs'

global.doxbinAccounts = global.doxbinAccounts || {};
global.doxDatabase = global.doxDatabase || [];

const handler = async (m, { conn, text, isGroup }) => {
  const senderNumber = m.sender.split('@')[0];

  if (text === 'crea') {
    if (global.doxbinAccounts[m.sender]) {
      return conn.sendMessage(m.chat, { text: `*⚠️ [𝖣ARKWEB - 𝖤𝖱𝖱𝖮𝖱]*\nHai già un account attivo associato a questo numero.\n\n*𝖨𝖣:* @${senderNumber}`, mentions: [m.sender] }, { quoted: m });
    }

    global.doxbinAccounts[m.sender] = {
      username: `user_${senderNumber.substring(0, 5)}`,
      dataCreazione: new Date().toLocaleString('it-IT'),
      doxPubblici: []
    };

    await m.react('📥');
    return conn.sendMessage(m.chat, { text: `*🟢 [𝖣ARKWEB - 𝖲𝖸𝖲𝖳𝖤𝖬]*\n\n     *« ACCOUNT CREATO »*\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• *𝖴𝗌𝖾𝗋:* @${senderNumber}\n• *𝖲𝗍𝖺𝗍𝗈:* 𝖠𝗍𝗍𝗂𝗏𝗈 (𝖫𝖾𝗏𝖾𝗅 𝟣)\n• *𝖣𝖺𝗍𝖺:* ${global.doxbinAccounts[m.sender].dataCreazione}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n*🌐 Configurazione completata.* Usa \`.darkweb\` per accedere al database.`, mentions: [m.sender] }, { quoted: m });
  }

  if (!global.doxbinAccounts[m.sender]) {
    return conn.sendMessage(m.chat, { text: `*🚨 [𝖣ARKWEB - 𝖠𝖢𝖢𝖤𝖲𝖲𝖮 𝖭𝖤𝖦𝖠𝖳𝖮]*\n\n𝖭𝗈𝗇 𝗉𝗈𝗌𝗌𝗂𝖾𝖽𝗂 𝗎𝗇 𝖺𝖼𝖼𝗈𝗎𝗇𝗍 𝗇𝖾𝗅 𝖽𝖺𝗍𝖺𝖻𝖺𝗌𝖾 𝖽𝗂 𝖠𝗑𝗂𝗈𝗇 𝖡𝗈𝗍.\n\n*⚡ 𝖯𝖤𝖱 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖱𝖳𝖨 𝖮𝖳𝖮𝖱𝖠:*\n𝖣𝗂𝗀𝗂𝗍𝖺: \`.darkweb crea\`` }, { quoted: m });
  }

  if (text && text.startsWith('pubblica ')) {
    const indexToPublish = parseInt(text.replace('pubblica ', '')) - 1;
    const mieiDoxPrivati = global.doxDatabase.filter(dox => dox.salvatoDa === m.sender);

    if (isNaN(indexToPublish) || !mieiDoxPrivati[indexToPublish]) {
      return conn.sendMessage(m.chat, { text: `*⚠️ [𝖨𝖭𝖣𝖨𝖢𝖤 𝖤𝖱𝖱𝖮𝖱]*\n𝖲𝗉𝖾𝖼𝗂𝖿𝗂𝖼𝖺 𝗎𝗇 𝗇umero 𝗏𝖺𝗅𝗂𝖽𝗈. 𝖤𝗌: \`.darkweb pubblica 1\`` }, { quoted: m });
    }

    const targetDox = mieiDoxPrivati[indexToPublish];

    const giaPubblicato = global.doxbinAccounts[m.sender].doxPubblici.some(d => d.telefono === targetDox.telefono);
    if (giaPubblicato) {
      return conn.sendMessage(m.chat, { text: `*⚠️ [𝖣ARKWEB]*\n𝖰𝗎𝖾𝗌𝗍𝗈 𝖽𝗈𝗑 è 𝗀𝗂à 𝗉𝗎𝖻𝖻𝗅𝗂𝖼𝖺𝗍𝗈 𝗌𝗎𝗅 𝗍𝗎𝗈 𝗉𝗋𝗈𝖿𝗂𝗅𝗈.` }, { quoted: m });
    }

    global.doxbinAccounts[m.sender].doxPubblici.push(targetDox);
    await m.react('🌍');
    return conn.sendMessage(m.chat, { text: `*𝖶𝖮𝖱𝖫𝖣𝖶𝖨𝖣𝖤 𝖭𝖤𝖳𝖶𝖮𝖱𝖪 🌐*\nIl report di *${targetDox.nome}* è stato caricato sui server pubblici Doxbin. Da ora è consultabile da tutti i membri registrati.` }, { quoted: m });
  }

  let txt = `*⚔️ DARKWEB 𝖭𝖤𝖳𝖶𝖮𝖱𝖪 ⚔️*\n`;
  txt += `* [ 𝖴𝖲𝖤𝖱 𝖯𝖠N𝖤𝖫: @${senderNumber} ]*\n`;
  txt += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;

  txt += `*📁 𝖨 𝖳𝖴𝖮𝖨 𝖣𝖮𝖷 𝖲𝖠𝖫𝖵𝖠𝖳𝖨 (𝖯𝖱𝖨𝖵𝖠𝖳𝖨):*\n`;
  const mieiDox = global.doxDatabase.filter(dox => dox.salvatoDa === m.sender);

  if (mieiDox.length === 0) {
    txt += `_⤷ Nessun record privato in archivio._\n\n`;
  } else {
    mieiDox.forEach((user, index) => {
      txt += `*${index + 1}.* 𝖭𝗈𝗆𝖾: \`${user.nome}\`\n`;
      txt += `   𝖳𝖾𝗅: \`+${user.telefono}\` | 𝖢𝗂𝗍𝗍à: \`${user.citta}\`\n`;
      txt += `   └ 🌍 _Per pubblicare:_ \`.darkweb pubblica ${index + 1}\` \n\n`;
    });
  }

  txt += `*🌍 𝖨 𝖳𝖴𝖮𝖨 𝖣𝖮𝖷 𝖯𝖴𝖡𝖡𝖫𝖨𝖢𝖠𝖳𝖨:*\n`;
  const mieiPubblici = global.doxbinAccounts[m.sender].doxPubblici || [];
  if (mieiPubblici.length === 0) {
    txt += `_⤷ Nessun file pubblicato sul profilo._\n\n`;
  } else {
    mieiPubblici.forEach((user, index) => {
      txt += ` 📥 [\`${user.nome}\`] ⇾ \`+${user.telefono}\`\n`;
    });
    txt += `\n`;
  }

  txt += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;
  txt += `*👥 𝖴𝖳𝖤𝖭𝖳𝖨 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖱𝖳𝖨 𝖭𝖤𝖫 𝖦𝖱𝖴𝖯𝖯𝖮:*\n`;

  if (!isGroup) {
    txt += `_Disponibile solo all'interno dei gruppi._\n`;
  } else {
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);
    const utentiRegistrati = participants.filter(p => global.doxbinAccounts[p]);

    if (utentiRegistrati.length === 0) {
      txt += `_Nessun altro utente registrato in questa chat._\n`;
    } else {
      utentiRegistrati.forEach((p, idx) => {
        const numArr = p.split('@')[0];
        const countPubblici = global.doxbinAccounts[p].doxPubblici ? global.doxbinAccounts[p].doxPubblici.length : 0;
        txt += `*•* @${numArr} ⇾ [ 📑 \`${countPubblici} 𝖯𝗎𝖻𝖻𝗅𝗂𝖼𝗂\` ]\n`;
      });
    }
  }

  txt += `\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`;

  const tutteMentions = [m.sender];
  if (global.doxbinAccounts) {
    tutteMentions.push(...Object.keys(global.doxbinAccounts));
  }

  await conn.sendMessage(m.chat, {
    text: txt,
    mentions: tutteMentions
  }, { quoted: m });
};

handler.help = ['doxbin'];
handler.tags = ['giochi'];
handler.command = /^darkweb/i;
handler.group = false;

export default handler;
