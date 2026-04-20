// Plugin antimedia by Bonzino

let handler = m => m

handler.before = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return false
  if (m.fromMe) return false
  if (isAdmin || isOwner || isROwner) return false

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  if (!chat.antimedia) return false

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})

  const msg = m.message || {}

  const viewOnceContainer =
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2 ||
    msg.viewOnceMessageV2Extension ||
    null

  const innerMessage = viewOnceContainer?.message || msg
  const type = Object.keys(innerMessage || {})[0] || ''

  const isViewOnce = !!viewOnceContainer

  const blockedTypes = [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage'
  ]

  const isBlockedMedia = blockedTypes.includes(type) && !isViewOnce

  if (!isBlockedMedia) return false

  user.warn = Number(user.warn || 0) + 1
  const warn = user.warn
  const maxWarn = 3

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch {}

  const box = (title, body) => `╭━━━━━━━⚠️━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━⚠️━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  if (warn >= maxWarn) {
    if (isBotAdmin) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch {}

      await conn.reply(
        m.chat,
        box(
          '𝐀𝐍𝐓𝐈 𝐌𝐄𝐃𝐈𝐀',
          `*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

*📸 𝐈𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐬𝐨𝐥𝐨 𝐢 𝐦𝐞𝐝𝐢𝐚 𝐯𝐢𝐞𝐰 𝐨𝐧𝐜𝐞 / 𝐮𝐧𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞*

*🚫 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*
*👢 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
        ),
        m
      )
    } else {
      await conn.reply(
        m.chat,
        box(
          '𝐀𝐍𝐓𝐈 𝐌𝐄𝐃𝐈𝐀',
          `*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

*📸 𝐈𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐬𝐨𝐥𝐨 𝐢 𝐦𝐞𝐝𝐢𝐚 𝐯𝐢𝐞𝐰 𝐨𝐧𝐜𝐞 / 𝐮𝐧𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞*

*🚫 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*
*⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐭𝐢 𝐩𝐞𝐫𝐜𝐡𝐞́ 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐚𝐝𝐦𝐢𝐧*`
        ),
        m
      )
    }

    return true
  }

  await conn.reply(
    m.chat,
    box(
      '𝐀𝐍𝐓𝐈 𝐌𝐄𝐃𝐈𝐀',
      `*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

*📸 𝐈𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐬𝐨𝐥𝐨 𝐢 𝐦𝐞𝐝𝐢𝐚 𝐯𝐢𝐞𝐰 𝐨𝐧𝐜𝐞 / 𝐮𝐧𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞*

*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/${maxWarn}
*👢 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
    ),
    m
  )

  return true
}

export default handler