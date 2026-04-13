// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, text }) => {
  try {
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

    const name = await conn.getName(who)

    let pp
    try {
      pp = await conn.profilePictureUrl(who, 'image')
    } catch {
      pp = null
    }

    if (!pp) {
      pp = 'https://i.imgur.com/6VBx3io.png'
    }

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

  } catch (err) {
    console.error('Errore .pic:', err)
    await conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨.*',
      m
    )
  }
}

handler.help = ['pfp @utente / reply / numero']
handler.tags = ['tools']
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler