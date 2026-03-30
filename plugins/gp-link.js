// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('*𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = Array.isArray(metadata.participants) ? metadata.participants : []

  const totalAdmins = participants.filter(p => p.admin).length
  const totalMembers = participants.length

  let inviteCode
  try {
    inviteCode = await conn.groupInviteCode(m.chat)
  } catch {
    inviteCode = null
  }

  const link = inviteCode
    ? `https://chat.whatsapp.com/${inviteCode}`
    : '𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'

  let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    thumb = await conn.profilePictureUrl(m.chat, 'image')
  } catch {}

  const thumbnailBuffer = typeof thumb === 'string'
    ? await (await fetch(thumb)).buffer()
    : thumb

  const text = `*╭━━━━━━━🔗━━━━━━━╮*
*✦ 𝐈𝐍𝐅𝐎 𝐆𝐑𝐔𝐏𝐏𝐎 ✦*
*╰━━━━━━━🔗━━━━━━━╯*

*👥 𝐌𝐞𝐦𝐛𝐫𝐢:* ${totalMembers}
*🛡️ 𝐀𝐝𝐦𝐢𝐧:* ${totalAdmins}

*🔗 𝐋𝐢𝐧𝐤 𝐆𝐫𝐮𝐩𝐩𝐨:*
${link}`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: metadata.subject || 'Gruppo',
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['link']
handler.tags = ['group']
handler.command = /^link$/i
handler.group = true
handler.botAdmin = true

export default handler