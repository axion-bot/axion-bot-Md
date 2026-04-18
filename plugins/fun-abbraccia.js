// plugins abbraccia by Bonzino

const tag = (jid = '') => '@' + String(jid).split('@')[0].split(':')[0]

function buildContextMsg(title) {
  return {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'CTX'
    },
    message: {
      locationMessage: {
        name: title
      }
    },
    participant: '0@s.whatsapp.net'
  }
}

function resolveTarget(m, text = '') {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]

  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  const numero = String(text || '').replace(/[^\d]/g, '')
  if (numero.length >= 5) return `${numero}@s.whatsapp.net`

  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return

  const sender = String(
    m.sender ||
    m.key?.participant ||
    m.participant ||
    (m.key?.fromMe ? conn?.user?.id : '')
  )

  const target = resolveTarget(m, text)
  const q = buildContextMsg('*🤗 𝐀𝐁𝐁𝐑𝐀𝐂𝐂𝐈𝐎*')

  if (!target) {
    return conn.sendMessage(chat, {
      text: `*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐩𝐞𝐫 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐫𝐥𝐨 🤗*\n\n*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*\n*${usedPrefix}${command} @utente*`,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: q })
  }

  if (target === sender) {
    return conn.sendMessage(chat, {
      text: `*🤗 ${tag(sender)} 𝐬𝐢 è 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐭𝐨 𝐝𝐚 𝐬𝐨𝐥𝐨 🫂*`,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        mentionedJid: [sender]
      },
      mentions: [sender]
    }, { quoted: q })
  }

  const senderNumero = String(sender).split('@')[0].split(':')[0]

  await conn.sendMessage(chat, {
    text: `*🤗 ${tag(sender)} 𝐡𝐚 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐭𝐨 ${tag(target)} 🫂*`,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [sender, target]
    },
    mentions: [sender, target],
    buttons: [
      {
        buttonId: `${usedPrefix}${command} ${senderNumero}`,
        buttonText: { displayText: '🫂 Ricambia l’abbraccio' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: q })
}

handler.help = ['abbraccia @utente']
handler.tags = ['fun']
handler.command = ['abbraccia', 'abbraccio', 'hug']
handler.group = true

export default handler