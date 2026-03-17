import { performance } from 'perf_hooks';

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userId = message.sender;
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const totalUsers = Object.keys(global.db?.data?.users || {}).length;

    // Testo principale con statistiche e info sistema
    const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐈𝐍𝐅𝐎 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴅᴇᴠ:* 𝕯𝖊ⱥ𝖉𝖑𝐲
  ◈ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚫𝐗𝐈𝐎𝐍*
╼━━━━━━━━━━━━━━╾
`.trim();

    // Configurazione completa di tutti i bottoni del menu
    const buttons = [
        { buttonId: `${usedPrefix}admin`, buttonText: { displayText: '🛡️ ADMIN' }, type: 1 },
        { buttonId: `${usedPrefix}mod`, buttonText: { displayText: '🧑‍⚖️ MOD' }, type: 1 },
        { buttonId: `${usedPrefix}owner`, buttonText: { displayText: '👑 OWNER' }, type: 1 },
        { buttonId: `${usedPrefix}funzioni`, buttonText: { displayText: '⚙️ FUNZIONI' }, type: 1 },
        { buttonId: `${usedPrefix}giochi`, buttonText: { displayText: '🎮 GIOCHI' }, type: 1 },
        { buttonId: `${usedPrefix}soldi`, buttonText: { displayText: '💰 SOLDI' }, type: 1 },
        { buttonId: `${usedPrefix}immagini`, buttonText: { displayText: '🖼️ IMMAGINI' }, type: 1 }
    ];

    await conn.sendMessage(message.chat, {
        text: menuBody,
        footer: 'sᴇʟᴇᴢɪᴏɴᴀ ᴜɴ ᴍᴏᴅᴜʟᴏ ᴅᴀʟʟ\'ɪɴᴛᴇʀғᴀᴄᴄɪᴀ',
        buttons: buttons,
        headerType: 1,
        mentions: [userId]
    }, { quoted: message });
};

// Funzione calcolo tempo di attività
function clockString(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

handler.help = ['menu', 'comandi'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;

export default handler;
