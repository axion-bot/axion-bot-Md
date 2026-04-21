// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')
const ROLE_EVENT_CACHE_MS = 8000

global.roleActionCache = global.roleActionCache || new Map()

function normalizeJid(jid) {
  return String(jid || '').split(':')[0]
}

function makeRoleCacheKey(chatId, action, users = []) {
  return `${chatId}|${action}|${[...users].map(normalizeJid).sort().join(',')}`
}

function markRoleAction(chatId, action, users = []) {
  global.roleActionCache.set(
    makeRoleCacheKey(chatId, action, users),
    Date.now()
  )
}

global.isRecentRoleAction = function (chatId, action, users = []) {
  const key = makeRoleCacheKey(chatId, action, users)
  const ts = global.roleActionCache.get(key)
  if (!ts) return false
  if (Date.now() - ts > ROLE_EVENT_CACHE_MS) {
    global.roleActionCache.delete(key)
    return false
  }
  return true
}

function cleanupRoleActionCache() {
  const now = Date.now()
  for (const [key, ts] of global.roleActionCache.entries()) {
    if (now - ts > ROLE_EVENT_CACHE_MS) global.roleActionCache.delete(key)
  }
}

async function getThumbnailBuffer(conn, chat) {
  let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    thumb = await conn.profilePictureUrl(chat, 'image')
  } catch {}

  return typeof thumb === 'string'
    ? await (await fetch(thumb)).buffer()
    : thumb
}

global.sendRoleChangeMessage = async function (conn, chatId, sender, users, action, quoted = null) {
  users = [...new Set((users || []).map(normalizeJid))]
  sender = normalizeJid(sender)

  if (!users.length || !sender) return
  
  const icon = action === 'promote' ? '👑' : '🙇‍♂️'
  const title = action === 'promote'
    ? '𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄'
    : '𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄'

  const thumbnailBuffer = await getThumbnailBuffer(conn, chatId)

  const targetLabel = users.length === 1
    ? `@${users[0].split('@')[0]}`
    : 'gli utenti selezionati'

  const actionText = action === 'promote'
    ? `*@${sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.*`
    : `*@${sender.split('@')[0]} 𝐡𝐚 𝐭𝐨𝐥𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.*`

  const tagList = users.map(u => `• @${u.split('@')[0]}`).join('\n')

  const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${actionText}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(chatId, {
    text: msg,
    mentions: [sender, ...users],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: 'Gestione permessi gruppo',
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, quoted ? { quoted } : {})
}

var handler = async (m, { conn, text, command }) => {
  cleanupRoleActionCache()

  let action
  const sender = normalizeJid(m.sender)

  let users = m.mentionedJid && m.mentionedJid.length > 0
    ? m.mentionedJid
    : (m.quoted ? [m.quoted.sender] : [])

  if (!users.length && text) {
    const numbers = S(text).split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  users = [...new Set(users.map(normalizeJid))]

  if (!users.length) {
    return conn.reply(m.chat, '*⚠️ 𝐈𝐧𝐝𝐢𝐜𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*', m)
  }

  action = ['promote', 'promuovi', 'p', 'p2'].includes(command) ? 'promote' : 'demote'

  try {
    const ownerNumbers = (global.owner || []).map(v => String(Array.isArray(v) ? v[0] : v))
    const ownerJids = ownerNumbers.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')

    if (action === 'demote') {
      const blockedOwners = users.filter(u => ownerJids.includes(u))

      if (blockedOwners.length) {
        const tagList = blockedOwners.map(u => `• @${u.split('@')[0]}`).join('\n')

        const msg = `*╭━━━━━━━🙇‍♂️━━━━━━━╮*
*✦ 𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━🙇‍♂️━━━━━━━╯*

*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

        return conn.sendMessage(m.chat, {
          text: msg,
          mentions: blockedOwners
        }, { quoted: m })
      }
    }

    await conn.groupParticipantsUpdate(m.chat, users, action)
    markRoleAction(m.chat, action, users)
    await global.sendRoleChangeMessage(conn, m.chat, sender, users, action, m)

  } catch (e) {
    conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler