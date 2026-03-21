// plugins abbraccia by Bonzino
const S = v => String(v || '')
const tag = (jid = '') => '@' + S(jid).split('@')[0].split(':')[0]

function boldUnicode(s = '') {
  let o = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)
    if (c >= 0x41 && c <= 0x5a) o += String.fromCodePoint(0x1D400 + (c - 0x41))
    else if (c >= 0x61 && c <= 0x7a) o += String.fromCodePoint(0x1D41A + (c - 0x61))
    else if (c >= 0x30 && c <= 0x39) o += String.fromCodePoint(0x1D7CE + (c - 0x30))
    else o += ch
  }
  return o
}

function resolveTarget(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]

  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  return null
}

let handler = async (m, { conn }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return

  const sender = S(
    m.sender ||
    m.key?.participant ||
    m.participant ||
    (m.key?.fromMe ? conn?.user?.id : '')
  )

  const target = resolveTarget(m)

  if (!target) {
    await conn.sendMessage(chat, {
      text: `${boldUnicode('*⚠️ Devi menzionare qualcuno o rispondere a un messaggio per abbracciarlo 🤗*')}\n\n${boldUnicode('Esempio:')}\n\`.abbraccia @utente\``,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363424041538498@newsletter',
          newsletterName: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
          serverMessageId: 1
        }
      }
    })
    return
  }

  const msg = `🤗 ${tag(sender)} ${boldUnicode('*ha abbracciato*')} ${tag(target)} 🫂`

  await conn.sendMessage(chat, {
    text: msg,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363424041538498@newsletter',
        newsletterName: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        serverMessageId: 1
      },
      mentionedJid: [sender, target]
    },
    mentions: [sender, target]
  })
}

handler.help = ['abbraccia @utente']
handler.tags = ['fun']
handler.command = ['abbraccia', 'abbraccio', 'hug']
handler.group = true

export default handler