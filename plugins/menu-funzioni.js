import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db?.data?.chats?.[m.chat] || {}
  const bot = global.db?.data?.settings?.[conn.user.jid] || {}

  let pp = null
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {}

  let thumbnail = null
  try {
    if (pp) {
      const res = await fetch(pp)
      if (res.ok) thumbnail = Buffer.from(await res.arrayBuffer())
    }
  } catch {}

  if (!thumbnail) {
    try {
      thumbnail = fs.readFileSync('./media/default-avatar.png')
    } catch {}
  }

  const estado = (value) => value ? '🟢 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ'

  const text = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 』
╼━━━━━━━━━━━━━━╾

🛡️ *sɪᴄᴜʀᴇᴢᴢᴀ*
◈ antilink → ${estado(chat.antiLink)}
◈ antispam → ${estado(chat.antispam)}
◈ antibot → ${estado(chat.antiBot)}
◈ antitag → ${estado(chat.antiTag)}
◈ antiporno → ${estado(chat.antiporno)}
◈ antigore → ${estado(chat.antigore)}
◈ antitrava → ${estado(chat.antitrava)}

📱 *ʀᴇᴛᴇ*
◈ antiinsta → ${estado(chat.antiInsta)}
◈ antitelegram → ${estado(chat.antiTelegram)}
◈ antitiktok → ${estado(chat.antiTiktok)}

⚙️ *ɢᴇsᴛɪᴏɴᴇ*
◈ modoadmin → ${estado(chat.modoadmin)}
◈ benvenuto → ${estado(chat.welcome)}
◈ addio → ${estado(chat.goodbye)}

🔒 *ᴘʀɪᴠᴀᴛᴏ*
◈ antiprivato → ${estado(bot.antiprivato)}

╼━━━━━━━━━━━━━━╾
┃ Attiva → ${usedPrefix}1 <funzione>
┃ Disattiva → ${usedPrefix}0 <funzione>
╰━━━━━━━━━━━━━━╾
`.trim()

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      ...(thumbnail ? {
        externalAdReply: {
          title: '𝚫𝐗𝐈𝐎𝐍 • 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈',
          body: 'Stato moduli del sistema',
          thumbnail,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      } : {})
    }
  }, { quoted: m })
}

handler.help = ['funzioni']
handler.tags = ['group']
handler.command = /^(funzioni|statusfunzioni|moduli)$/i

export default handler