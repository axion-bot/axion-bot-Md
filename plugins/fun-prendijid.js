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

let handler = async (m, { conn }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return
  if (!chat.endsWith('@g.us')) {
    return m.reply('❌ Questo comando funziona solo nei gruppi!')
  }

  // Controlliamo se il messaggio ha newsletterJid
  const jid = m.key?.newsletterJid
  if (!jid) {
    const q = buildContextMsg('PrendiJID')
    return conn.sendMessage(chat, {
      text: `❌ Non è stato trovato alcun *newsletterJid* in questo messaggio.\n\n⚠️ Assicurati che il messaggio provenga da un canale.`
    }, { quoted: q })
  }

  const replyText = `📢 *NEWSLETTER JID TROVATO*\n\n` +
                    `📌 JID: ${jid}`

  const q = buildContextMsg('PrendiJID')
  await conn.sendMessage(chat, { text: replyText }, { quoted: q })
}

handler.help = ['prendijid']
handler.tags = ['tools']
handler.command = ['prendijid']
handler.group = true // solo gruppi

export default handler