const handler = async (m, { conn, command, text, isAdmin }) => {
  const BOT_OWNERS = (global.owner || []).map(o => {
    const raw = Array.isArray(o) ? o[0] : o
    return String(raw).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  })

  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!mentionedJid && text) {
    if (text.endsWith('@s.whatsapp.net') || text.endsWith('@c.us')) {
      mentionedJid = text.trim()
    } else {
      let number = text.replace(/[^0-9]/g, '')
      if (number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net'
      }
    }
  }

  const chatId = m.chat
  const botNumber = conn.user.jid

  let groupOwner = null
  try {
    const metadata = await conn.groupMetadata(chatId)
    groupOwner = metadata.owner
  } catch {
    groupOwner = null
  }

  if (!isAdmin) {
    throw `╭━━━━━━━❌━━━━━━━╮
✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦
╰━━━━━━━❌━━━━━━━╯

🛡️ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨`
  }

  if (!mentionedJid) {
    return conn.reply(
      chatId,
      `╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ✦
╰━━━━━━━⚠️━━━━━━━╯

👤 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐝𝐚 ${command === 'muta' ? '𝐦𝐮𝐭𝐚𝐫𝐞 🔇' : '𝐬𝐦𝐮𝐭𝐚𝐫𝐞 🔊'}`,
      m
    )
  }

  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid)) {
    throw `╭━━━━━━━👑━━━━━━━╮
✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐏𝐑𝐎𝐓𝐄𝐓𝐓𝐎 ✦
╰━━━━━━━👑━━━━━━━╯

🚫 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐨 𝐬𝐦𝐮𝐭𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞`
  }

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = {}

  const user = global.db.data.users[mentionedJid]
  const isMute = command === 'muta'
  const tag = '@' + mentionedJid.split('@')[0]

  if (isMute) {
    if (user.muto) throw `╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐌𝐔𝐓𝐄 ✦
╰━━━━━━━⚠️━━━━━━━╯

🔇 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐦𝐮𝐭𝐚𝐭𝐨`

    user.muto = true

    return conn.sendMessage(chatId, {
      text: `╭━━━━━━━🔇━━━━━━━╮
✦ 𝐌𝐔𝐓𝐄 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎 ✦
╰━━━━━━━🔇━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
🔒 𝐒𝐭𝐚𝐭𝐨: 𝐌𝐮𝐭𝐚𝐭𝐨
⏳ 𝐃𝐮𝐫𝐚𝐭𝐚: 𝐅𝐢𝐧𝐨 𝐚 .𝐬𝐦𝐮𝐭𝐚`,
      mentions: [mentionedJid],
    }, { quoted: m })
  }

  if (!user.muto) throw `╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐌𝐔𝐓𝐄 ✦
╰━━━━━━━⚠️━━━━━━━╯

🔊 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 è 𝐦𝐮𝐭𝐚𝐭𝐨`

  user.muto = false

  return conn.sendMessage(chatId, {
    text: `╭━━━━━━━🔊━━━━━━━╮
✦ 𝐌𝐔𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ✦
╰━━━━━━━🔊━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}
🔓 𝐒𝐭𝐚𝐭𝐨: 𝐒𝐦𝐮𝐭𝐚𝐭𝐨`,
    mentions: [mentionedJid],
  }, { quoted: m })
}

handler.command = /^(muta|smuta)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler