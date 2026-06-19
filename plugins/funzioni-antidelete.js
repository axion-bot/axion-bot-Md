// anti-delete by Bonzino

import { axionSystem, axionFooter } from '../lib/axionsystem.js'

const formatBytes = bytes => {
if (!bytes) return '0 B'
const sizes = ['B', 'KB', 'MB', 'GB']
const i = Math.floor(Math.log(bytes) / Math.log(1024))
return "${(bytes / Math.pow(1024, i)).toFixed(i ? 2 : 0)} ${sizes[i]}"
}

const formatDuration = seconds => {
if (!seconds) return '00:00'
const m = Math.floor(seconds / 60)
const s = seconds % 60
return "${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}"
}

const formatTime = timestamp => {
return new Date(timestamp * 1000).toLocaleTimeString('it-IT', {
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
})
}

let handler = m => m

handler.before = async function (m, { conn }) {
try {
if (!m.isGroup) return

const chat = global.db.data.chats[m.chat] || {}
if (!chat.antidelete) return

const protocol = m.message?.protocolMessage

if (!protocol) return
if (protocol.type !== 0) return

const deleted = await global.store.loadMessage(
  m.chat,
  protocol.key.id
)

if (!deleted?.message) return

const sender = conn.decodeJid(
  deleted.sender ||
  deleted.participant ||
  protocol.key.participant ||
  ''
)

const senderTag = sender.split('@')[0]
const timestamp = deleted.messageTimestamp || Math.floor(Date.now() / 1000)

let type = 'Messaggio'
let size = null
let duration = null
let fileName = null
let textContent = null

if (deleted.message.conversation) {
  type = 'Testo'
  textContent = deleted.message.conversation
}

if (deleted.message.extendedTextMessage?.text) {
  type = 'Testo'
  textContent = deleted.message.extendedTextMessage.text
}

if (deleted.message.imageMessage) {
  type = 'Immagine'
  size = formatBytes(deleted.message.imageMessage.fileLength)
  textContent = deleted.message.imageMessage.caption || null
}

if (deleted.message.videoMessage) {
  type = 'Video'
  size = formatBytes(deleted.message.videoMessage.fileLength)
  duration = formatDuration(deleted.message.videoMessage.seconds || 0)
  textContent = deleted.message.videoMessage.caption || null
}

if (deleted.message.audioMessage) {
  type = 'Audio'
  size = formatBytes(deleted.message.audioMessage.fileLength)
  duration = formatDuration(deleted.message.audioMessage.seconds || 0)
}

if (deleted.message.documentMessage) {
  type = 'Documento'
  size = formatBytes(deleted.message.documentMessage.fileLength)
  fileName = deleted.message.documentMessage.fileName
}

if (deleted.message.stickerMessage) {
  type = 'Sticker'
  size = formatBytes(deleted.message.stickerMessage.fileLength)
}

let info =

`🚨 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐀𝐍𝐓𝐈 𝐃𝐄𝐋𝐄𝐓𝐄* 🚨

👤 *𝐔𝐭𝐞𝐧𝐭𝐞:* @${senderTag}
❓️ *𝐓𝐢𝐩𝐨:* ${type}`

if (fileName) info += `\n*📄 𝐍𝐨𝐦𝐞:* ${fileName}`
if (size) info += `\n*📦 𝐃𝐢𝐦𝐞𝐧𝐬𝐢𝐨𝐧𝐞:* ${size}`
if (duration) info += `\n*⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚:* ${duration}`

info += `

🕒 *𝐎𝐫𝐚𝐫𝐢𝐨:* ${formatTime(timestamp)}`

if (textContent) {
  info += `

📥 *𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨:*
${textContent}`
}

if (deleted.message.imageMessage) {
  const buffer = await deleted.download()

  return axionSystem(conn, m.chat, {
    image: buffer,
    text: axionFooter(info),
    thumb: 'antidelete',
    mentions: [sender],
    quoted: m
  })
}

if (deleted.message.videoMessage) {
  const buffer = await deleted.download()

  return axionSystem(conn, m.chat, {
    video: buffer,
    text: axionFooter(info),
    thumb: 'antidelete',
    mentions: [sender],
    quoted: m
  })
}

if (deleted.message.audioMessage) {
  const buffer = await deleted.download()

  await conn.sendMessage(
    m.chat,
    {
      audio: buffer,
      mimetype: 'audio/mp4',
      ptt: deleted.message.audioMessage.ptt || false
    },
    { quoted: m }
  )

  return axionSystem(conn, m.chat, {
    text: axionFooter(info),
    thumb: 'antidelete',
    mentions: [sender],
    quoted: m
  })
}

if (deleted.message.documentMessage) {
  const buffer = await deleted.download()

  await conn.sendMessage(
    m.chat,
    {
      document: buffer,
      fileName: fileName || 'documento',
      mimetype: deleted.message.documentMessage.mimetype
    },
    { quoted: m }
  )

  return axionSystem(conn, m.chat, {
    text: axionFooter(info),
    thumb: 'antidelete',
    mentions: [sender],
    quoted: m
  })
}

if (deleted.message.stickerMessage) {
  const buffer = await deleted.download()

  await conn.sendMessage(
    m.chat,
    { sticker: buffer },
    { quoted: m }
  )

  return axionSystem(conn, m.chat, {
    text: axionFooter(info),
    thumb: 'antidelete',
    mentions: [sender],
    quoted: m
  })
}

await axionSystem(conn, m.chat, {
  text: axionFooter(info),
  thumb: 'antidelete',
  mentions: [sender],
  quoted: m
})

} catch (e) {
console.error('AntiDelete:', e)
}
}

export default handler