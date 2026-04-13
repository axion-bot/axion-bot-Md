//by Bonzino FINAL

import { generateWAMessageFromContent } from '@realvare/based'

let handler = async (m, { conn, participants, isAdmin }) => {

  if (!m.isGroup) return
  if (!isAdmin) return
  if (!m.text) return

  // DEBUG CHAT
  if (/@(everyone|tutti|all)/i.test(m.text)) {
    await conn.reply(m.chat, '*🧪 TRIGGER OK*', m)
  } else return

  try {
    const users = participants.map(u => conn.decodeJid(u.id))

    const testo = m.text
      .replace(/@(everyone|tutti|all)/i, '')
      .trim() || '*⚠️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚 𝐭𝐮𝐭𝐭𝐢.*'

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

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '*❌ ERRORE*', m)
  }
}

handler.command = ['_everyonehack'] // placeholder
handler.tags = ['gruppo']
handler.group = true
handler.admin = true

export default handler