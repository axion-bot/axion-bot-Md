// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, text }) => {
  let who

  try {
    if (text && /^\d{7,15}$/.test(text)) {
      who = text.replace(/\D/g, '') + '@s.whatsapp.net'
    } else if (m.mentionedJid?.length) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else {
      who = m.sender
    }

    who = conn.decodeJid(who)
  } catch {
    who = m.sender
  }

  let name = 'Utente'
  try {
    name = await conn.getName(who)
  } catch {}

  let pp = 'https://ui-avatars.com/api/?background=f3f4f6&color=9ca3af&size=512&name=User'

  try {
    const real = await conn.profilePictureUrl(who, 'image')
    if (real) pp = real
  } catch {}

  const caption = `*╭━━━━━━━🖼️━━━━━━━╮*
*✦ 𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
*╰━━━━━━━🖼️━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${name}`

  await conn.sendMessage(
    m.chat,
    {
      image: { url: pp },
      caption,
      mentions: [who],
      contextInfo: {
        ...(global.rcanal?.contextInfo || {})
      }
    },
    { quoted: m }
  )
}

handler.help = ['pfp @utente / reply / numero']
handler.tags = ['tools']
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler