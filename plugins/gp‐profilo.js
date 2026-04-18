// by Bonzino

import fetch from 'node-fetch'
import fs from 'fs'
import { getLevelFull } from '../lib/levels.js'

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

let handler = async (m, { conn }) => {
  const target = m.sender
  const user = global.db.data.users[target] || {}
  const chat = global.db.data.chats?.[m.chat] || {}

  const oggiCount = chat?.classificaGiornaliera?.utenti?.[target]?.conteggio || 0
  const totalMessages = user.messages || 0

  const nome = await conn.getName(target)
  const monete = user.euro || 0
  const dailyStreak = Number(user.dailyStreak || 0)
  const lvl = getLevelFull(totalMessages)

  const instagram = user.profile?.instagram
    ? `instagram.com/${user.profile.instagram}`
    : '*𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨*'

  let profilo
  try {
    profilo = await conn.profilePictureUrl(target, 'image')
  } catch {
    profilo = fs.readFileSync('./media/default-avatar.png')
  }

  const thumbnailBuffer = typeof profilo === 'string'
    ? await (await fetch(profilo)).buffer()
    : profilo

  const text = `╭━━━━━━━✨━━━━━━━╮
*✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
╰━━━━━━━✨━━━━━━━╯

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* ${totalMessages} *(𝐨𝐠𝐠𝐢: ${oggiCount})*
*🧠 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${lvl.level} (${lvl.icon} ${lvl.name})
*📈 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨:* ${lvl.percent}%
*⬆️ 𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐨:* ${lvl.isMax ? '*𝐌𝐀𝐗*' : `${lvl.nextName} (${lvl.remaining} msg)`}
*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* ${monete}
*🎁 𝐒𝐭𝐫𝐞𝐚𝐤 𝐃𝐚𝐢𝐥𝐲:* ${dailyStreak} 𝐠𝐢𝐨𝐫𝐧𝐢
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}`

  await conn.sendMessage(m.chat, {
  text,
  mentions: [target],
  footer: '',
  buttons: [
    {
      buttonId: '.wallet',
      buttonText: { displayText: '💰 Portafoglio' },
      type: 1
    },
    {
      buttonId: '.posizione',
      buttonText: { displayText: '🏆 Posizione' },
      type: 1
    }
  ],
  headerType: 1,
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