//Infoutente.js plugin ny Bonzino

function S(v) {
  return String(v || '')
}

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

function normJid(conn, jid = '') {
  let x = S(jid)
  try { if (conn?.decodeJid) x = conn.decodeJid(x) } catch {}
  x = x.replace(/:[0-9]+/, '')
  if (/@lid$/.test(x)) x = x.replace(/@lid$/, '@s.whatsapp.net')
  if (!/@/.test(x)) x += '@s.whatsapp.net'
  return x
}

function resolveTargetJid(m) {
  const ctx = m?._contextInfo || m?.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) {
    return String(ctx.mentionedJid[0])
  }

  if (ctx.participant) return String(ctx.participant)

  if (m.quoted) {
    const q = m.quoted
    const qSender = q?.sender || q?.participant || q?.key?.participant
    if (qSender) return String(qSender)
  }

  return String(m.sender || m.participant || m.key?.participant || '')
}

async function getDisplayName(conn, jid, meta, m) {
  const j = normJid(conn, jid)

  const dbName = global?.db?.data?.users?.[j]?.name
  if (dbName) return dbName

  if (bare(m?.sender) === bare(j) && (m?.pushName || m?.senderName)) {
    return m.pushName || m.senderName
  }

  try {
    const c = conn?.contacts?.[j]
    const n = c?.name || c?.verifiedName || c?.notify || c?.pushName
    if (n) return n
  } catch {}

  try {
    if (Array.isArray(meta?.participants)) {
      const p = meta.participants.find(v => bare(v.id || v.jid) === bare(j))
      if (p?.name || p?.notify) return p.name || p.notify
    }
  } catch {}

  return bare(j)
}

function formatDate(ts) {
  if (!ts || isNaN(ts)) return 'Non disponibile'
  return new Date(ts).toLocaleString('it-IT')
}

let handler = async (m, { conn }) => {
  const chatId = m.chat || m.key?.remoteJid
  if (!chatId) return

  let meta = null
  try {
    if (chatId.endsWith('@g.us')) meta = await conn.groupMetadata(chatId)
  } catch {}

  const rawTarget = resolveTargetJid(m)
  const target = normJid(conn, rawTarget)

  let isAdmin = false
  let isSuperAdmin = false

  try {
    if (Array.isArray(meta?.participants)) {
      const p = meta.participants.find(v => bare(v.id || v.jid) === bare(target))
      const role = S(p?.admin).toLowerCase()

      isAdmin =
        role === 'admin' ||
        role === 'superadmin' ||
        p?.admin === true ||
        p?.isAdmin === true

      isSuperAdmin =
        role === 'superadmin' ||
        p?.isSuperAdmin === true
    }
  } catch {}

  const user = global?.db?.data?.users?.[target] || {}
  const chat = global?.db?.data?.chats?.[chatId] || {}
  const chatUser = chat?.users?.[target] || {}

  const displayName = await getDisplayName(conn, target, meta, m)

  const warn = Number(user.warn || 0)
  const muted = !!user.muto
  const messages = Number(chatUser.messages || 0)

  const joinedAt = user.regTime > 0
    ? formatDate(user.regTime)
    : user.firstTime > 0
      ? formatDate(user.firstTime)
      : 'Non disponibile'

  let roleText = '👤 𝐌𝐞𝐦𝐛𝐫𝐨'
  if (isAdmin) roleText = '🛡️ 𝐀𝐝𝐦𝐢𝐧'
  if (isSuperAdmin) roleText = '👑 𝐒𝐮𝐩𝐞𝐫𝐀𝐝𝐦𝐢𝐧'

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