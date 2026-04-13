// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, text }) => {
  let who

  const raw = (text || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (digits.length >= 7 && digits.length <= 15) {
    who = digits + '@s.whatsapp.net'
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (m.quoted) {
    who = m.quoted.sender
  } else {
    who = m.fromMe ? conn.user.jid : m.sender
  }

  who = conn.decodeJid(who)

  let name = 'Utente'
  try {
    name = await conn.getName(who)
  } catch {}

  let pp = 'https://i.imgur.com/6VBx3io.png'

  try {
    const url = await conn.profilePictureUrl(who, 'image')
    if (url) pp = url
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
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.help = ['pfp @utente / reply / numero']
handler.tags = ['tools']
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler