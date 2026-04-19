// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fs from 'fs'

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
      who = m.sender
    }

    who = conn.decodeJid(who)

    let name = 'Utente'
    try {
      name = await conn.getName(who)
    } catch {}

    let image
    let isFallback = false
    
    // se la foto non è disponibile, usiamo l'avatar locale

    try {
      const pp = await conn.profilePictureUrl(who, 'image')
      image = { url: pp }
    } catch {
      image = fs.readFileSync('./media/default-avatar.png')
      isFallback = true
    }

    const caption = isFallback
      ? `*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐨 𝐞̀ 𝐬𝐭𝐚𝐭𝐚 𝐧𝐚𝐬𝐜𝐨𝐬𝐭𝐚.*`
      : `*📸 𝐅𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐝𝐢 ${name}*`

    await conn.sendMessage(
      m.chat,
      {
        image,
        caption,
        mentions: [who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
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
handler.admin = true
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler