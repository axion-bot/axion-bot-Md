// Plugin AntiPorno by Bonzino

import { downloadContentFromMessage } from '@realvare/baileys'
import crypto from 'crypto'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiporno) return true
  if (isAdmin || isOwner || isROwner || m.fromMe) return true

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  if (typeof user.warn !== 'number') user.warn = 0
  if (!Array.isArray(user.warnReasons)) user.warnReasons = []

  if (!global.db.data.nsfwCache) global.db.data.nsfwCache = {}

  const isMedia =
    m.message.imageMessage ||
    m.message.videoMessage ||
    m.message.stickerMessage

  if (isMedia) {
    try {
      let mediaBuffer, mimeType, fileName
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage

      const msg = quoted
        ? (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage)
        : (m.message.imageMessage || m.message.videoMessage || m.message.stickerMessage)

      if (!msg) return true

      let type
      const isStickerMsg = !!(
        quoted?.stickerMessage ||
        m.message.stickerMessage ||
        msg.mimetype === 'image/webp'
      )

      if (isStickerMsg) type = 'sticker'
      else if (msg.mimetype?.includes('video')) type = 'video'
      else if (msg.mimetype?.includes('image')) type = 'image'
      else return true

      const stream = await downloadContentFromMessage(msg, type)
      mediaBuffer = Buffer.from([])

      for await (const chunk of stream) {
        mediaBuffer = Buffer.concat([mediaBuffer, chunk])
      }

      const fileHash = crypto.createHash('md5').update(mediaBuffer).digest('hex')

      if (global.db.data.nsfwCache[fileHash] === true) {
        return await punishUser(conn, m, user, isBotAdmin, '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐍𝐒𝐅𝐖 𝐠𝐢à 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
      }

      if (global.db.data.nsfwCache[fileHash] === false) {
        return true
      }

      if (type === 'video') {
        mimeType = 'video/mp4'
        fileName = 'media.mp4'
        if (mediaBuffer.length > 10 * 1024 * 1024) return true
      } else if (type === 'sticker') {
        mimeType = 'image/webp'
        fileName = 'media.webp'
      } else {
        mimeType = msg.mimetype || 'image/jpeg'
        fileName = 'media.jpg'
      }

      const SIGHTENGINE_USER = global.APIKeys.sightengine_user
const SIGHTENGINE_SECRET = global.APIKeys.sightengine_secret

console.log('Sightengine user:', SIGHTENGINE_USER)
console.log('Sightengine secret:', SIGHTENGINE_SECRET ? 'OK' : 'MANCANTE')

      if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) return true

      const apiUrl = type === 'video'
        ? 'https://api.sightengine.com/1.0/video/check-sync.json'
        : 'https://api.sightengine.com/1.0/check.json'

      const formData = new FormData()
      formData.append('media', mediaBuffer, { filename: fileName, contentType: mimeType })
      formData.append('models', 'nudity-2.1')
      formData.append('api_user', SIGHTENGINE_USER)
      formData.append('api_secret', SIGHTENGINE_SECRET)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.status !== 'success') {
        console.log('Errore API SightEngine:', result)
        return true
      }

      let raw = 0
      let partial = 0
      let sexual = 0
      let erotica = 0

      if (type === 'video') {
        const frames = result.data?.frames || []
        raw = Math.max(...frames.map(f => f.nudity?.raw || 0), 0)
        partial = Math.max(...frames.map(f => f.nudity?.partial || 0), 0)
        sexual = Math.max(...frames.map(f => f.nudity?.sexual_activity || f.nudity?.sexual_display || 0), 0)
        erotica = Math.max(...frames.map(f => f.nudity?.erotica || 0), 0)
      } else {
        const nudity = result.nudity || {}
        raw = nudity.raw || 0
        partial = nudity.partial || 0
        sexual = nudity.sexual_activity || nudity.sexual_display || 0
        erotica = nudity.erotica || 0
      }

      const isHighRisk =
        raw > 0.40 ||
        sexual > 0.50 ||
        erotica > 0.60 ||
        (partial > 0.70 && raw > 0.10)

      global.db.data.nsfwCache[fileHash] = isHighRisk

      if (isHighRisk) {
        return await punishUser(conn, m, user, isBotAdmin, '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐯𝐢𝐬𝐮𝐚𝐥𝐞 𝐍𝐒𝐅𝐖 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
      }
    } catch (e) {
      console.error('Errore antiporno:', e)
      return true
    }
  }

  const txt = (m.text || m.caption || '').toLowerCase()
  const nsfwKeywords = ['porn', 'xnxx', 'xvideos', 'xhamster', 'nude', 'pornhub']

  if (txt.includes('http') && nsfwKeywords.some(keyword => txt.includes(keyword))) {
    return await punishUser(conn, m, user, isBotAdmin, '𝐋𝐢𝐧𝐤 𝐍𝐒𝐅𝐖 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
  }

  return true
}

async function punishUser(conn, m, user, isBotAdmin, reason) {
  user.warn += 1
  user.warnReasons ??= []
  user.warnReasons.push('antiporno')

  const senderTag = m.sender.split('@')[0]

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch {}

  if (user.warn < 3) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🔞━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐏𝐎𝐑𝐍𝐎 ✦*
╰━━━━━━━🔞━━━━━━━╯

*@${senderTag}*
*⚠️ ${reason}*
*📌 𝐀𝐯𝐯𝐢𝐬𝐨:* *${user.warn}/3*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })

    return false
  }

  user.warn = 0
  user.warnReasons = []

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🔞━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐏𝐎𝐑𝐍𝐎 ✦*
╰━━━━━━━🔞━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐇𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐚𝐯𝐯𝐢𝐬𝐢*
*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })

    return false
  }

  await conn.sendMessage(m.chat, {
    text: `╭━━━━━━━🔞━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐏𝐎𝐑𝐍𝐎 ✦*
╰━━━━━━━🔞━━━━━━━╯

*@${senderTag}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐍𝐒𝐅𝐖 / 𝐩𝐨𝐫𝐧𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    mentions: [m.sender]
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  return false
}

export default handler