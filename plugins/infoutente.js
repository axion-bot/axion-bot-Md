//Infoutente.js plugin by Bonzino

function S(v) {
  return String(v || '')
}

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

function resolveTargetJid(m) {
  if (m.mentionedJid && m.mentionedJid[0]) return m.mentionedJid[0]
  if (m.quoted && m.quoted.sender) return m.quoted.sender
  return m.sender
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

// 🔥 DETECT DEVICE
function getDevice(m) {
  try {
    if (m.device) return m.device

    const id = m.key?.id || ''

    if (id.startsWith('3A')) return '📱 Android'
    if (id.startsWith('3E')) return '🍏 iPhone'
    if (id.startsWith('BAE')) return '💻 Web'
    if (id.length > 21) return '💻 Desktop'

    return '❓ Sconosciuto'
  } catch {
    return '❓ Sconosciuto'
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
  const user = global?.db?.data?.users?.[target] || {}
  const chat = global?.db?.data?.chats?.[chatId] || {}
  const chatUser = chat?.users?.[target] || {}

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
  const messages = Number(chatUser.messages || 0)

  const joinedAt =
    user.regTime > 0
      ? formatDate(user.regTime)
      : user.firstTime > 0
        ? formatDate(user.firstTime)
        : 'Non disponibile'

  const device = getDevice(m)

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
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* ${messages}
*📅 𝐄𝐧𝐭𝐫𝐚𝐭𝐚:* ${joinedAt}
*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/𝟑
*🔇 𝐌𝐮𝐭𝐞:* ${muted ? '*𝐒𝐢*' : '*𝐍𝐨*'}`

  await conn.sendMessage(chatId, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['infoutente', 'userinfo', 'whoami', 'info']
handler.tags = ['info']
handler.command = /^(infoutente|userinfo|whoami|info)$/i
handler.owner = true

export default handler