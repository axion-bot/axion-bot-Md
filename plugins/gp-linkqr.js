// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import QRCode from 'qrcode'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const metadata = await conn.groupMetadata(m.chat)

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
*✦ 𝐐𝐫 𝐆𝐫𝐮𝐩𝐩𝐨 ✦*
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
      },
      footer: 'Scegli un’azione',
      buttons: [
        {
          buttonId: `${usedPrefix}${command}`,
          buttonText: { displayText: '🔄 Genera nuovo Qr' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐐𝐫.*')
  }
}

handler.command = ['linkqr']
handler.tags = ['group']
handler.help = ['linkqr']
handler.group = true
handler.botAdmin = true

export default handler