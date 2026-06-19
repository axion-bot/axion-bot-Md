// Plugin BloccaUtente by Bonzino

const blockedNoticeCooldown = new Map()

const S = v => String(v || '')

function getPrefixes() {
  const p = global.prefix

  if (Array.isArray(p)) return p.map(v => S(v)).filter(Boolean)
  if (typeof p === 'string') return [p]

  return ['.', '!', '#', '/']
}

function isCommandMessage(text) {
  const t = S(text).trim()
  if (!t) return false

  const prefixes = getPrefixes()
  return prefixes.some(prefix => t.startsWith(prefix))
}

function getTarget(m) {
  return m.mentionedJid?.[0] || m.quoted?.sender || null
}

function getCooldownKey(chat, sender) {
  return `${chat}:${sender}`
}

function canSendBlockedNotice(chat, sender, ms = 5000) {
  const key = getCooldownKey(chat, sender)
  const now = Date.now()
  const last = blockedNoticeCooldown.get(key) || 0

  if (now - last < ms) return false

  blockedNoticeCooldown.set(key, now)
  return true
}

const box = (title, desc) => `> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

let handler = async (m, { conn, command, isOwner, isROwner }) => {
  global.db.data.settings ??= {}
  global.db.data.settings.blockedUsers ??= {}

  const target = getTarget(m)
  if (!target) {
    throw box(
      '𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄',
      '⚠️ 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞'
    )
  }

  if (target === conn.user.jid) {
    throw box('𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄', '⚠️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐛𝐥𝐨𝐜𝐜𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭')
  }

  const blockedUsers = global.db.data.settings.blockedUsers
  const isBlockCmd = /^(blockuser|bloccautente|blocca)$/i.test(command)
  const isBlocked = !!blockedUsers[target]
  const mention = `@${target.split('@')[0]}`

  if (isBlockCmd) {
    if (isBlocked) {
      return conn.sendMessage(m.chat, {
        text: box(
          '𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄',
          `⚠️ ${mention} 𝐞̀ 𝐠𝐢𝐚̀ 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐝𝐚𝐥𝐥’𝐮𝐬𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭`
        ),
        mentions: [target]
      }, { quoted: m })
    }

    blockedUsers[target] = {
      blockedAt: Date.now(),
      blockedBy: m.sender
    }

    return conn.sendMessage(m.chat, {
      text: box(
        '*𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄',
        `✅ ${mention} *𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨*

🚫 *𝐃𝐚 𝐨𝐫𝐚 𝐧𝐨𝐧 𝐩𝐨𝐭𝐫𝐚̀ 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢 𝐝𝐞𝐥 𝐛𝐨𝐭*`
      ),
      mentions: [target]
    }, { quoted: m })
  }

  if (!isBlocked) {
    return conn.sendMessage(m.chat, {
      text: box(
        '𝐒𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄',
        `⚠️ ${mention} 𝐧𝐨𝐧 𝐞̀ 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨`
      ),
      mentions: [target]
    }, { quoted: m })
  }

  delete blockedUsers[target]

  return conn.sendMessage(m.chat, {
    text: box(
      '𝐒𝐁𝐋𝐎𝐂𝐂𝐎 𝐔𝐓𝐄𝐍𝐓𝐄',
      `✅ ${mention} *𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨*

*🟢 𝐎𝐫𝐚 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢 𝐝𝐞𝐥 𝐛𝐨𝐭*`
    ),
    mentions: [target]
  }, { quoted: m })
}

handler.before = async function (m, { isOwner, isROwner }) {
  if (m.fromMe) return false
  if (isOwner || isROwner) return false

  global.db.data.settings ??= {}
  global.db.data.settings.blockedUsers ??= {}

  const blockedUsers = global.db.data.settings.blockedUsers
  if (!blockedUsers[m.sender]) return false

  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!isCommandMessage(text)) return false

  try {
    await this.sendMessage(m.chat, { delete: m.key })
  } catch {}

  if (canSendBlockedNotice(m.chat, m.sender)) {
    await this.sendMessage(m.chat, {
      text: box(
        '𝐔𝐓𝐄𝐍𝐓𝐄 𝐁𝐋𝐎𝐂𝐂𝐀𝐓𝐎',
        `❌ @${m.sender.split('@')[0]} *𝐧𝐨𝐧 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭*

🚫 *𝐋’𝐚𝐜𝐜𝐞𝐬𝐬𝐨 𝐚𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐯𝐨𝐜𝐚𝐭𝐨 𝐝𝐚𝐥𝐥’𝐨𝐰𝐧𝐞𝐫*`
      ),
      mentions: [m.sender]
    }, { quoted: m })
  }

  return true
}

handler.help = ['blockuser @utente', 'unblockuser @utente']
handler.tags = ['owner']
handler.owner = true
handler.command = /^(blockuser|unblockuser|bloccautente|sbloccautente|blocca|sblocca)$/i

export default handler