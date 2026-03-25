// by Bonzino

const cooldowns = new Map()
const helpRequests = new Map()

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]

function getButtonId(m) {
  try {
    if (m.text) return m.text
    const msg = m.message || {}

    if (msg.buttonsResponseMessage?.selectedButtonId)
      return msg.buttonsResponseMessage.selectedButtonId

    if (msg.templateButtonReplyMessage?.selectedId)
      return msg.templateButtonReplyMessage.selectedId

    const native = msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
    if (native) {
      const parsed = JSON.parse(native)
      if (parsed?.id) return parsed.id
    }

    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
      return msg.listResponseMessage.singleSelectReply.selectedRowId
  } catch {}

  return ''
}

function isStaff(p) {
  return p?.admin === 'admin' || p?.admin === 'superadmin'
}

let handler = async (m, { conn, text }) => {
  if (!m.isGroup) return m.reply('*⚠️ Solo nei gruppi*')

  const key = `${m.chat}:${m.sender}`
  const now = Date.now()
  const wait = 2 * 60 * 1000

  if (cooldowns.get(key) && now - cooldowns.get(key) < wait) {
    return m.reply('*⏳ Riprova dopo*')
  }

  const meta = await conn.groupMetadata(m.chat)
  const staff = meta.participants.filter(isStaff).map(p => p.id)

  cooldowns.set(key, now)

  const motivo = text || 'Nessun motivo'
  const tag = '@' + bare(m.sender)

  const msg = `*╭━━━〔 🆘 SUPPORTO 〕━━━⬣*
┃ ${tag} ha richiesto aiuto
┃
┃ 📝 ${motivo}
*╰━━━━━━━━━━━━━━━━⬣*`

  const sent = await conn.sendMessage(m.chat, {
    text: msg,
    mentions: [m.sender, ...staff],
    buttons: [
      { buttonId: 'help_risolto', buttonText: { displayText: '✅ Risolto' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  helpRequests.set(sent.key.id, {
    requester: m.sender
  })
}

handler.before = async function (m) {
  const txt = getButtonId(m)
  if (!/^help_risolto$/i.test(txt)) return

  const meta = await this.groupMetadata(m.chat)
  const actor = meta.participants.find(p => p.id === m.sender)

  if (!isStaff(actor)) {
    return this.sendMessage(m.chat, { text: '*⚠️ Solo admin*' }, { quoted: m })
  }

  const id = m.quoted?.id || m.quoted?.key?.id
  const req = helpRequests.get(id)
  if (!req) return

  helpRequests.delete(id)

  await this.sendMessage(m.chat, {
    text: `*✅ Richiesta chiusa da @${bare(m.sender)}*`,
    mentions: [m.sender, req.requester]
  }, { quoted: m })

  return true
}

handler.command = /^(help)$/i
handler.group = true

export default handler