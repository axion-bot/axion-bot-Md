// Plugin Antitag by Bonzino

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isPrems, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup) return false
  if (m.fromMe || m.isBaileys) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTag) return true

  const botNumber = conn.decodeJid(conn.user?.jid || conn.user?.id || '')
  const isBot = m.sender === botNumber

  if (!m.mentionedJid || m.mentionedJid.length === 0) return false
  if (isBot || isOwner || isROwner || isAdmin || isPrems) return true

  const tagLimit = 40
  const warnLimit = 3

  if (m.mentionedJid.length <= tagLimit) return false

  const userJid = conn.decodeJid(m.sender)
  const user = global.db.data.users[userJid] || (global.db.data.users[userJid] = {})

  if (typeof user.warn !== 'number') user.warn = 0
  if (!Array.isArray(user.warnReasons)) user.warnReasons = []

  user.warn += 1
  user.warnReasons.push('tag eccessivi')

  try {
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })
    }
  } catch (e) {
    console.error('Errore nella cancellazione del messaggio:', e)
  }

  const warnCount = user.warn
  const remaining = warnLimit - warnCount
  const senderTag = userJid.split('@')[0]

  if (warnCount < warnLimit) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🏷️━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐀𝐆 ✦*
╰━━━━━━━🏷️━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐓𝐫𝐨𝐩𝐩𝐢 𝐭𝐚𝐠 𝐧𝐞𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨*
*📌 𝐀𝐯𝐯𝐢𝐬𝐨:* *${warnCount}/${warnLimit}*
*⏳ 𝐑𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐢:* *${remaining}*

*🚷 𝐀𝐥𝐥𝐚 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐚 𝐯𝐢𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [userJid]
    }, { quoted: m })

    return true
  }

  user.warn = 0
  user.warnReasons = []

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🏷️━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐀𝐆 ✦*
╰━━━━━━━🏷️━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐇𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐚𝐯𝐯𝐢𝐬𝐢*
*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [userJid]
    }, { quoted: m })

    return true
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [userJid], 'remove')

    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🏷️━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐀𝐆 ✦*
╰━━━━━━━🏷️━━━━━━━╯

*@${senderTag}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐓𝐚𝐠 𝐞𝐜𝐜𝐞𝐬𝐬𝐢𝐯𝐢*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [userJid]
    }, { quoted: m })
  } catch {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🏷️━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐀𝐆 ✦*
╰━━━━━━━🏷️━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐃𝐨𝐯𝐫𝐞𝐛𝐛𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨, 𝐦𝐚 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐟𝐚𝐫𝐥𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [userJid]
    }, { quoted: m })
  }

  return true
}

export default handler