//Infoutente.js plugin by Bonzino

// plugins/infoutente.js

import { getDevice } from '@realvare/baileys'

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

function isRealOwner(jid) {
  try {
    const num = bare(jid)
    if (!Array.isArray(global.owner)) return false

    const owners = global.owner
      .map(o => Array.isArray(o) ? o[0] : o)
      .map(v => bare(v))
      .filter(Boolean)

    return owners.includes(num)
  } catch {
    return false
  }
}

function getMessageId(m) {
  return (
    m?.quoted?.id ||
    m?.quoted?.key?.id ||
    m?.key?.id ||
    ''
  )
}

function mapDeviceName(device) {
  switch (String(device || '').toLowerCase()) {
    case 'ios': return '🍏 *𝐢𝐎𝐒*'
    case 'android': return '📱 *𝐀𝐧𝐝𝐫𝐨𝐢𝐝*'
    case 'web': return '💻 *𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐖𝐞𝐛*'
    case 'desktop': return '🖥️ *𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐃𝐞𝐬𝐤𝐭𝐨𝐩*'
    default: return '❓ *𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨*'
  }
}

async function getDisplayName(conn, jid, meta, m) {
  const dbName = global?.db?.data?.users?.[jid]?.name
  if (dbName) return dbName

  if (bare(m.sender) === bare(jid) && m.pushName) return m.pushName

  try {
    const c = conn?.contacts?.[jid]
    const n = c?.name || c?.verifiedName || c?.notify || c?.pushName
    if (n) return n
  } catch {}

  try {
    if (Array.isArray(meta?.participants)) {
      const p = meta.participants.find(v => bare(v.id || v.jid) === bare(jid))
      if (p?.name || p?.notify) return p.name || p.notify
    }
  } catch {}

  return bare(jid)
}

function formatDate(ts) {
  if (!ts || isNaN(ts)) return 'Non disponibile'
  return new Date(ts).toLocaleString('it-IT')
}

let handler = async (m, { conn }) => {
  const chatId = m.chat
  if (!chatId) return

  let meta = null
  try {
    if (m.isGroup) meta = await conn.groupMetadata(chatId)
  } catch {}

  const target = resolveTargetJid(m)
  if (!target) {
    return conn.sendMessage(chatId, {
      text: '*⚠️ Rispondi a un messaggio o tagga un utente.*'
    }, { quoted: m })
  }

  const user = global?.db?.data?.users?.[target] || {}

  let isAdmin = false
  let isSuperAdmin = false
  const isOwner = isRealOwner(target)

  try {
    if (Array.isArray(meta?.participants)) {
      const participant = meta.participants.find(
        u => bare(u.id || u.jid) === bare(target)
      )

      if (participant?.admin === 'admin') isAdmin = true
      if (participant?.admin === 'superadmin') {
        isAdmin = true
        isSuperAdmin = true
      }

      if (participant?.isAdmin === true) isAdmin = true
      if (participant?.isSuperAdmin === true) {
        isAdmin = true
        isSuperAdmin = true
      }
    }
  } catch {}

  const displayName = await getDisplayName(conn, target, meta, m)

  const warn = Number(user.warn || 0)
  const muted = !!user.muto
  const totalMessages = Number(user.messages || 0)

  const joinedAt =
    user.regTime > 0
      ? formatDate(user.regTime)
      : user.firstTime > 0
        ? formatDate(user.firstTime)
        : 'Non disponibile'

  const sourceMsg = m.quoted || m
  const msgId = getMessageId(sourceMsg)

  let device = '❓ *𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨*'
  try {
    device = mapDeviceName(getDevice(msgId))
  } catch (e) {
    console.error('infoutente-device error:', e)
  }

  const roles = []
  if (isOwner) roles.push('*⭐ 𝐎𝐰𝐧𝐞𝐫*')
  if (isAdmin) roles.push('*🛡️ 𝐀𝐝𝐦𝐢𝐧*')
  if (isSuperAdmin) roles.push('*👑 𝐒𝐮𝐩𝐞𝐫𝐀𝐝𝐦𝐢𝐧*')
  if (!roles.length) roles.push('*👤 𝐌𝐞𝐦𝐛𝐫𝐨*')

  const tag = '@' + bare(target)

  const text = `*╭━━━━━━━📌━━━━━━━╮*
   *✦ 𝐈𝐍𝐅𝐎 𝐔𝐓𝐄𝐍𝐓𝐄 ✦*
*╰━━━━━━━📌━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${displayName}
*🆔 𝐈𝐃:* ${tag}
*📱 𝐃𝐞𝐯𝐢𝐜𝐞:* ${device}
*🔑 𝐑𝐮𝐨𝐥𝐢:* ${roles.join(' | ')}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* ${totalMessages}
*📅 𝐄𝐧𝐭𝐫𝐚𝐭𝐚:* ${joinedAt}
*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/𝟑
*🔇 𝐌𝐮𝐭𝐞:* ${muted ? '*𝐒𝐢*' : '*𝐍𝐨*'}`

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  await conn.sendMessage(chatId, {
    image: { url: pp },
    caption: text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['infoutente', 'userinfo', 'whoami', 'info']
handler.tags = ['info']
handler.command = /^(infoutente|userinfo|whoami|info)$/i
handler.owner = true

export default handler