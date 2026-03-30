// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import QRCode from 'qrcode'
import fetch from 'node-fetch'

const handler = async (m, { conn }) => {

  if (!m.isGroup) {
    return m.reply('*𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const botIsAdmin = metadata.participants.find(p => p.id === botJid)?.admin

  if (!botIsAdmin) {
    return m.reply('*𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐨𝐭𝐭𝐞𝐧𝐞𝐫𝐞 𝐢𝐥 𝐐𝐑 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*')
  }

  try {
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    const qrBuffer = await QRCode.toBuffer(link, {
      type: 'png',
      width: 900,
      margin: 2,
      errorCorrectionLevel: 'H'
    })

    let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
    try {
      thumb = await conn.profilePictureUrl(m.chat, 'image')
    } catch {}

    const thumbnailBuffer = typeof thumb === 'string'
      ? await (await fetch(thumb)).buffer()
      : thumb

    const caption = `*╭━━━━━━━📌━━━━━━━╮*
*✦ 𝐐𝐑 𝐆𝐑𝐔𝐏𝐏𝐎 ✦*
*╰━━━━━━━📌━━━━━━━╯*

*🔗 𝐋𝐢𝐧𝐤:*
${link}`

    await conn.sendMessage(m.chat, {
      image: qrBuffer,
      caption,
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
    m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐐𝐑.*')
  }
}

handler.command = ['linkqr']
handler.tags = ['group']
handler.help = ['linkqr']
handler.group = true
handler.botAdmin = true

export default handler