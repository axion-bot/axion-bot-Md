// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import QRCode from 'qrcode'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const metadata = await conn.groupMetadata(m.chat)
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    const totalMembers = Array.isArray(metadata.participants) ? metadata.participants.length : 0

    const qrBuffer = await QRCode.toBuffer(link, {
      type: 'png',
      width: 900,
      margin: 2,
      errorCorrectionLevel: 'H'
    })

    let thumbnailBuffer = null

    try {
      const groupThumb = await conn.profilePictureUrl(m.chat, 'image')
      thumbnailBuffer = await (await fetch(groupThumb)).buffer()
    } catch {}

    if (!thumbnailBuffer) {
      try {
        const mediaPath = path.join(process.cwd(), 'media', 'group-pic.png')
        if (fs.existsSync(mediaPath)) {
          thumbnailBuffer = fs.readFileSync(mediaPath)
        }
      } catch {}
    }

    const caption = `*📌 𝐐𝐫 𝐠𝐫𝐮𝐩𝐩𝐨*

👥 *Membri:* ${totalMembers}

⚠️ *Non condividere il link con sconosciuti.*`

    await conn.sendMessage(m.chat, {
      image: qrBuffer,
      caption,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: metadata.subject || 'Gruppo',
          body: 'Qr invito gruppo',
          ...(thumbnailBuffer ? { thumbnail: thumbnailBuffer } : {}),
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
        },
        {
          buttonId: `${usedPrefix}link`,
          buttonText: { displayText: '🔗 Mostra link' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}reimpostalink`,
          buttonText: { displayText: '♻️ Reset link' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐐𝐫.*')
  }
}

handler.command = ['linkqr']
handler.tags = ['group']
handler.help = ['linkqr']
handler.group = true
handler.botAdmin = true

export default handler