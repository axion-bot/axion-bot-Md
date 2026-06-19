// Setregole by Bonzjno

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
  global.db.data.chats ??= {}
  global.db.data.chats[m.chat] ??= {}

  const isStaffGroup = m.chat === global.gruppostaff
  const canManageRemote = isStaffGroup && (isOwner || isROwner)

  const getChatData = jid => {
    global.db.data.chats[jid] ??= {}
    return global.db.data.chats[jid]
  }

  if (/^setregole$/i.test(command)) {
    let targetChat = m.chat
    let rulesText = text || ''

    if (canManageRemote) {
      const parts = String(text || '').trim().split(/\s+/)
      const maybeJid = parts[0] || ''

      if (/@g\.us$/.test(maybeJid)) {
        targetChat = maybeJid
        rulesText = parts.slice(1).join(' ').trim()
      }
    }

    if (!canManageRemote && !(isAdmin || isOwner || isROwner)) {
      return conn.reply(
        m.chat,
`*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

    if (!rulesText) {
      return conn.reply(
        m.chat,
        canManageRemote
          ? `*⚠️ 𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐢𝐥 𝐉𝐈𝐃 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞.*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*  
*${usedPrefix}setregole 1203630xxxxxxxxx@g.us 1. No spam 2. No link 3. Rispetto per tutti*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
          : `*⚠️ 𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐝𝐞𝐥𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞.*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*  
*${usedPrefix}setregole 1. No spam 2. No link 3. Rispetto per tutti*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

    const chat = getChatData(targetChat)
    chat.rules = rulesText.trim()

    return conn.reply(
      m.chat,
      `*╭━━━━━━━📜━━━━━━━╮*
*✦ 𝐑𝐄𝐆𝐎𝐋𝐄 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐓𝐄 ✦*
*╰━━━━━━━📜━━━━━━━╯*

*✅ 𝐋𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐞 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*${
        targetChat !== m.chat ? `\n*🎯 𝐆𝐫𝐮𝐩𝐩𝐨:* *${targetChat}*` : ''
      }

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const chat = getChatData(m.chat)
  const rules =
    chat.rules ||
    `*1. 𝐍𝐨 𝐬𝐩𝐚𝐦*
*2. 𝐍𝐨 𝐥𝐢𝐧𝐤 𝐬𝐞𝐧𝐳𝐚 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐨*
*3. 𝐑𝐢𝐬𝐩𝐞𝐭𝐭𝐚 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐦𝐞𝐦𝐛𝐫𝐢*
*4. 𝐍𝐨 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐢𝐥𝐥𝐞𝐠𝐚𝐥𝐢 𝐨 𝐍𝐒𝐅𝐖*`

  const msg = `${rules}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.reply(m.chat, msg, m)
}

handler.help = ['regole', 'setregole']
handler.tags = ['group']
handler.command = /^(regole|rules|setregole)$/i
handler.group = true

export default handler