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

let handler = async (m, { conn, text }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return

  // 1️⃣ Proviamo a prendere il newsletterJid dal messaggio stesso
  let jid = m.key?.newsletterJid

  // 2️⃣ Se il messaggio è quotato, proviamo dal messaggio quotato
  if (!jid && m.quoted?.key?.newsletterJid) {
    jid = m.quoted.key.newsletterJid
  }

  // 3️⃣ Se non esiste, proviamo a estrarlo da un link nel testo
  if (!jid && text) {
    const match = text.match(/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
    if (match) jid = match[1] + '@newsletter'
  }

  if (!jid) {
    const q = buildContextMsg('PrendiJID')
    return conn.sendMessage(chat, {
      text: `❌ Non è stato trovato alcun *newsletterJid*.\n\n⚠️ Assicurati che il messaggio provenga da un canale o contenga un link valido.`
    }, { quoted: q })
  }

  const replyText = `📢 *NEWSLETTER JID TROVATO*\n\n📌 JID: ${jid}`
  const q = buildContextMsg('PrendiJID')
  await conn.sendMessage(chat, { text: replyText }, { quoted: q })
}

handler.help = ['prendijid']
handler.tags = ['tools']
handler.command = ['prendijid']
handler.group = true // puoi rimuovere se vuoi anche privato

export default handler