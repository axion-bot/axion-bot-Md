// unwarnall by Bonzino

let handler = async (m, { conn, text, isAdmin, isOwner, isROwner, usedPrefix, command }) => {

const cleanJid = jid => String(jid || '').replace(/[^0-9]/g, '')

const findUserKeyByJid = (users, jid) => {
  const num = cleanJid(jid)
  return Object.keys(users).find(key => cleanJid(key) === num) || jid
}
  const chatId = m.chat

  const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const actionButtons = jid => [
    { buttonId: `${usedPrefix}warn ${jid}`, buttonText: { displayText: '⚠️ Warn' }, type: 1 },
    { buttonId: `${usedPrefix}listawarn`, buttonText: { displayText: '📋 Lista Warn' }, type: 1 }
  ]

  if (!(isAdmin || isOwner || isROwner)) {
    throw box(
      '❌',
      '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
      `*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
    )
  }

  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender

  if (!mentionedJid && text) {
    const firstArg = text.trim().split(/\s+/)[0]
    const number = firstArg?.replace(/[^0-9]/g, '')

    if (firstArg?.endsWith('@s.whatsapp.net') || firstArg?.endsWith('@c.us')) {
      mentionedJid = firstArg
    } else if (number && number.length >= 8 && number.length <= 15) {
      mentionedJid = number + '@s.whatsapp.net'
    }
  }

  if (!mentionedJid) {
    return conn.reply(
      chatId,
      box(
        '⚠️',
        '𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎',
        `*𝐓𝐚𝐠𝐠𝐚, 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥𝐥’𝐮𝐭𝐞𝐧𝐭𝐞.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}${command} @utente*
*${usedPrefix}${command} 393123456789*`
      ),
      m
    )
  }

  global.db.data.users ??= {}

const users = global.db.data.users
const realKey = findUserKeyByJid(users, mentionedJid)

users[realKey] ??= {}

const user = users[realKey]
const currentWarn = typeof user.warn === 'number' ? user.warn : 0
const tag = '@' + cleanJid(realKey)

  if (currentWarn <= 0) {
    throw box(
      '⚠️',
      '𝐔𝐍𝐖𝐀𝐑𝐍 𝐀𝐋𝐋',
      `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}

*𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*`
    )
  }

  user.warn = 0
  delete user.lastWarnReason
  delete user.lastWarnBy
  delete user.lastWarnAt

  return conn.sendMessage(chatId, {
    text: box(
      '✅',
      '𝐖𝐀𝐑𝐍 𝐀𝐙𝐙𝐄𝐑𝐀𝐓𝐈',
      `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}

*🧹 𝐖𝐚𝐫𝐧 𝐫𝐢𝐦𝐨𝐬𝐬𝐢:* *${currentWarn}*
*📊 𝐒𝐭𝐚𝐭𝐨:* *0/𝟑 𝐰𝐚𝐫𝐧*`
    ),
    mentions: [mentionedJid],
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: actionButtons(cleanJid(realKey)),
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(unwarnall|delwarnall|resetwarn)$/i
handler.group = true

export default handler