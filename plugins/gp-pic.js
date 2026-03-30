// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, text }) => {
  try {
    let who

    if (text && /^\d{7,15}$/.test(text)) {
      who = text.replace(/\D/g, '') + '@s.whatsapp.net'
    } else if (m.quoted) {
      who = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else {
      who = m.fromMe ? conn.user.jid : m.sender
    }

    const name = await conn.getName(who)

    let pp
    try {
      pp = await conn.profilePictureUrl(who, 'image')
    } catch {
      pp = null
    }

    if (!pp) {
      return conn.reply(
        m.chat,
        '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐮𝐧𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*',
        m
      )
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
    console.error('Errore .pfp:', err)
    await conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐝𝐞𝐥𝐥𝐚 𝐟𝐨𝐭𝐨.*',
      m
    )
  }
}

handler.help = ['pfp @utente / reply / numero']
handler.tags = ['tools']
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler