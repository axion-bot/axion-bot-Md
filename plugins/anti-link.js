// Plugin AntiLink by Bonzino

const linkRegex = /(?:https?:\/\/|ftp:\/\/|www\.)\S+|(?:[a-zA-Z0-9-]+\.)+(?:com|it|net|org|info|biz|xyz|me|co|io|tv|gg|dev|app|shop|site|online|store|blog|cloud|ai|uk|us|ru|de|fr|es|nl|eu|ch|ca|au|jp|br|in|tk|ml|ga|cf|gq)(?:\/\S*)?/i

const box = (title, body) => `╭━━━━━━━⚠️━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━⚠️━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

function getMessageText(m) {
  return (
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.documentMessage?.caption ||
    ''
  )
}

export async function before(m, { isAdmin, isPrems, isBotAdmin, conn }) {
  if (m.isBaileys || m.fromMe) return true
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return false
  if (isAdmin || isPrems) return false

  const text = getMessageText(m)
  if (!text) return false

  const hasLink = linkRegex.test(text)
  if (!hasLink) return false

  global.db.data.users[m.sender] ??= {}
  global.db.data.users[m.sender].warn ??= 0
  global.db.data.users[m.sender].warnReasons ??= []

  global.db.data.users[m.sender].warn += 1
  global.db.data.users[m.sender].warnReasons.push('link')

  const warnLimit = 3
  const warnCount = global.db.data.users[m.sender].warn
  const mention = `@${m.sender.split('@')[0]}`

  if (isBotAdmin) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })
    } catch {}
  }

  if (warnCount < warnLimit) {
    await conn.sendMessage(m.chat, {
      text: box(
        '𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊',
        `*❌ 𝐋𝐢𝐧𝐤 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*⚠️ 𝐖𝐚𝐫𝐧:* ${warnCount}/${warnLimit}
*👢 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
      ),
      mentions: [m.sender]
    }, { quoted: m })

    return true
  }

  global.db.data.users[m.sender].warn = 0
  global.db.data.users[m.sender].warnReasons = []

  if (isBotAdmin) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } catch {}
  }

  await conn.sendMessage(m.chat, {
    text: box(
      '𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊',
      isBotAdmin
        ? `*🚫 𝐋𝐢𝐦𝐢𝐭𝐞 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨*

${mention}

*📊 𝐖𝐚𝐫𝐧:* 3/3
*👢 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
        : `*🚫 𝐋𝐢𝐦𝐢𝐭𝐞 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨*

${mention}

*📊 𝐖𝐚𝐫𝐧:* 3/3
*⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐞𝐫𝐜𝐡𝐞́ 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐚𝐝𝐦𝐢𝐧*`
    ),
    mentions: [m.sender]
  }, { quoted: m })

  return true
}