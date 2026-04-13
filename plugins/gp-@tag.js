//by Bonzino DEBUG

import { generateWAMessageFromContent } from '@realvare/based'

let handler = async (m, { conn, participants, text, command }) => {
  try {
    await conn.reply(
      m.chat,
      `*🧪 𝐃𝐄𝐁𝐔𝐆 𝟏*\n\n*𝐦.𝐭𝐞𝐱𝐭:* ${m.text || 'vuoto'}\n*𝐜𝐨𝐦𝐦𝐚𝐧𝐝:* ${command || 'vuoto'}\n*𝐭𝐞𝐱𝐭:* ${text || 'vuoto'}`,
      m
    )

    if (!participants || participants.length === 0) {
      return conn.reply(m.chat, '*🧪 𝐃𝐄𝐁𝐔𝐆 𝟐*\n\n*𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐞 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨.*', m)
    }

    const users = participants.map(u => conn.decodeJid(u.id))

    await conn.reply(
      m.chat,
      `*🧪 𝐃𝐄𝐁𝐔𝐆 𝟑*\n\n*𝐏𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢:* ${users.length}`,
      m
    )

    const testo = (text || '').trim() || '*⚠️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚 𝐭𝐮𝐭𝐭𝐢.*'

    await conn.reply(
      m.chat,
      `*🧪 𝐃𝐄𝐁𝐔𝐆 𝟒*\n\n*𝐓𝐞𝐬𝐭𝐨 𝐟𝐢𝐧𝐚𝐥𝐞:* ${testo}`,
      m
    )

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        extendedTextMessage: {
          text: testo,
          contextInfo: {
            mentionedJid: users
          }
        }
      },
      { quoted: m }
    )

    await conn.reply(m.chat, '*🧪 𝐃𝐄𝐁𝐔𝐆 𝟓*\n\n*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐜𝐫𝐞𝐚𝐭𝐨, 𝐩𝐫𝐨𝐯𝐨 𝐚 𝐢𝐧𝐯𝐢𝐚𝐫𝐥𝐨...*', m)

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    await conn.reply(m.chat, '*✅ 𝐃𝐄𝐁𝐔𝐆 𝟔*\n\n*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐢𝐧𝐯𝐢𝐚𝐭𝐨.*', m)

  } catch (e) {
    await conn.reply(
      m.chat,
      `*❌ 𝐃𝐄𝐁𝐔𝐆 𝐄𝐑𝐑𝐎𝐑𝐄*\n\n\`\`\`${e.message || e}\`\`\``,
      m
    )
  }
}

handler.customPrefix = /^@/
handler.command = /^(everyone|tutti|all)$/i
handler.tags = ['gruppo']
handler.group = true
handler.admin = true

export default handler