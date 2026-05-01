// listawarn by Bonzino

let handler = async (m, { conn, isAdmin, isOwner, isROwner }) => {

const cleanJid = jid => String(jid || '').replace(/[^0-9]/g, '')

const findUserKeyByJid = (users, jid) => {
  const num = cleanJid(jid)
  return Object.keys(users).find(key => cleanJid(key) === num) || jid
}
  const chatId = m.chat

  const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}`

  function warnListButtons() {
    return [
      { buttonId: '.resetallwarn', buttonText: { displayText: '🧹 Azzera tutti i warn' }, type: 1 },
      { buttonId: '.listawarn', buttonText: { displayText: '🔄 Aggiorna lista' }, type: 1 }
    ]
  }

  if (!(isAdmin || isOwner || isROwner)) {
    throw box(
      '❌',
      '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
      `*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
    )
  }

  const metadata = await conn.groupMetadata(chatId)
  const participants = metadata.participants || []
  const users = global.db.data.users || {}

  const warnedUsers = participants
  .map(p => {
    const jid = p.id || p.jid || p.lid
    const realKey = findUserKeyByJid(users, jid)
    const user = users[realKey] || {}

    return {
      jid: realKey,
      warn: typeof user.warn === 'number' ? user.warn : 0,
      reason: user.lastWarnReason || ''
    }
  })
  
    .filter(u => u.warn > 0)
    .sort((a, b) => b.warn - a.warn)

  if (!warnedUsers.length) {
    return conn.sendMessage(chatId, {
      text: box(
        '✅',
        '𝐋𝐈𝐒𝐓𝐀 𝐖𝐀𝐑𝐍',
        `*𝐍𝐞𝐬𝐬𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐰𝐚𝐫𝐧𝐚𝐭𝐨 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: warnListButtons(),
      headerType: 1
    }, { quoted: m })
  }

  const mentions = warnedUsers.map(u => u.jid)

  let list = warnedUsers.map((u, i) => {
    const tag = '@' + cleanJid(u.jid)
    const reason = u.reason
      ? `\n*❓ 𝐔𝐥𝐭𝐢𝐦𝐨 𝐦𝐨𝐭𝐢𝐯𝐨:* *${u.reason}*`
      : ''

    return `*${i + 1}. 👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*⚠️ 𝐖𝐚𝐫𝐧:* *${u.warn}/𝟑*${reason}`
  }).join('\n\n')

  return conn.sendMessage(chatId, {
    text: box(
      '⚠️',
      '𝐋𝐈𝐒𝐓𝐀 𝐖𝐀𝐑𝐍',
      list
    ),
    mentions,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: warnListButtons(),
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(listwarn|warnlist|listawarn)$/i
handler.group = true

export default handler