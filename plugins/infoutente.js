// by Bonzino

import { getDevice } from '@realvare/baileys'
import fetch from 'node-fetch'

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

function resolveTargetJid(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  return m.sender || m.key?.participant || m.participant || null
}

function getMessageId(m) {
  return m?.quoted?.id || m?.quoted?.key?.id || m?.key?.id || ''
}

function mapDeviceName(device) {
  switch (String(device || '').toLowerCase()) {
    case 'ios': return '🍏 𝐢𝐎𝐒'
    case 'android': return '📱 𝐀𝐧𝐝𝐫𝐨𝐢𝐝'
    case 'web': return '💻 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐖𝐞𝐛'
    case 'desktop': return '🖥️ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐃𝐞𝐬𝐤𝐭𝐨𝐩'
    default: return '❓ 𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
  }
}

function formatDate(ts) {
  if (!ts || isNaN(ts)) return '𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'
  return new Date(ts).toLocaleString('it-IT')
}

function isOwner(jid) {
  try {
    const num = bare(jid)
    if (!Array.isArray(global.owner)) return false

    return global.owner
      .map(o => Array.isArray(o) ? o[0] : o)
      .map(v => bare(v))
      .includes(num)
  } catch {
    return false
  }
}

function getRole(target, participants = [], user = {}, chatId) {
  if (isOwner(target)) return '👑 𝐃𝐢𝐨'

  const targetBare = bare(target)
  const p = participants.find(x => bare(x.id || x.jid || '') === targetBare)

  if (p?.admin === 'admin') return '🛡️ 𝐀𝐝𝐦𝐢𝐧'

  const isModerator = !!user.premium && user.premiumGroup === chatId
  if (isModerator) return '👮 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞'

  return '👤 𝐌𝐞𝐦𝐛𝐫𝐨'
}

let handler = async (m, { conn }) => {
  const target = resolveTargetJid(m)
  if (!target) return

  const user = global.db.data.users[target] || {}
  const chat = global.db.data.chats?.[m.chat] || {}

  const oggiCount = chat?.archivioMessaggi?.utenti?.[target]?.conteggio || 0

  const nome = await conn.getName(target)
  const tag = '@' + bare(target)

  const totalMessages = user.messages || 0
  const denaro = user.euro || 0
  const warn = user.warn || 0
  const muted = !!user.muto
  const device = mapDeviceName(getDevice(getMessageId(m)))
  const joinedAt = formatDate(user.regTime || user.firstTime)

  let meta
  try {
    meta = await conn.groupMetadata(m.chat)
  } catch {}

  const participants = Array.isArray(meta?.participants) ? meta.participants : []
  const ruolo = getRole(target, participants, user, m.chat)

  const profilo = await conn.profilePictureUrl(target, 'image')
    .catch(() => 'https://i.ibb.co/2kR7x9J/avatar.png')

  const thumbnailBuffer = typeof profilo === 'string'
    ? await (await fetch(profilo)).buffer()
    : profilo

  const text = `╭━━━━━━━📌━━━━━━━╮
✦ 𝐈𝐍𝐅𝐎 𝐔𝐓𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━📌━━━━━━━╯

👤 𝐍𝐨𝐦𝐞: ${nome}
🆔 𝐈𝐃: ${tag}
🛠 𝐑𝐮𝐨𝐥𝐨: ${ruolo}
📱 𝐃𝐞𝐯𝐢𝐜𝐞: ${device}
💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢: ${totalMessages}
📅 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢: ${oggiCount}
💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${denaro}
📅 𝐄𝐧𝐭𝐫𝐚𝐭𝐚: ${joinedAt}
⚠️ 𝐖𝐚𝐫𝐧: ${warn}/3
🔇 𝐌𝐮𝐭𝐞: ${muted ? '𝐒𝐢' : '𝐍𝐨'}`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [target],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [target],
      externalAdReply: {
        title: nome,
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['infoutente', 'userinfo', 'whoami', 'info']
handler.tags = ['info']
handler.command = /^(infoutente|userinfo|whoami|info)$/i
handler.owner = true

export default handler