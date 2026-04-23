//MenuOwner by Bonzino

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

╭━━━〔 👤 ɢᴇsᴛɪᴏɴᴇ ᴜᴛᴇɴᴛɪ 〕━⬣
┃ 🛡️ ${usedPrefix}addmod
┃ ❌ ${usedPrefix}delmod
┃ 🗑️ ${usedPrefix}resetmod
┃ 🚫 ${usedPrefix}blocca/sblocca <utente>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📊 sᴛᴀᴛɪsᴛɪᴄʜᴇ ᴜᴛᴇɴᴛɪ 〕━⬣
┃ 💰 ${usedPrefix}add <quantità>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 ɢᴇsᴛɪᴏɴᴇ ɢʀᴜᴘᴘɪ 〕━⬣
┃ ➕ ${usedPrefix}adduser <utente> <link/id>
┃ ➖ ${usedPrefix}kickuser <utente> <link/id>
┃ 📥 ${usedPrefix}join <link>
┃ 🆔 ${usedPrefix}getid <link>
┃ 🔗 ${usedPrefix}linktoid <link>
┃ 🧩 ${usedPrefix}idtolink <id>
┃ 📂 ${usedPrefix}gruppi
┃ 🚪 ${usedPrefix}esci <numero>
┃ 👋 ${usedPrefix}out
┃ 🌙 ${usedPrefix}bangp <link/id>
┃ ☀️ ${usedPrefix}unbangp <link/id>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛡️ ɢᴇsᴛɪᴏɴᴇ ᴀᴅᴍɪɴ 〕━⬣
┃ 👑 ${usedPrefix}godmode
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 ɢᴇsᴛɪᴏɴᴇ ʙᴏᴛ 〕━⬣
┃ 📢 ${usedPrefix}tuttigp
┃ 🌐 ${usedPrefix}aggiorna
┃ 🔄 ${usedPrefix}restart
┃ 💾 ${usedPrefix}backupdb
┃ ♻️ ${usedPrefix}autodb
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📦 ɢᴇsᴛɪᴏɴᴇ ᴘᴀᴄᴄʜᴇᴛᴛɪ 〕━⬣
┃ 📂 ${usedPrefix}pacchetti
┃ 📥 ${usedPrefix}installa <nome>
┃ 🚀 ${usedPrefix}installapush <nome>
┃ 📦 ${usedPrefix}installaall
┃ 🗑️ ${usedPrefix}rimuovi <nome>
┃ ❌ ${usedPrefix}rimuovipush <nome>
┃ 🔍 ${usedPrefix}npmver <nome>
┃ ⚙️ ${usedPrefix}npmi <nome>
┃ 📤 ${usedPrefix}npmipush <nome>
┃ 🧹 ${usedPrefix}npmrm <nome>
┃ 📉 ${usedPrefix}npmrmpush <nome>
┃ 📜 ${usedPrefix}npmdl
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🧩 ɢᴇsᴛɪᴏɴᴇ ᴘʟᴜɢɪɴ 〕━⬣
┃ 🗂️ ${usedPrefix}getpl
┃ 🐞 ${usedPrefix}debugplugin <id>
┃ 🧪 ${usedPrefix}db <id>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🛠️ sᴛʀᴜᴍᴇɴᴛɪ ᴏᴡɴᴇʀ 〕━⬣
┃ 🏹 ${usedPrefix}bigtag
┃ ✋ ${usedPrefix}stop
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
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