// Plugin AntiTrava by Bonzino

let handler = m => m

const ZALGO_REGEX = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]{3,}/g

function extractText(m) {
  if (!m) return ''

  let text = m.text || m.caption || ''

  if (m.message?.pollCreationMessageV3?.name) {
    text += ' ' + m.message.pollCreationMessageV3.name
    m.message.pollCreationMessageV3.options?.forEach(opt => {
      text += ' ' + opt.optionName
    })
  }

  if (m.message?.pollCreationMessage?.name) {
    text += ' ' + m.message.pollCreationMessage.name
    m.message.pollCreationMessage.options?.forEach(opt => {
      text += ' ' + opt.optionName
    })
  }

  return text
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isDio, isROwner }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup || !m.sender) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antitrava) return true

  if (isAdmin || isOwner || isROwner || isDio || m.fromMe) return true

  const text = extractText(m)
  if (!text) return true

  const isTooLong = text.length > 4000
  const zalgoMatches = text.match(ZALGO_REGEX) || []
  const isZalgo = zalgoMatches.length > 5

  if (!isTooLong && !isZalgo) return true

  const senderTag = m.sender.split('@')[0]
  const reason = isTooLong
    ? '*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐥𝐮𝐧𝐠𝐨*'
    : '*𝐓𝐫𝐚𝐯𝐚 / 𝐭𝐞𝐬𝐭𝐨 𝐳𝐚𝐥𝐠𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*'

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch {}

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🧨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀 ✦*
╰━━━━━━━🧨━━━━━━━╯

*@${senderTag}*
*⚠️ ${reason}*
*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })

    return true
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🧨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀 ✦*
╰━━━━━━━🧨━━━━━━━╯

*@${senderTag}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* ${reason}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🧨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀 ✦*
╰━━━━━━━🧨━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐃𝐨𝐯𝐫𝐞𝐛𝐛𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨, 𝐦𝐚 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐟𝐚𝐫𝐥𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  return true
}

export default handler