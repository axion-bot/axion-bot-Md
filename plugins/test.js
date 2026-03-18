import { getDevice } from '@realvare/baileys'

const S = v => String(v || '')
const tag = (jid = '') => '@' + S(jid).split('@')[0].split(':')[0]

function resolveTarget(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  return m.sender || m.key?.participant || m.participant || null
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
    case 'ios': return 'iOS'
    case 'android': return 'Android'
    case 'web': return 'WhatsApp Web'
    case 'desktop': return 'WhatsApp Desktop'
    default: return 'Sconosciuto'
  }
}

let handler = async (m, { conn }) => {
  const chat = m.chat
  if (!chat) return

  const target = resolveTarget(m)
  if (!target) {
    await conn.sendMessage(chat, {
      text: '⚠️ Rispondi a un messaggio o tagga un utente.'
    }, { quoted: m })
    return
  }

  const sourceMsg = m.quoted || m
  const msgId = getMessageId(sourceMsg)

  let device = 'Sconosciuto'
  try {
    device = mapDeviceName(getDevice(msgId))
  } catch (e) {
    console.error('test-device error:', e)
  }

  const text =
`📱 *INFO DISPOSITIVO*

👤 Utente: ${tag(target)}
🧩 Dispositivo: *${device}*`

  await conn.sendMessage(chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['dispositivo']
handler.tags = ['owner']
handler.command = ['dispositivo']
handler.group = true
handler.rowner = true

export default handler
