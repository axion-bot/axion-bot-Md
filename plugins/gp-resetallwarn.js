// resetallwarn by Bonzino

let handler = async (m, { conn, isAdmin, isOwner, isROwner, usedPrefix }) => {
  const chatId = m.chat

  const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}`

  if (!(isAdmin || isOwner || isROwner)) {
    throw box(
      '❌',
      '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
      `*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
    )
  }

  global.db.data.users ??= {}

  const metadata = await conn.groupMetadata(chatId)
  const participants = metadata.participants || []
  const users = global.db.data.users || {}

  const cleanJid = jid => String(jid || '').replace(/[^0-9]/g, '')

  const findUserKeyByJid = (users, jid) => {
    const num = cleanJid(jid)
    return Object.keys(users).find(key => cleanJid(key) === num) || jid
  }

  let resetCount = 0
  let totalWarnRemoved = 0
  let mentions = []

  for (const p of participants) {
    const jid = p.id || p.jid || p.lid
    const realKey = findUserKeyByJid(users, jid)
    const user = users[realKey]

    if (!user || typeof user.warn !== 'number' || user.warn <= 0) continue

    resetCount++
    totalWarnRemoved += user.warn
    mentions.push(realKey)

    user.warn = 0
    delete user.lastWarnReason
    delete user.lastWarnBy
    delete user.lastWarnAt
  }

  if (!resetCount) {
    return conn.sendMessage(chatId, {
      text: box(
        '✅',
        '𝐑𝐄𝐒𝐄𝐓 𝐖𝐀𝐑𝐍',
        `*𝐍𝐞𝐬𝐬𝐮𝐧 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐚𝐳𝐳𝐞𝐫𝐚𝐫𝐞 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}listawarn`, buttonText: { displayText: '📋 Lista Warn' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  return conn.sendMessage(chatId, {
    text: box(
      '🧹',
      '𝐖𝐀𝐑𝐍 𝐀𝐙𝐙𝐄𝐑𝐀𝐓𝐈',
      `*👥 𝐔𝐭𝐞𝐧𝐭𝐢 𝐫𝐢𝐩𝐮𝐥𝐢𝐭𝐢:* *${resetCount}*
*⚠️ 𝐖𝐚𝐫𝐧 𝐫𝐢𝐦𝐨𝐬𝐬𝐢:* *${totalWarnRemoved}*

*✅ 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐰𝐚𝐫𝐧 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐚𝐳𝐳𝐞𝐫𝐚𝐭𝐢.*`
    ),
    mentions,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      { buttonId: `${usedPrefix}listawarn`, buttonText: { displayText: '📋 Lista Warn' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(resetallwarn|resetwarnall|azzerawarn|azzeratuttiwarn)$/i
handler.group = true

export default handler