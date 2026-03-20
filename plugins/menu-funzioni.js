import { performance } from 'perf_hooks';

const handler = async (m, { conn, usedPrefix = '.' }) => {

  const userId = m.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const chat = global.db.data.chats[m.chat] || {}
  const bot = global.db.data.settings[conn.user.jid] || {}

  const stato = (v) => v ? '🟢 ᴏɴ' : '🔴 ᴏғғ'

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴍᴏᴅᴜʟᴏ:* ғᴜɴᴢɪᴏɴɪ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🧰 ᴄᴏᴍᴀɴᴅɪ 〕━⬣
┃ 🔘 Attiva → ${usedPrefix}1 <funzione>
┃ ⚫ Disattiva → ${usedPrefix}0 <funzione>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛡️ ᴘʀᴏᴛᴇᴢɪᴏɴɪ 〕━⬣
┃ 🔗 AntiLink → ${stato(chat.antiLink)}
┃ 🧱 AntiTrava → ${stato(chat.antitrava)}
┃ 🛑 AntiSpam → ${stato(chat.antispam)}
┃ 🤖 AntiBot → ${stato(chat.antiBot)}
┃ 📸 AntiInsta → ${stato(chat.antiInsta)}
┃ ✈️ AntiTelegram → ${stato(chat.antiTelegram)}
┃ 🎵 AntiTiktok → ${stato(chat.antiTiktok)}
┃ 🏷️ AntiTag → ${stato(chat.antiTag)}
┃ 🚫 AntiGore → ${stato(chat.antigore)}
┃ 🔞 AntiPorno → ${stato(chat.antiporno)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔒 ᴄᴏɴᴛʀᴏʟʟᴏ 〕━⬣
┃ 🛡️ SoloAdmin → ${stato(chat.modoadmin)}
┃ 👋 Benvenuto → ${stato(chat.welcome)}
┃ 🚪 Addio → ${stato(chat.goodbye)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👑 sɪᴄᴜʀᴇᴢᴢᴀ ʙᴏᴛ 〕━⬣
┃ 🔒 AntiPrivato → ${stato(bot.antiprivato)}
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ᴜᴛɪʟɪᴢᴢᴏ 〕━⬣
┃ Attiva → ${usedPrefix}1 antifunzione
┃ Disattiva → ${usedPrefix}0 antifunzione
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(m.chat, {
    text: menuBody,
    mentions: [userId]
  }, { quoted: m })

}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['funzioni']
handler.tags = ['menu']
handler.command = /^(funzioni)$/i

export default handler