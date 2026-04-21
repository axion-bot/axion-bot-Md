import { performance } from 'perf_hooks'

const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐎𝐖𝐍𝐄𝐑 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴀᴄᴄᴇssᴏ:* ᴏᴡɴᴇʀ
╼━━━━━━━━━━━━━━╾

╭━━━〔 👥 ɢᴇsᴛɪᴏɴᴇ ᴜᴛᴇɴᴛɪ 〕━⬣
┃ 🛡️ ${usedPrefix}addmod
┃ ❌ ${usedPrefix}delmod
┃ 🗑️ ${usedPrefix}resetmod
┃ 🚫 ${usedPrefix}blocca/sblocca <utente>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 ɢᴇsᴛɪᴏɴᴇ ʙᴏᴛ 〕━⬣
┃ 📥 ${usedPrefix}join <link>
┃ 💾 ${usedPrefix}reimpostagp
┃ 📢 ${usedPrefix}tuttigp
┃ 🆔 ${usedPrefix}getid <link>
┃ 👋 ${usedPrefix}out
┃ 🌐 ${usedPrefix}aggiorna
┃ 🔄 ${usedPrefix}restart
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ✨ ғᴜɴᴢɪᴏɴɪ sᴘᴇᴄɪᴀʟɪ 〕━⬣
┃ 🏹 ${usedPrefix}bigtag
┃ 📂 ${usedPrefix}gruppi
┃ 🚪 ${usedPrefix}esci <numero>
┃ 🌙 ${usedPrefix}banchat
┃ ☀️ ${usedPrefix}unbanchat
┃ 🧑‍💻 ${usedPrefix}dispositivo <reply/tag>
┃ 🗂️ ${usedPrefix}getpl
┃ 📥 ${usedPrefix}picchetti <installa moduli mancanti>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: 1.0
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓*',
    buttons: [
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '⬅️ Menu Principale' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: message })
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['owner']
handler.tags = ['menu']
handler.command = /^(owner)$/i
handler.rowner = true

export default handler