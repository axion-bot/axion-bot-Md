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
      const p = meta.participants.find(v => v.id === jid || v.jid === jid)
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
  let isOwner = false

  if (Array.isArray(global.owner)) {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net')
    isOwner = ownerJids.includes(target)
  }

  try {
    if (Array.isArray(meta?.participants)) {
      const participant = meta.participants.find(u => u.id === target || u.jid === target)

      if (participant?.admin === 'admin') isAdmin = true
      if (participant?.admin === 'superadmin') {
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

  let roleText = '👤 𝐌𝐞𝐦𝐛𝐫𝐨'
  if (isOwner) roleText = '⭐ 𝐎𝐰𝐧𝐞𝐫'
  else if (isSuperAdmin) roleText = '👑 𝐒𝐮𝐩𝐞𝐫𝐀𝐝𝐦𝐢𝐧'
  else if (isAdmin) roleText = '🛡️ 𝐀𝐝𝐦𝐢𝐧'

  const tag = '@' + bare(target)

  const text = `╭━━━━━━━📌━━━━━━━╮
   ✦ 𝐈𝐍𝐅𝐎 𝐔𝐓𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━📌━━━━━━━╯

👤 𝐍𝐨𝐦𝐞: ${displayName}
🆔 𝐈𝐃: ${tag}
🔑 𝐑𝐮𝐨𝐥𝐨: ${roleText}
💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${messages}
📅 𝐄𝐧𝐭𝐫𝐚𝐭𝐚: ${joinedAt}
⚠️ 𝐖𝐚𝐫𝐧: ${warn}/𝟑
🔇 𝐌𝐮𝐭𝐞: ${muted ? '𝐒𝐢' : '𝐍𝐨'}`

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