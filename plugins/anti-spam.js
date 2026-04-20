// Plugin AntiSpam by Bonzino

const spamCache = new Map()

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
  ).trim()
}

function isViewOnceMessage(msg = {}) {
  return !!(
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2 ||
    msg.viewOnceMessageV2Extension
  )
}

function getSpamKey(chat, sender) {
  return `${chat}:${sender}`
}

function getSpamState(chat, sender) {
  const key = getSpamKey(chat, sender)
  if (!spamCache.has(key)) {
    spamCache.set(key, {
      timestamps: [],
      lastText: '',
      repeated: 0
    })
  }
  return spamCache.get(key)
}

function pruneOld(timestamps, windowMs) {
  const now = Date.now()
  return timestamps.filter(ts => now - ts <= windowMs)
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup) return false
  if (m.fromMe || m.isBaileys) return true

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  if (!chat.antispam) return false

  if (isAdmin || isOwner || isROwner) return false
  if (!isBotAdmin) return false

  const msg = m.message || {}
  if (isViewOnceMessage(msg)) return false

  const text = getMessageText(m)
  const hasMedia =
    !!msg.imageMessage ||
    !!msg.videoMessage ||
    !!msg.audioMessage ||
    !!msg.documentMessage ||
    !!msg.stickerMessage

  const state = getSpamState(m.chat, m.sender)
  const now = Date.now()

  state.timestamps.push(now)
  state.timestamps = pruneOld(state.timestamps, 8000)

  if (text && text === state.lastText) {
    state.repeated += 1
  } else {
    state.lastText = text
    state.repeated = 1
  }

  const floodSpam = state.timestamps.length >= 6
  const repeatSpam = !!text && state.repeated >= 4
  const mediaFlood = hasMedia && state.timestamps.length >= 4

  const isSpam = floodSpam || repeatSpam || mediaFlood
  if (!isSpam) return false

  global.db.data.users[m.sender] ||= {}
  global.db.data.users[m.sender].warn ||= 0
  global.db.data.users[m.sender].warnReasons ||= []

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

  global.db.data.users[m.sender].warn += 1
  global.db.data.users[m.sender].warnReasons.push('spam')

  const warn = global.db.data.users[m.sender].warn
  const maxWarn = 3
  const mention = `@${m.sender.split('@')[0]}`

  if (warn >= maxWarn) {
    global.db.data.users[m.sender].warn = 0
    global.db.data.users[m.sender].warnReasons = []

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } catch {}

    await conn.sendMessage(m.chat, {
      text: box(
        '𝐀𝐍𝐓𝐈 𝐒𝐏𝐀𝐌',
        `*❌ 𝐒𝐩𝐚𝐦 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*🚫 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*
*👢 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
      ),
      mentions: [m.sender]
    }, { quoted: m })

    spamCache.delete(getSpamKey(m.chat, m.sender))
    return true
  }

  await conn.sendMessage(m.chat, {
    text: box(
      '𝐀𝐍𝐓𝐈 𝐒𝐏𝐀𝐌',
      `*❌ 𝐒𝐩𝐚𝐦 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/${maxWarn}
*👢 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`
    ),
    mentions: [m.sender]
  }, { quoted: m })

  return true
}