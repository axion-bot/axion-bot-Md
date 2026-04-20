// Plugin AntiSpam by Bonzino

const uzer = new Map()
let bohtbhnonso = 0

const handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isDio, isROwner }) {
  if (!m.isGroup) return
  if (m.fromMe || m.isBaileys) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antispam || chat.modoadmin || isOwner || isROwner || isDio || isAdmin || !isBotAdmin) {
    return
  }

  if (m.message?.viewOnceMessage) return
  if (m.mtype === 'reactionMessage' || m.mtype === 'pollUpdateMessage' || m.mtype === 'protocolMessage') return

  const msgTimestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now()
  if (Date.now() - msgTimestamp > 10000) return

  const sender = m.sender
  const decodedSender = conn.decodeJid(sender)
  const senderNumber = decodedSender.split('@')[0].split(':')[0]

  if (decodedSender.split('@')[1] === 'lid') return

  const configurazioneantispam = {
    timeWindow: 10000,
    removeThreshold: 10,
    timeThreshold: 1500,
    duplicateWindow: 30000
  }

  const now = Date.now()

  if (now - bohtbhnonso > 300000) {
    cleanupOldData(300000)
    bohtbhnonso = now
  }

  let userData = uzer.get(decodedSender)
  if (!userData) {
    userData = {
      timestamps: [],
      messages: []
    }
    uzer.set(decodedSender, userData)
  }

  const messageContent = getMessageContent(m)
  if (messageContent === 'unknown_message_type' || messageContent === 'error_parsing_message') return

  const contentHash = hashContent(messageContent)

  userData.timestamps.push(msgTimestamp)
  userData.messages.push({
    time: msgTimestamp,
    hash: contentHash
  })

  userData.timestamps = userData.timestamps.filter(t => now - t < configurazioneantispam.timeWindow)
  userData.messages = userData.messages.filter(msg => now - msg.time < configurazioneantispam.duplicateWindow)

  const duplicateCount = userData.messages.filter(msg =>
    msg.hash === contentHash && msg.time !== msgTimestamp
  ).length

  let effectiveRemoveThreshold = configurazioneantispam.removeThreshold
  if (duplicateCount > 0) {
    effectiveRemoveThreshold = Math.max(5, configurazioneantispam.removeThreshold - (duplicateCount * 2))
  }

  const messageCount = userData.timestamps.length

  if (messageCount >= effectiveRemoveThreshold) {
    userData.timestamps.sort((a, b) => a - b)

    const totalDuration = userData.timestamps[userData.timestamps.length - 1] - userData.timestamps[0]
    const averageTime = userData.timestamps.length > 1
      ? totalDuration / (userData.timestamps.length - 1)
      : 10000

    if (averageTime < configurazioneantispam.timeThreshold || duplicateCount >= 4) {
      try {
        uzer.delete(decodedSender)

        const reason = duplicateCount >= 4
          ? `*𝐒𝐩𝐚𝐦 𝐫𝐢𝐩𝐞𝐭𝐮𝐭𝐨 (${duplicateCount + 1}x)*`
          : `*𝐅𝐥𝐨𝐨𝐝 (${averageTime.toFixed(0)}𝐦𝐬 𝐦𝐞𝐝𝐢𝐚)*`

        const utente = formatPhoneNumber(senderNumber, true)

        await conn.sendMessage(m.chat, {
          text: `╭━━━━━━━🚨━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐒𝐏𝐀𝐌 ✦*
╰━━━━━━━🚨━━━━━━━╯

*${utente}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* ${reason}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
          mentions: [decodedSender]
        }, { quoted: m })

        await conn.groupParticipantsUpdate(m.chat, [decodedSender], 'remove')
      } catch (e) {
        console.error(`[AntiSpam] Errore rimozione ${decodedSender}:`, e)
      }
      return
    }
  }

  uzer.set(decodedSender, userData)
}

function getMessageContent(m) {
  try {
    if (m.message?.conversation) return m.message.conversation
    if (m.message?.extendedTextMessage?.text) return m.message.extendedTextMessage.text
    if (m.message?.imageMessage?.caption) return `image:${m.message.imageMessage.caption}`
    if (m.message?.videoMessage?.caption) return `video:${m.message.videoMessage.caption}`
    if (m.message?.stickerMessage?.fileSha256) return `sticker:${Buffer.from(m.message.stickerMessage.fileSha256).toString('base64')}`
    if (m.message?.stickerMessage) return 'sticker:generic'
    return 'unknown_message_type'
  } catch {
    return 'error_parsing_message'
  }
}

function hashContent(content) {
  if (!content || content.length === 0) return 'empty'

  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }

  return hash.toString()
}

function cleanupOldData(interval) {
  const now = Date.now()

  for (const [key, data] of uzer.entries()) {
    if (!data.timestamps.length || now - data.timestamps[data.timestamps.length - 1] > interval) {
      uzer.delete(key)
    }
  }
}

function formatPhoneNumber(number, includeAt = false) {
  if (!number || number === '?' || number === 'sconosciuto') {
    return includeAt ? '@Sconosciuto' : 'Sconosciuto'
  }

  return includeAt ? '@' + number : number
}

export default handler