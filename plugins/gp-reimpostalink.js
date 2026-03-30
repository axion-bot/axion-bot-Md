// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const handler = async (m, { conn }) => {

  if (!m.isGroup) {
    return m.reply('*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = Array.isArray(metadata.participants) ? metadata.participants : []

  const senderJid = m.sender
  const senderIsAdmin = participants.find(p => (p.id || p.jid) === senderJid)?.admin

  if (!senderIsAdmin) {
    return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐩𝐮ò 𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐫𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤.*')
  }

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const botIsAdmin = participants.find(p => (p.id || p.jid) === botJid)?.admin

  if (!botIsAdmin) {
    return m.reply('*⚠️ 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐫𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*')
  }

  try {
    await conn.groupRevokeInvite(m.chat)

    const newCode = await conn.groupInviteCode(m.chat)
    const newLink = `https://chat.whatsapp.com/${newCode}`

    let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
    try {
      thumb = await conn.profilePictureUrl(m.chat, 'image')
    } catch {}

    const thumbnailBuffer = typeof thumb === 'string'
      ? await (await fetch(thumb)).buffer()
      : thumb

    const text = `*╭━━━━━━━🔄━━━━━━━╮*
*✦ 𝐋𝐈𝐍𝐊 𝐑𝐄𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐓𝐎 ✦*
*╰━━━━━━━🔄━━━━━━━╯*

*🔒 𝐈𝐥 𝐯𝐞𝐜𝐜𝐡𝐢𝐨 𝐥𝐢𝐧𝐤 è 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐯𝐨𝐜𝐚𝐭𝐨.*

*🔗 𝐍𝐮𝐨𝐯𝐨 𝐥𝐢𝐧𝐤:*
${newLink}`

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

  } catch (error) {
    console.error(error)
    m.reply('*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐥𝐢𝐧𝐤.*')
  }
}

handler.command = ['reimpostalink']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.help = ['reimpostalink']
handler.tags = ['group']

export default handler