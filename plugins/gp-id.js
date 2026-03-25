let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply("⚠️ *𝐔𝐬𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐢𝐧 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨*")
  }

  let id = m.chat
  let nome = ''

  try {
    let meta = await conn.groupMetadata(m.chat)
    nome = meta.subject
  } catch {
    nome = 'Sconosciuto'
  }

  let testo = `╭━〔 🆔 *𝐈𝐃 𝐆𝐑𝐔𝐏𝐏𝐎* 〕━⬣\n`
  testo += `┃ 📛 𝐍𝐨𝐦𝐞: ${nome}\n`
  testo += `┃ 🆔 𝐈𝐃: ${id}\n`
  testo += `╰━━━━━━━━━━━━━━━━⬣`

  m.reply(testo)
}

handler.help = ['idgp']
handler.tags = ['group']
handler.command = /^(idgp)$/i
handler.group = true

export default handler