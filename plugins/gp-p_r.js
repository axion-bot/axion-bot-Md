// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')

var handler = async (m, { conn, text, command }) => {
  let action, title, icon
  const sender = m.sender

  let users = m.mentionedJid && m.mentionedJid.length > 0
    ? m.mentionedJid
    : (m.quoted ? [m.quoted.sender] : [])

  if (!users.length && text) {
    const numbers = S(text).split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  if (!users.length) {
    return conn.reply(m.chat, '*⚠️ 𝐈𝐧𝐝𝐢𝐜𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*', m)
  }

  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    icon = '👑'
    title = '𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄'
  } else {
    action = 'demote'
    icon = '🙇‍♂️'
    title = '𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, users, action)

    let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
    try {
      thumb = await conn.profilePictureUrl(m.chat, 'image')
    } catch {}

    const thumbnailBuffer = typeof thumb === 'string'
      ? await (await fetch(thumb)).buffer()
      : thumb

    const tagList = users.map(u => `• @${u.split('@')[0]}`).join('\n')

    const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

*👤 𝐄𝐬𝐞𝐜𝐮𝐭𝐨𝐫𝐞:* @${sender.split('@')[0]}
*📌 𝐀𝐳𝐢𝐨𝐧𝐞:* ${title}
*✅ 𝐄𝐬𝐢𝐭𝐨:* 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}`

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [sender, ...users],
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: 'Gestione permessi gruppo',
          body: ' ',
          thumbnail: thumbnailBuffer,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*', m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler