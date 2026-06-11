// funzioni-soloadmin by Bonzino

import { createFakeContact } from '../lib/fakecontact.js'
import { axionSystem, axionFooter } from '../lib/axionsystem.js'

const adminWarnCooldown = new Map()
const adminWarnMessageMap = new Map()
const S = v => String(v || '')

function getActivePrefix(match) {
  const fromMatch = S(match?.[0]?.[0])
  if (fromMatch) return fromMatch
  const saved = global.db?.data?.settings?.prefix
  if (typeof saved === 'string' && saved) return saved
  if (typeof global.prefix === 'string' && global.prefix) return global.prefix
  return '.'
}

function escapeRegex(text = '') {
  return S(text).replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&')
}

function isAcceptedCommand(command) {
  command = S(command).toLowerCase()
  if (!command) return false

  for (const name in global.plugins) {
    const plugin = global.plugins[name]
    if (!plugin?.command) continue

    if (plugin.command instanceof RegExp && plugin.command.test(command)) return true

    if (Array.isArray(plugin.command) && plugin.command.some(cmd =>
      cmd instanceof RegExp ? cmd.test(command) : S(cmd).toLowerCase() === command
    )) return true

    if (typeof plugin.command === 'string' && plugin.command.toLowerCase() === command) return true
  }

  return false
}

function isRealCommandMessage(text, prefix) {
  const t = S(text).trim()
  if (!t || !prefix) return false

  const re = new RegExp('^' + escapeRegex(prefix))
  if (!re.test(t)) return false

  const noPrefix = t.replace(re, '').trim()
  if (!noPrefix) return false

  const command = noPrefix.split(/\s+/)[0]?.toLowerCase()
  if (!command) return false

  return isAcceptedCommand(command)
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

function getStoredWarnMessage(chat, sender) {
  return adminWarnMessageMap.get(`${chat}:${sender}`)
}

function setStoredWarnMessage(chat, sender, key) {
  adminWarnMessageMap.set(`${chat}:${sender}`, key)
}

function isAuthorizedMod(sender) {
  const user = global.db?.data?.users?.[sender] || {}
  return !!(user.mod || user.mods || user.moderator || user.isMod || user.isModerator)
}

let handler = m => m

handler.before = async function (
  m,
  { conn, match, isAdmin, isModerator, isOwner, isROwner }
) {
  if (!m.isGroup) return false
  if (m.fromMe) return false

  const allowedMod = isModerator || isAuthorizedMod(m.sender)

  if (isAdmin || allowedMod || isOwner || isROwner) return false

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  if (!chat.modoadmin) return false

  const text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
  const prefix = getActivePrefix(match)

  if (!isRealCommandMessage(text, prefix)) return false
  if (!canWarn(m.chat, m.sender)) return true

  const previousWarn = getStoredWarnMessage(m.chat, m.sender)

  if (previousWarn) {
    try {
      await this.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })
    } catch {}

    return true
  }

  const mention = `@${m.sender.split('@')[0]}`
  const fakeContact = await createFakeContact(m, conn || this)

  const sent = await axionSystem(conn || this, m.chat, {
    text: axionFooter(`👤 ${mention}

*❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*

*✅ 𝐈𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐞 𝐢 𝐦𝐨𝐝 𝐚𝐮𝐭𝐨𝐫𝐢𝐳𝐳𝐚𝐭𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢.*`),
    thumb: 'modoadmin',
    mentions: [m.sender],
    quoted: fakeContact
  })

  if (sent?.key) setStoredWarnMessage(m.chat, m.sender, sent.key)

  return true
}

export default handler