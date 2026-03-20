import { performance } from 'perf_hooks';

let pkg;
try {
    pkg = require('../package.json');
} catch {
    pkg = { version: 'unknown' };
}

const handler = async (message, { conn, usedPrefix = '.' }) => {
    const userId = message.sender || message.key.participant || message.key.remoteJid;

    const old = performance.now();

    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const totalUsers = Object.keys(global.db?.data?.users || {}).length;
    const totalCommands = Object.keys(global.plugins || {}).length;

    const ping = Math.round(performance.now() - old);

    const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐈𝐍𝐅𝐎 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴏᴍᴀɴᴅɪ:* ${totalCommands}
  ◈ *ᴘɪɴɢ:* ${ping} ᴍs
  ◈ *ᴅᴇᴠ:* _*Deadly & Staff*_
  ◈ *ᴠᴇʀsɪᴏɴᴇ:* 1.0
  ◈ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*
╼━━━━━━━━━━━━━━╾
`.trim();

    const buttons = [
        { buttonId: `${usedPrefix}admin`, buttonText: { displayText: '🛡️ ADMIN' }, type: 1 },
        { buttonId: `${usedPrefix}mod`, buttonText: { displayText: '🧑‍⚖️ MOD' }, type: 1 },
        { buttonId: `${usedPrefix}owner`, buttonText: { displayText: '👑 OWNER' }, type: 1 },
        { buttonId: `${usedPrefix}funzioni`, buttonText: { displayText: '⚙️ FUNZIONI' }, type: 1 },
        { buttonId: `${usedPrefix}giochi`, buttonText: { displayText: '🎮 GIOCHI' }, type: 1 },
        { buttonId: `${usedPrefix}soldi`, buttonText: { displayText: '💰 SOLDI' }, type: 1 },
        { buttonId: `${usedPrefix}immagini`, buttonText: { displayText: '🖼️ IMMAGINI' }, type: 1 },
        { buttonId: `${usedPrefix}staff`, buttonText: { displayText: '👥 STAFF' }, type: 1 }
    ];

    await conn.sendMessage(message.chat, {
        image: { url: './media/main-menu.jpeg' },
        caption: menuBody,
        footer: 'sᴇʟᴇᴢɪᴏɴᴀ ᴜɴ ᴍᴏᴅᴜʟᴏ ᴅᴀʟʟ\'ɪɴᴛᴇʀғᴀᴄᴄɪᴀ',
        buttons: buttons,
        headerType: 4,
        mentions: [userId]
    }, { quoted: message });
};

function clockString(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

handler.help = ['menu', 'comandi'];
handler.tags = ['menu'];
handler.command = ['menu'];

export default handler;
