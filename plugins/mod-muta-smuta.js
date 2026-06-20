//plugin by bonzino

import { createMuteCard } from '../lib/cards/mute-card.js'

const cleanJid = (jid = '') => String(jid || '').replace(/[^0-9]/g, '')

function normalizeJid(jid = '') {
  if (!jid) return null
  if (jid.includes('@s.whatsapp.net') || jid.includes('@lid')) return jid
  return cleanJid(jid).length > 5 ? `${cleanJid(jid)}@s.whatsapp.net` : null
}

const isOwnerJid = (jid = '') => {
  const num = cleanJid(jid)
  return (global.owner || []).some(o => cleanJid(Array.isArray(o) ? o[0] : o) === num)
}

const getMentioned = (m) => 
  m.mentionedJid?.[0] || 
  m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
  m.msg?.contextInfo?.mentionedJid?.[0] || null

function resolveTarget(m, text = '') {
  const target = getMentioned(m) || m.quoted?.sender || cleanJid(text)
  return normalizeJid(target)
}

function resolveAction(m, command = '') {
  const cmd = String(command || '').toLowerCase().replace(/^[.!/#]/, '')
  const body = String(m.text || m.body || m.message?.conversation || '').toLowerCase().trim()
  
  if (['muta', 'muto'].includes(cmd) || /^[.!/#](muta|muto)(\s|$)/i.test(body)) return true
  if (['smuta', 'smuto'].includes(cmd) || /^[.!/#](smuta|smuto)(\s|$)/i.test(body)) return false
  return null
}

function ensureChatMuteStore(chat) {
  global.db.data.chats ||= {}
  global.db.data.chats[chat] ||= {}
  return global.db.data.chats[chat].mutedUsers ||= {}
}

function parseDuration(text = '') {
  const match = String(text).toLowerCase().match(/(?:^|\s)(\d+)\s*(m|min|minuti|h|ore|ora|d|giorni|giorno)?(?:\s|$)/)
  if (!match) return null

  const value = Number(match[1])
  const unit = match[2] || 'm'
  if (!value || value <= 0) return null

  if (['h', 'ora', 'ore'].includes(unit)) return { ms: value * 3600000, label: `${value} ${value === 1 ? 'ora' : 'ore'}` }
  if (['d', 'giorno', 'giorni'].includes(unit)) return { ms: value * 86400000, label: `${value} ${value === 1 ? 'giorno' : 'giorni'}` }
  return { ms: value * 60000, label: `${value} ${value === 1 ? 'minuto' : 'minuti'}` }
}

let handler = async (m, { conn, text, command, isOwner, isROwner, isAdmin }) => {
  try {
    const cmd = String(command || '').toLowerCase()
    const isModCommand = ['muto', 'smuto'].includes(cmd)
    const replyBot = (txt) => conn.reply(m.chat, `${txt}\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)

    if (isModCommand) {
      const user = global.db.data.users?.[m.sender]
      if (!(user?.moderator && user?.moderatorGroup === m.chat)) {
        return replyBot('*⛔ 𝐒𝐨𝐥𝐨 𝐢 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
      }
    } else if (!(isAdmin || isOwner || isROwner)) return

    const isMute = resolveAction(m, command)
    const target = resolveTarget(m, text)

    if (isMute === null) return
    if (!target) return replyBot('*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚𝐝 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*')

    if (isModCommand) {
      const metadata = await conn.groupMetadata(m.chat)
      const participant = metadata.participants.find(p => p.id === target || p.jid === target)
      if (participant?.admin) return replyBot('*⛔ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐮𝐧 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞.*')
      if (isOwnerJid(target)) return replyBot('*⛔ 𝐍𝐨non 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫.*')
    }

    const executorIsOwner = !!(isOwner || isROwner || isOwnerJid(m.sender))
    if (isMute && isOwnerJid(target)) return replyBot('*⛔ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐝𝐢𝐨.*')

    const mutedUsers = ensureChatMuteStore(m.chat)
    if (!isMute && mutedUsers[target]?.mutedByOwner && !executorIsOwner) {
      return replyBot('*⛔ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐦𝐮𝐭𝐚𝐭𝐨 𝐝𝐚 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫.*\n*𝐒𝐨𝐥𝐨 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐩𝐮𝐨̀ 𝐬𝐦𝐮𝐭𝐚𝐫𝐥ὸ.*')
    }

    const duration = isMute ? parseDuration(text) : null
    if (isMute) {
      mutedUsers[target] = {
        active: true,
        expiresAt: duration ? Date.now() + duration.ms : null,
        mutedBy: m.sender,
        mutedByOwner: executorIsOwner
      }
    } else {
      delete mutedUsers[target]
    }

    const username = await conn.getName(target)
    let avatar = 'https://i.imgur.com/8K9mXz4.png'
    try { avatar = await conn.profilePictureUrl(target, 'image') } catch {}

    const card = await createMuteCard(username, avatar, isMute)
    const caption = isMute 
      ? `*🔇 𝐈 𝐬𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢.*\n\n*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}\n*⏳ 𝐃𝐮𝐫𝐚𝐭𝐚:* ${duration?.label || 'permanente'}\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      : `*🔊 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐮𝐨̀ 𝐭𝐨𝐫𝐧𝐚𝐫𝐞 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞.*\n\n*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await conn.sendMessage(m.chat, { image: card, caption, mentions: [target, m.sender] }, { quoted: m })

  } catch (e) {
    console.error('[MUTA ERROR]', e)
    conn.reply(m.chat, '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐦𝐮𝐭𝐞.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*', m)
  }
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender || m.fromMe) return

  const sender = normalizeJid(m.sender)
  if (!sender) return

  const mutedUsers = ensureChatMuteStore(m.chat)
  const muteData = mutedUsers[sender]
  if (!muteData) return

  if (muteData !== true && muteData.expiresAt && Date.now() >= muteData.expiresAt) {
    delete mutedUsers[sender]
    return
  }

  if (muteData === true || muteData.active === true) {
    try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
  }
}

handler.command = ['muta', 'smuta', 'muto', 'smuto']
handler.group = handler.botAdmin = true

export default handler
