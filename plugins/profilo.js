// by Bonzino

import fetch from 'node-fetch'
import { getLevelFull } from '../lib/levels.js'

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

let handler = async (m, { conn }) => {
  const target = m.sender
  const user = global.db.data.users[target] || {}
  const chat = global.db.data.chats?.[m.chat] || {}

  const oggiCount = chat?.archivioMessaggi?.utenti?.[target]?.conteggio || 0
  const nome = await conn.getName(target)
  const totalMessages = user.messages || 0
  const monete = user.euro || 0
  const dailyStreak = Number(user.dailyStreak || 0)
  const lvl = getLevelFull(totalMessages)

  const instagram = user.profile?.instagram
    ? `instagram.com/${user.profile.instagram}`
    : '𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨'

  const profilo = await conn.profilePictureUrl(target, 'image')
    .catch(() => 'https://i.ibb.co/2kR7x9J/avatar.png')

  const thumbnailBuffer = typeof profilo === 'string'
    ? await (await fetch(profilo)).buffer()
    : profilo

  const text = `*╭━━━━━━━✨━━━━━━━╮*
   *✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
*╰━━━━━━━✨━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* ${totalMessages}
*📅 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢:* ${oggiCount}
*🧠 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${lvl.level} (${lvl.icon} ${lvl.name})
*📈 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨:* ${lvl.bar} ${lvl.percent}%
*⬆️ 𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐨:* ${lvl.isMax ? '*𝐌𝐀𝐗*' : `${lvl.nextName} (${lvl.remaining} msg)`}
*🪙 𝐌𝐨𝐧𝐞𝐭𝐞:* ${monete}
*🎁 𝐒𝐭𝐫𝐞𝐚𝐤 𝐃𝐚𝐢𝐥𝐲:* ${dailyStreak} 𝐠𝐢𝐨𝐫𝐧𝐢
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [target],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [target],
      externalAdReply: {
        title: nome,
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['profilo', 'profile']
handler.tags = ['info']
handler.command = /^(profilo|profile)$/i

export default handler