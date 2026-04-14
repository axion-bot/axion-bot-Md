// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const metadata = await conn.groupMetadata(m.chat)

    await conn.groupRevokeInvite(m.chat)

    const newCode = await conn.groupInviteCode(m.chat)
    const newLink = `https://chat.whatsapp.com/${newCode}`

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

    const text = `*╭━━━━━━━🔄━━━━━━━╮*
*✦ 𝐋𝐢𝐧𝐤 𝐫𝐞𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨 ✦*
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
          ...(thumbnailBuffer ? { thumbnail: thumbnailBuffer } : {}),
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