import { performance } from 'perf_hooks'

const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐈𝐌𝐀𝐆𝐄 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* ɪᴍᴀɢɪɴɪ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🧪 ᴍᴇᴛʀɪ ᴅɪᴠᴇʀᴛᴇɴᴛɪ 〕━⬣
┃ 🥰 ${usedPrefix}bellometro
┃ 🌈 ${usedPrefix}gaymetro
┃ 💖 ${usedPrefix}lesbiometro
┃ 🍆 ${usedPrefix}masturbometro
┃ 🍀 ${usedPrefix}fortunometro
┃ 🧠 ${usedPrefix}intelligiometro
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎭 ɪᴍᴍᴀɢɪɴɪ ᴍᴇᴍᴇ 〕━⬣
┃ 💦 ${usedPrefix}sborra
┃ ❤️ ${usedPrefix}il
┃ 🕴 ${usedPrefix}wasted
┃ 💂 ${usedPrefix}comunista
┃ 👙 ${usedPrefix}bisex
┃ 🏳️‍🌈 ${usedPrefix}gay
┃ 🃏 ${usedPrefix}simpcard
┃ 🏳️‍⚧️ ${usedPrefix}trans
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

handler.help = ['immagini']
handler.tags = ['menu']
handler.command = /^(immagini)$/i

export default handler