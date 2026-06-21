// antiviewonce by Bonzino
import { axionSystem, axionFooter } from '../lib/axionsystem.js'
let HOOKED = false
const SEEN = new Set()

const getWarns = (chat, user, add = false) => {
  chat.antivoWarns ||= {}
  chat.antivoWarns[user] ||= 0
  if (add) chat.antivoWarns[user]++
  return chat.antivoWarns[user]
}

const isViewOnce = (m) => !!(m?.key?.isViewOnce || m?.isViewOnce || m?.message?.viewOnceMessage || m?.message?.viewOnceMessageV2 || m?.message?.viewOnceMessageV2Extension)

function ensureHook(conn) {
  if (HOOKED) return
  HOOKED = true

  conn.ev.on('messages.upsert', async ({ messages = [] }) => {
    for (const msg of messages) {
      if (!isViewOnce(msg)) continue
      const id = msg?.key?.id
      if (id && SEEN.has(id)) continue
      if (id) {
        SEEN.add(id)
        if (SEEN.size > 5000) SEEN.clear()
      }

      const chatId = msg?.key?.remoteJid
      if (!chatId?.endsWith('@g.us')) continue

      const chat = global.db.data.chats?.[chatId] ||= {}
      if (!chat.antiviewonce) continue

      const sender = msg?.key?.participant || msg?.participant
      if (!sender) continue

      const warns = getWarns(chat, sender, true)
      const mention = sender.split('@')[0]

      try { await conn.sendMessage(chatId, { delete: msg.key }) } catch {}

      if (warns < 3) {
        try {
          await axionSystem(conn, chatId, {
            text: axionFooter(`*❌ 𝐕𝐢𝐞𝐰 𝐎𝐧𝐜𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*\n\n*@${mention}*\n\n*⚠️ 𝐖𝐚𝐫𝐧:* *${warns}/3*\n\n*📸 𝐈𝐧𝐯𝐢𝐚 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚 𝐢𝐧 𝐦𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀ 𝐧𝐨𝐫𝐦𝐚𝐥𝐞*`),
            thumb: 'antiviewonce',
            mentions: [sender]
          })
        } catch {}
        continue
      }

      chat.antivoWarns[sender] = 0
      try {
        await axionSystem(conn, chatId, {
          text: axionFooter(`*🚫 𝐔𝐭𝐞𝐧𝐭𝐞 𝐄𝐬𝐩𝐮𝐥𝐬𝐨*\n\n*@${mention}*\n\n*⚠️ 𝐑𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐢 𝟑 𝐖𝐚𝐫𝐧*`),
          thumb: 'antiviewonce',
          mentions: [sender]
        })
        await conn.groupParticipantsUpdate(chatId, [sender], 'remove')
      } catch {}
    }
  })
}

let handler = m => m
handler.before = async function (m, { conn }) {
  ensureHook(conn)
  return false
}
export default handler
