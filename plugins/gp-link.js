// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
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

  const text = `*╭━━━━━━━🔗━━━━━━━╮*
*✦ 𝐈𝐧𝐟𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 ✦*
*╰━━━━━━━🔗━━━━━━━╯*

*👥 𝐌𝐞𝐦𝐛𝐫𝐢:* ${totalMembers}

*🔗 𝐋𝐢𝐧𝐤 𝐠𝐫𝐮𝐩𝐩𝐨:*
${link}`

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
}

handler.help = ['link']
handler.tags = ['group']
handler.command = /^link$/i
handler.group = true
handler.botAdmin = true

export default handler