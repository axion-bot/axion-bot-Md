const adminWarnCooldown = new Map()

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

function getCooldownKey(chat, sender) {
  return `${chat}:${sender}`
}

function canWarn(chat, sender, ms = 10000) {
  const key = getCooldownKey(chat, sender)
  const now = Date.now()
  const last = adminWarnCooldown.get(key) || 0

  if (now - last < ms) return false

  adminWarnCooldown.set(key, now)
  return true
}

let handler = m => m

handler.before = async function (m, { isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup) return false
  if (m.fromMe) return false
  if (isAdmin || isOwner || isROwner) return false

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  if (!chat.modoadmin) return false

  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!isCommandMessage(text)) return false

  const box = (title, desc) => `╭━━━━━━━⚙️━━━━━━━╮
✦ ${title} ✦
╰━━━━━━━⚙️━━━━━━━╯

*${desc}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  try {
    if (isBotAdmin) {
      await this.sendMessage(m.chat, { delete: m.key })
    }
  } catch {}

  if (canWarn(m.chat, m.sender)) {
    await this.sendMessage(m.chat, {
      text: box(
        '𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍',
        `❌ *@${m.sender.split('@')[0]} 𝐧𝐨𝐧 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨*

*✅ 𝐈𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢*

*⏳ 𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐩𝐢𝐮̀ 𝐭𝐚𝐫𝐝𝐢.*`
      ),
      mentions: [m.sender]
    }, { quoted: m })
  }

  return true
}

export default handler