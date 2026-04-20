let handler = async (m, { conn, command, text, isAdmin, isOwner, isROwner, usedPrefix }) => {
  const chatId = m.chat
  const botNumber = conn.user.jid

  const box = (emoji, title, body) => `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const getProtectedUsers = () => {
    const owners = (global.owner || []).map(v => {
      const number = Array.isArray(v) ? v[0] : v
      return String(number).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    return [...owners, botNumber]
  }

  const protectedUsers = getProtectedUsers()

  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender
  let reason = ''

  if (!mentionedJid && text) {
    const parts = text.trim().split(/\s+/)
    const firstArg = parts[0]

    if (firstArg?.endsWith('@s.whatsapp.net') || firstArg?.endsWith('@c.us')) {
      mentionedJid = firstArg
      reason = parts.slice(1).join(' ')
    } else {
      const number = firstArg?.replace(/[^0-9]/g, '')
      if (number && number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net'
        reason = parts.slice(1).join(' ')
      }
    }
  } else if (mentionedJid && text) {
    const cleanText = text
      .replace(/@\d+/g, '')
      .replace(/[^a-zA-Z0-9À-ÿ\s]/g, ' ')
      .trim()

    reason = cleanText
  }

  const groupMetadata = await conn.groupMetadata(chatId)
  const groupOwner = groupMetadata.owner || chatId.split('-')[0] + '@s.whatsapp.net'

  if (!(isAdmin || isOwner || isROwner)) {
    throw box(
      '❌',
      '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
      `*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
    )
  }

  if (!mentionedJid) {
    return conn.reply(
      chatId,
      box(
        '⚠️',
        '𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎',
        `*𝐓𝐚𝐠𝐠𝐚, 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥𝐥’𝐮𝐭𝐞𝐧𝐭𝐞.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}${command} @utente spam*
*${usedPrefix}${command} 393123456789 spam*`
      ),
      m
    )
  }

  if (
    mentionedJid === groupOwner ||
    protectedUsers.includes(mentionedJid)
  ) {
    throw box(
      '👑',
      '𝐀𝐙𝐈𝐎𝐍𝐄 𝐍𝐄𝐆𝐀𝐓𝐀',
      `*🚫 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐢𝐧𝐭𝐨𝐜𝐜𝐚𝐛𝐢𝐥𝐞.*`
    )
  }

  global.db.data.users ??= {}
  global.db.data.users[mentionedJid] ??= {}

  const user = global.db.data.users[mentionedJid]

  if (typeof user.warn !== 'number') user.warn = 0

  const tag = '@' + mentionedJid.split('@')[0]
  const reasonText = reason?.trim() ? reason.trim() : '𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐭𝐢𝐯𝐨 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚𝐭𝐨'

  if (command === 'warn') {
    user.warn += 1
    user.lastWarnReason = reasonText
    user.lastWarnBy = m.sender
    user.lastWarnAt = Date.now()

    if (user.warn >= 3) {
      user.warn = 0

      await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove')

      return conn.sendMessage(chatId, {
        text: box(
          '🚨',
          '𝐔𝐓𝐄𝐍𝐓𝐄 𝐄𝐒𝐏𝐔𝐋𝐒𝐎',
          `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*📉 𝐌𝐨𝐭𝐢𝐯𝐨:* ${reasonText}
*📊 𝐖𝐚𝐫𝐧:* 𝟑/𝟑

*🚫 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
        ),
        mentions: [mentionedJid]
      }, { quoted: m })
    }

    return conn.sendMessage(chatId, {
      text: box(
        '⚠️',
        '𝐖𝐀𝐑𝐍',
        `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*📉 𝐌𝐨𝐭𝐢𝐯𝐨:* ${reasonText}
*📊 𝐒𝐭𝐚𝐭𝐨:* ${user.warn}/𝟑 𝐰𝐚𝐫𝐧

*⚠️ 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 𝐯𝐞𝐫𝐫à 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
      ),
      mentions: [mentionedJid]
    }, { quoted: m })
  }

  if (command === 'unwarn') {
    if (user.warn <= 0) {
      throw box(
        '⚠️',
        '𝐔𝐍𝐖𝐀𝐑𝐍',
        `*𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*`
      )
    }

    user.warn -= 1

    return conn.sendMessage(chatId, {
      text: box(
        '✅',
        '𝐖𝐀𝐑𝐍 𝐑𝐈𝐌𝐎𝐒𝐒𝐎',
        `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*📊 𝐒𝐭𝐚𝐭𝐨:* ${user.warn}/𝟑 𝐰𝐚𝐫𝐧`
      ),
      mentions: [mentionedJid]
    }, { quoted: m })
  }
}

handler.command = /^(warn|unwarn)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler