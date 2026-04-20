// by bonzino

const cooldowns = new Map()
const helpRequests = new Map()
const pendingReasons = new Map()

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

function isStaffParticipant(p) {
  return p?.admin === 'admin' || p?.admin === 'superadmin' || p?.isAdmin === true || p?.isSuperAdmin === true
}

function isStaffJid(jid, participants = []) {
  if (isRealOwner(jid)) return true
  const p = participants.find(v => (v.id || v.jid) === jid)
  return isStaffParticipant(p)
}

function getButtonId(m) {
  try {
    if (m.text) return m.text

    const msg = m.message || {}

    if (msg.buttonsResponseMessage?.selectedButtonId) {
      return msg.buttonsResponseMessage.selectedButtonId
    }

    if (msg.templateButtonReplyMessage?.selectedId) {
      return msg.templateButtonReplyMessage.selectedId
    }

    const native = msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
    if (native) {
      const parsed = JSON.parse(native)
      if (parsed?.id) return parsed.id
    }

    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) {
      return msg.listResponseMessage.singleSelectReply.selectedRowId
    }
  } catch {}

  return ''
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

  cooldowns.set(key, now)

  const motivo = text?.trim() || '𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐭𝐢𝐯𝐨'
  const requesterTag = '@' + bare(m.sender)

  let inviteLink = 'Non disponibile'
  try {
    const code = await conn.groupInviteCode(m.chat)
    inviteLink = `https://chat.whatsapp.com/${code}`
  } catch {}

  const supportGroup = '120363405786547241@g.us'

  const msg = `*╭━━━〔 🆘 𝐒𝐔𝐏𝐏𝐎𝐑𝐓𝐎 〕━━━⬣*
┃ ${requesterTag} 𝐡𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐨 𝐚𝐢𝐮𝐭𝐨
┃
┃ *📍 𝐆𝐫𝐮𝐩𝐩𝐨:* ${meta.subject}
┃ *🔗 𝐋𝐢𝐧𝐤:* ${inviteLink}
┃
┃ *📝 𝐌𝐨𝐭𝐢𝐯𝐨:*
┃ ${motivo}
*╰━━━━━━━━━━━━━━━━⬣*`

  const sent = await conn.sendMessage(supportGroup, {
    text: msg,
    mentions: [m.sender],
    footer: '𝐒𝐞𝐠𝐧𝐚𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐚',
    buttons: [
      { buttonId: 'help_risolto', buttonText: { displayText: '✅ 𝐑𝐢𝐬𝐨𝐥𝐭𝐨' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  const requestId = sent?.key?.id || `${m.chat}:${m.sender}:${Date.now()}`
  helpRequests.set(requestId, {
    chat: m.chat,
    requester: m.sender,
    motivo
  })

  m.reply('*✅ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐢𝐧𝐯𝐢𝐚𝐭𝐚 𝐚𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟*')
}

handler.before = async function (m) {
  const txt = getButtonId(m)

  let meta
  try {
    meta = await this.groupMetadata(m.chat)
  } catch {
    return true
  }

  const participants = meta.participants || []
  const isStaff = isStaffJid(m.sender, participants)

  if (txt === 'help_risolto') {
    if (!isStaff) {
      await this.sendMessage(m.chat, {
        text: '*⚠️ 𝐒𝐨𝐥𝐨 𝐥𝐨 𝐬𝐭𝐚𝐟𝐟 𝐩𝐮𝐨̀ 𝐟𝐚𝐫𝐥𝐨*'
      }, { quoted: m })
      return true
    }

    const requestId =
      m.message?.buttonsResponseMessage?.contextInfo?.stanzaId ||
      m.quoted?.id ||
      null

    const req = requestId ? helpRequests.get(requestId) : null
    if (!req) return true

    pendingReasons.set(m.sender, { requestId, ...req })

    await this.sendMessage(m.chat, {
      text: '*✏️ 𝐒𝐜𝐫𝐢𝐯𝐢 𝐥𝐚 𝐦𝐨𝐭𝐢𝐯𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐚 𝐫𝐢𝐬𝐨𝐥𝐮𝐳𝐢𝐨𝐧𝐞:*'
    }, { quoted: m })

    return true
  }

  if (pendingReasons.has(m.sender)) {
    const data = pendingReasons.get(m.sender)
    pendingReasons.delete(m.sender)
    helpRequests.delete(data.requestId)

    const reason = m.text || '𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐦𝐨𝐭𝐢𝐯𝐚𝐳𝐢𝐨𝐧𝐞'

    await this.sendMessage(m.chat, {
      text: `*╭━━━〔 ✅ 𝐑𝐈𝐒𝐎𝐋𝐓𝐎 〕━━━⬣*
┃ *🛡️ 𝐒𝐭𝐚𝐟𝐟:* @${bare(m.sender)}
┃ *👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${bare(data.requester)}
┃ *📝 𝐌𝐨𝐭𝐢𝐯𝐨:*
┃ ${reason}
*╰━━━━━━━━━━━━━━━━⬣*`,
      mentions: [m.sender, data.requester]
    }, { quoted: m })

    await this.sendMessage(data.chat, {
      text: `*✅ 𝐋𝐚 𝐭𝐮𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐞̀ 𝐬𝐭𝐚𝐭𝐚 𝐫𝐢𝐬𝐨𝐥𝐭𝐚*
👤 @${bare(data.requester)}
📝 *𝐌𝐨𝐭𝐢𝐯𝐨:* ${reason}`,
      mentions: [data.requester]
    })

    return true
  }

  return true
}

handler.help = ['help <motivo>']
handler.tags = ['group']
handler.command = /^(help)$/i
handler.group = true

export default handler