import { performance } from 'perf_hooks';

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userId = message.sender
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)
    const totalUsers = Object.keys(global.db?.data?.users || {}).length

    const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐀𝐃𝐌𝐈𝐍 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴀᴄᴄᴇssᴏ:* ᴀᴅᴍɪɴ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🛠️ ɢᴇsᴛɪᴏɴᴇ 〕━⬣
┃ 🚨 ${usedPrefix}reimpostalink
┃ 🛡️ ${usedPrefix}admins
┃ ✅ ${usedPrefix}richieste
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚠️ ᴡᴀʀɴ 〕━⬣
┃ ⚠️ ${usedPrefix}warn
┃ ✅ ${usedPrefix}unwarn
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔇 ᴄᴏɴᴛʀᴏʟʟᴏ 〕━⬣
┃ 🤫 ${usedPrefix}muta
┃ 🔊 ${usedPrefix}smuta
┃ 🏹 ${usedPrefix}tag
┃ 🚨 ${usedPrefix}setname
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔒 ɪᴍᴘᴏsᴛᴀᴢɪᴏɴɪ 〕━⬣
┃ 🌙 ${usedPrefix}aperto
┃ 🔐 ${usedPrefix}chiuso
┃ 📳 ${usedPrefix}listamod
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 ɢᴇsᴛɪᴏɴᴇ 〕━⬣
┃ ⚔️ ${usedPrefix}kick
┃ 🚨 ${usedPrefix}nuke
┃ 🔮 ${usedPrefix}resucita
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔗 ʟɪɴᴋ ɢʀᴜᴘᴘᴏ 〕━⬣
┃ 🔗 ${usedPrefix}link
┃ 📥 ${usedPrefix}prendilink
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: 1.0
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(message.chat, {
        text: menuBody,
        mentions: [userId]
    }, { quoted: message })
}

function clockString(ms) {
    const d = Math.floor(ms / 86400000)
    const h = Math.floor(ms / 3600000) % 24
    const m = Math.floor(ms / 60000) % 60
    const s = Math.floor(ms / 1000) % 60
    return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['admin']
handler.tags = ['menu']
handler.command = /^(admin)$/i

export default handler