// Plugin AntiTelegram by Bonzino

const telegramRegex = /(?:https?:\/\/)?(?:www\.)?(t\.me|telegram\.me)\/[^\s]*/i

export async function before(m, { isAdmin, isPrems, isBotAdmin, isOwner, isROwner, conn }) {
  if (m.isBaileys || m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTelegram) return true

  if (isAdmin || isOwner || isROwner || isPrems) return true

  const isTelegramLink = telegramRegex.exec(m.text || '')
  if (!isTelegramLink) return true

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  if (typeof user.warn !== 'number') user.warn = 0
  if (!Array.isArray(user.warnReasons)) user.warnReasons = []

  user.warn += 1
  user.warnReasons.push('link telegram')

  const senderTag = m.sender.split('@')[0]
  const warnLimit = 3
  const warnCount = user.warn
  const remaining = warnLimit - warnCount

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || m.sender
      }
    })
  } catch (e) {
    console.error('Errore nella cancellazione del messaggio:', e)
  }

  if (warnCount < warnLimit) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━📨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 ✦*
╰━━━━━━━📨━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐋𝐢𝐧𝐤 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*
*📌 𝐀𝐯𝐯𝐢𝐬𝐨:* *${warnCount}/${warnLimit}*
*⏳ 𝐑𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐢:* *${remaining}*

*🚷 𝐀𝐥𝐥𝐚 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐚 𝐯𝐢𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })

    return false
  }

  user.warn = 0
  user.warnReasons = []

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━📨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 ✦*
╰━━━━━━━📨━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐇𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐚𝐯𝐯𝐢𝐬𝐢*
*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })

    return false
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━📨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 ✦*
╰━━━━━━━📨━━━━━━━╯

*@${senderTag}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐋𝐢𝐧𝐤 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━📨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 ✦*
╰━━━━━━━📨━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐃𝐨𝐯𝐫𝐞𝐛𝐛𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨, 𝐦𝐚 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐟𝐚𝐫𝐥𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  return false
}