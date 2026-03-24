let handler = async (m, { conn, command, text }) => {
  const chatId = m.chat
  global._antimedia = global._antimedia || {}
  if (!global._antimedia[chatId]) global._antimedia[chatId] = { enabled: false }

  const cfg = global._antimedia[chatId]

  
  if (command === '1') {
    if (cfg.enabled) return conn.reply(chatId, "🛡️ L'Antimedia è già **ATTIVO**.", m)
    cfg.enabled = true
    return conn.reply(chatId, "🛡️ Antimedia **ATTIVATO** ✅\nDa ora le foto/video normali verranno eliminati.", m)
  }

  
  if (command === '0') {
    if (!cfg.enabled) return conn.reply(chatId, "🛡️ L'Antimedia è già **DISATTIVO**.", m)
    cfg.enabled = false
    return conn.reply(chatId, "🛡️ Antimedia **DISATTIVATO** ❌", m)
  }
}


handler.help = ['1 antimedia', '0 antimedia']
handler.tags = ['group']
handler.command = ['1', '0'] 
handler.group = true
handler.admin = true 
handler.owner = false 


handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (!m.isGroup || !m.message || m.fromMe) return
  
  const chatId = m.chat
  if (!global._antimedia?.[chatId]?.enabled) return

  
  if (isAdmin || isOwner) return

  const msg = m.message
  const isViewOnce = !!(msg.viewOnceMessage || msg.viewOnceMessageV2 || msg.viewOnceMessageV1)
  const isMedia = !!(msg.imageMessage || msg.videoMessage)


  if (isMedia && !isViewOnce) {
    if (!isBotAdmin) return 

    try {
      
      await conn.sendMessage(chatId, { delete: m.key })

      
      global._antimediaWarnedUsers = global._antimediaWarnedUsers || {}
      global._antimediaWarnedUsers[chatId] = global._antimediaWarnedUsers[chatId] || new Set()
      
      if (!global._antimediaWarnedUsers[chatId].has(m.sender)) {
        global._antimediaWarnedUsers[chatId].add(m.sender)
        await conn.reply(
          chatId,
          `⚠️ @${m.sender.split('@')[0]}, in questo gruppo l'Antimedia è attivo. Sono ammessi solo media a **Visualizzazione Singola**.`,
          m,
          { mentions: [m.sender] }
        )
      }
    } catch (e) {
      console.error("Errore Antimedia:", e)
    }
  }
}

export default handler
