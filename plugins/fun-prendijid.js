// plugins prendijid 

const S = v => String(v || '')

function buildContextMsg(title) {
  return {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'CTX' },
    message: {
      locationMessage: { name: title }
    },
    participant: '0@s.whatsapp.net'
  }
}

let handler = async (m, { conn, text, args }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return
  if (!chat.endsWith('@g.us')) {
    // Solo nei gruppi
    return m.reply('❌ Questo comando funziona solo nei gruppi!')
  }

  const input = text || args.join(' ')
  if (!input) {
    const q = buildContextMsg('PrendiJID')
    return conn.sendMessage(chat, {
      text: `❌ Inserisci un link del canale WhatsApp\n\nEsempio:\n.prendijid https://whatsapp.com/channel/xxxx`
    }, { quoted: q })
  }

  // Regex per link canale WhatsApp
  const match = input.match(/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
  if (!match) {
    const q = buildContextMsg('PrendiJID')
    return conn.sendMessage(chat, {
      text: `❌ Link non valido! Assicurati sia un link canale WhatsApp.`
    }, { quoted: q })
  }

  const id = match[1]
  const jid = id + '@newsletter'

  const replyText = `📢 *CHANNEL JID TROVATO*\n\n` +
                    `🔗 Link: ${input}\n` +
                    `🆔 ID: ${id}\n` +
                    `📌 JID: ${jid}`

  const q = buildContextMsg('PrendiJID')
  await conn.sendMessage(chat, {
    text: replyText
  }, { quoted: q })
}

handler.help = ['prendijid <link>']
handler.tags = ['tools']
handler.command = ['prendijid']
handler.group = true 

export default handler