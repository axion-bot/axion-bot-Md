import { performance } from 'perf_hooks';

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userId = message.sender;
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const totalUsers = Object.keys(global.db?.data?.users || {}).length;

    const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐆𝐀𝐌𝐄 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* ɢɪᴏᴄʜɪ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🕹️ ɢɪᴏᴄʜɪ 〕━⬣
┃ ❌⭕ ${usedPrefix}tris
┃ 🏟️ ${usedPrefix}schedina <euro>
┃ 🪢 ${usedPrefix}impiccato
┃ 🤣 ${usedPrefix}meme
┃ 🍣 ${usedPrefix}cibo
┃ 🚩 ${usedPrefix}bandiera
┃ 🏆 ${usedPrefix}classificabandiera
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎲 ғᴜɴ 〕━⬣
┃ 🔮 ${usedPrefix}random <reply/tag>
┃ 🗓️ ${usedPrefix}ricorda <orario>
┃ 🔥 ${usedPrefix}flame <reply/tag>
┃ 💋 ${usedPrefix}bacia <reply/tag>
┃ 🤗 ${usedPrefix}abbraccia <reply/tag>
┃ 😏 ${usedPrefix}sega <reply/tag>
┃ 🤟 ${usedPrefix}ditalino <reply/tag>
┃ 🏷️ ${usedPrefix}sticker / ${usedPrefix}s
┃ 🛑 ${usedPrefix}ia <messaggio>
┃ ✨ ${usedPrefix}wm <messaggio>
┃ 🎶 ${usedPrefix}cur
┃ 🩵 ${usedPrefix}onlyfans <nome>
┃ 💼 ${usedPrefix}curriculum
┃ 🏬 ${usedPrefix}shop
┃ 🎒 ${usedPrefix}zaino
┃ 🤑 ${usedPrefix}vedioggetto <numero>
┃ 📰 ${usedPrefix}dox
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💍 ғᴀᴍɪɢʟɪᴀ 〕━⬣
┃ 💫 ${usedPrefix}stato
┃ 🏠 ${usedPrefix}famiglia
┃ 👰 ${usedPrefix}sposa
┃ 💔 ${usedPrefix}divorzia
┃ 🤝 ${usedPrefix}amicizia <reply/tag>
┃ 👩 ${usedPrefix}madre <reply/tag>
┃ 👨 ${usedPrefix}padre <reply/tag>
┃ 👶 ${usedPrefix}figlio <reply/tag>
┃ 🧑‍🤝‍🧑 ${usedPrefix}fratello <reply/tag>
┃ 👭 ${usedPrefix}sorella <reply/tag>
┃ 👴 ${usedPrefix}nonno <reply/tag>
┃ 👵 ${usedPrefix}nonna <reply/tag>
┃ 👬 ${usedPrefix}cugino <reply/tag>
┃ 👭 ${usedPrefix}cugina <reply/tag>
┃ 🗑️ ${usedPrefix}delrelazione <tipo> <reply/tag>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🆘 sᴜᴘᴘᴏʀᴛᴏ 〕━⬣
┃ 🆘 ${usedPrefix}help <motivo>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: 1.0
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim();

    await conn.sendMessage(message.chat, {
        text: menuBody,
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

handler.help = ['giochi', 'menugiochi'];
handler.tags = ['menu'];
handler.command = /^(giochi|menugiochi)$/i;

export default handler;