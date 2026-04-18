const handler = async (message, { conn, usedPrefix = '.' }) => {
    const userId = message.sender;
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const totalUsers = Object.keys(global.db?.data?.users || {}).length;

    const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *sɪsᴛᴇᴍᴀ:* ᴇᴄᴏɴᴏᴍʏ
╼━━━━━━━━━━━━━━╾

╭━━━〔 💰 sɪsᴛᴇᴍᴀ sᴏʟᴅɪ 〕━⬣
┃ 👛 ${usedPrefix}wallet
┃ 🎁 ${usedPrefix}daily
┃ 💰 ${usedPrefix}deposita
┃ 🏧 ${usedPrefix}prelievo
┃ 🤝 ${usedPrefix}bonifico <reply/tag>
┃ 🥷 ${usedPrefix}crimine
┃ 😅 ${usedPrefix}elemosina
┃ 💼 ${usedPrefix}lavora
┃ 🏪 ${usedPrefix}shop
┃ 🎒 ${usedPrefix}zaino
┃ 📤 ${usedPrefix}vendioggetto <numero>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📊 ɪɴғᴏ 〕━⬣
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

handler.help = ['soldi'];
handler.tags = ['menu'];
handler.command = /^(soldi)$/i;

export default handler;