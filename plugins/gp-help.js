// by Bonzino

const cooldowns = new Map()
const helpRequests = new Map()

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]

function getCooldownKey(chat, sender) {
  return `${chat}:${sender}`
}

function formatTime(ms) {
  const sec = Math.ceil(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.ceil(sec / 60)
  return `${min}m`
}

function isStaffParticipant(p) {
  return p?.admin === 'admin' || p?.admin === 'superadmin' || p?.isAdmin === true || p?.isSuperAdmin === true
}

let handler = async (m, { conn, text }) => {
  if (!m.isGroup) {
    return m.reply('*⚠️ 𝐔𝐬𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐬𝐨𝐥𝐨 𝐢𝐧 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨*')
  }

  const key = getCooldownKey(m.chat, m.sender)
  const now = Date.now()
  const waitMs = 2 * 60 * 1000
  const last = cooldowns.get(key) || 0

  if (now - last < waitMs) {
    return m.reply(`*⏳ 𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐭𝐫𝐚 ${formatTime(waitMs - (now - last))}*`)
  }

  let meta
  try {
    meta = await conn.groupMetadata(m.chat)
  } catch {
    return m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*')
  }

  const participants = Array.isArray(meta?.participants) ? meta.participants : []
  const staff = participants
    .filter(isStaffParticipant)
    .map(p => p.id || p.jid)
    .filter(Boolean)

  if (!staff.length) {
    return m.reply('*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧𝐨 𝐬𝐭𝐚𝐟𝐟 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*')
  }

  cooldowns.set(key, now)

  const motivo = text?.trim() || '𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐭𝐢𝐯𝐨 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚𝐭𝐨'
  const requesterTag = '@' + bare(m.sender)

  const msg = `*╭━━━〔 🆘 𝐒𝐔𝐏𝐏𝐎𝐑𝐓𝐎 〕━━━⬣*
┃ ${requesterTag} 𝐡𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐨 𝐥'𝐚𝐢𝐮𝐭𝐨 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟
┃
┃ *📝 𝐌𝐨𝐭𝐢𝐯𝐨:*
┃ ${motivo}
*╰━━━━━━━━━━━━━━━━⬣*`

  const sent = await conn.sendMessage(m.chat, {
    text: msg,
    mentions: [m.sender, ...staff],
    footer: '𝐒𝐨𝐥𝐨 𝐥𝐨 𝐬𝐭𝐚𝐟𝐟 𝐩𝐮𝐨̀ 𝐜𝐡𝐢𝐮𝐝𝐞𝐫𝐞 𝐥𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚',
    buttons: [
      { buttonId: 'help_risolto', buttonText: { displayText: '✅ Risolto' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  const requestId = sent?.key?.id || `${m.chat}:${m.sender}:${Date.now()}`
  helpRequests.set(requestId, {
    chat: m.chat,
    requester: m.sender,
    staff,
    motivo,
    createdAt: now
  })

  for (let jid of staff) {
    try {
      await conn.sendMessage(jid, {
        text: `*╭━━━〔 🆘 𝐀𝐕𝐕𝐈𝐒𝐎 𝐒𝐓𝐀𝐅𝐅 〕━━━⬣*
┃ 𝐄̀ 𝐬𝐭𝐚𝐭𝐚 𝐚𝐩𝐞𝐫𝐭𝐚 𝐮𝐧𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐢𝐮𝐭𝐨
┃
┃ *👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${requesterTag}
┃ *📍 𝐆𝐫𝐮𝐩𝐩𝐨:* ${meta.subject}
┃ *📝 𝐌𝐨𝐭𝐢𝐯𝐨:* ${motivo}
*╰━━━━━━━━━━━━━━━━⬣*`,
        mentions: [m.sender]
      })
    } catch {}
  }
}

handler.before = async function (m) {
  const txt = m.text || ''
  const isResolve = txt === 'help_risolto' || /^help_risolto$/i.test(txt)
  if (!isResolve) return

  if (!m.isGroup) {
    await this.sendMessage(m.chat, {
      text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐚 𝐚𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*'
    }, { quoted: m })
    return true
  }

  let meta
  try {
    meta = await this.groupMetadata(m.chat)
  } catch {
    return true
  }

  const participants = Array.isArray(meta?.participants) ? meta.participants : []
  const actor = participants.find(p => (p.id || p.jid) === m.sender)
  const isStaff = isStaffParticipant(actor)

  if (!isStaff) {
    await this.sendMessage(m.chat, {
      text: '*⚠️ 𝐒𝐨𝐥𝐨 𝐥𝐨 𝐬𝐭𝐚𝐟𝐟 𝐩𝐮𝐨̀ 𝐜𝐡𝐢𝐮𝐝𝐞𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*'
    }, { quoted: m })
    return true
  }

  const requestId = m.message?.buttonsResponseMessage?.contextInfo?.stanzaId || m.quoted?.id || m.quoted?.key?.id || null
  const req = requestId ? helpRequests.get(requestId) : null

  if (!req) {
    await this.sendMessage(m.chat, {
      text: '*⚠️ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐚 𝐨 𝐠𝐢𝐚̀ 𝐜𝐡𝐢𝐮𝐬𝐚*'
    }, { quoted: m })
    return true
  }

  helpRequests.delete(requestId)

  await this.sendMessage(m.chat, {
    text: `*╭━━━〔 ✅ 𝐑𝐈𝐒𝐎𝐋𝐓𝐎 〕━━━⬣*
┃ 𝐋𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐢𝐮𝐭𝐨 𝐞̀ 𝐬𝐭𝐚𝐭𝐚 𝐜𝐡𝐢𝐮𝐬𝐚
┃
┃ *🛡️ 𝐒𝐭𝐚𝐟𝐟:* @${bare(m.sender)}
┃ *👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${bare(req.requester)}
*╰━━━━━━━━━━━━━━━━⬣*`,
    mentions: [m.sender, req.requester]
  }, { quoted: m })

  try {
    await this.sendMessage(req.requester, {
      text: `*╭━━━〔 ✅ 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀𝐌𝐄𝐍𝐓𝐎 〕━━━⬣*
┃ 𝐋𝐚 𝐭𝐮𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐞̀ 𝐬𝐭𝐚𝐭𝐚 𝐜𝐡𝐢𝐮𝐬𝐚 𝐝𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟
┃
┃ *📍 𝐆𝐫𝐮𝐩𝐩𝐨:* ${meta.subject}
*╰━━━━━━━━━━━━━━━━⬣*`
    })
  } catch {}

  return true
}

handler.help = ['help <motivo>']
handler.tags = ['fun']
handler.command = /^(help)$/i
handler.group = true

export default handler