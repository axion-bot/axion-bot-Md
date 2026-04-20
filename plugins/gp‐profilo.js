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
  const chat = global.db.data.chats?.[m.chat] || {

  const oggiCount = chat?.classificaGiornaliera?.utenti?.[target]?.conteggio || 0
  const totalMessages = user.messages || 0
  const totalCommands = user.commandCount || 0

  const nome = await conn.getName(target)
  const monete = user.euro || 0
  const animaleDomestico = user.animale
  ? `${user.animale.emoji} ${user.animale.nome}`
  : '*𝐍𝐞𝐬𝐬𝐮𝐧𝐨*'
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
    ? Buffer.from(await (await fetch(profilo)).arrayBuffer())
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
**🕹 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐔𝐬𝐚𝐭𝐢:* ${totalCommands}
*🐾 𝐀𝐧𝐢𝐦𝐚𝐥𝐞 𝐃𝐨𝐦𝐞𝐬𝐭𝐢𝐜𝐨:* ${animaleDomestico}
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

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

  await conn.sendMessage(m.chat, {
    text: '*𝐒𝐄𝐋𝐄𝐙𝐈𝐎𝐍𝐀 𝐔𝐍’𝐎𝐏𝐙𝐈𝐎𝐍𝐄:*',
    footer: '> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
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
    headerType: 1
  }, { quoted: m })
}

handler.help = ['profilo', 'profile']
handler.tags = ['info']
handler.command = /^(profilo|profile)$/i

export default handler