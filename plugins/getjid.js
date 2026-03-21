let handler = m => m

handler.before = async function (m, { conn }) {
  try {
    const contexts = [
      m?.message?.extendedTextMessage?.contextInfo,
      m?.message?.imageMessage?.contextInfo,
      m?.message?.videoMessage?.contextInfo,
      m?.message?.documentMessage?.contextInfo,
      m?.msg?.contextInfo,
      m?.quoted?.message?.extendedTextMessage?.contextInfo,
      m?.quoted?.message?.imageMessage?.contextInfo,
      m?.quoted?.message?.videoMessage?.contextInfo,
      m?.quoted?.message?.documentMessage?.contextInfo,
      m?.quoted?.msg?.contextInfo
    ].filter(Boolean)

    let info = null
    for (const ctx of contexts) {
      if (ctx?.forwardedNewsletterMessageInfo?.newsletterJid) {
        info = ctx.forwardedNewsletterMessageInfo
        break
      }
    }

    if (!info) return false

    global.newsletterSeen = global.newsletterSeen || new Set()
    const key = `${info.newsletterJid}|${m.chat}`
    if (global.newsletterSeen.has(key)) return false
    global.newsletterSeen.add(key)

    const text = `*📡 𝐂𝐀𝐍𝐀𝐋𝐄 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐎*

*𝐍𝐨𝐦𝐞:* ${info.newsletterName || 'Sconosciuto'}

*𝐉𝐈𝐃:*
\`\`\`
${info.newsletterJid}
\`\`\``

    await conn.sendMessage(m.chat, { text }, { quoted: m })
  } catch (e) {
    console.error('Errore autocanale:', e)
  }

  return false
}

export default handler