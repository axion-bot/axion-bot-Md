process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import axios from 'axios'

const sessions = new Map()

let handler = async (m, { conn, usedPrefix, command }) => {
  const chatId = m.chat

  if (sessions.has(chatId)) {
    if (m.text.toLowerCase() === 'stop') {
      sessions.delete(chatId)
      return m.reply('❌ Partita terminata.')
    }

    try {
      const res = await axios.get(`https://podgate.ai/api/free-gpt?prompt=${encodeURIComponent('Rispondi come Akinator in italiano. L\'utente dice: ' + m.text + '. Se hai indovinato scrivi "RISULTATO: nome personaggio", altrimenti fai la prossima domanda.')}`)
      
      const replyText = res.data.response

      if (replyText.includes("RISULTATO:")) {
          const nome = replyText.split("RISULTATO:")[1]
          await conn.sendMessage(chatId, { text: `✨ *HO INDOVINATO!*\n\nStavi pensando a: *${nome.trim()}*` }, { quoted: m })
          sessions.delete(chatId)
      } else {
          await conn.sendMessage(chatId, { text: replyText }, { quoted: m })
      }
    } catch (e) {
      sessions.delete(chatId)
      m.reply("❌ Errore di connessione. Riprova più tardi.")
    }
    return
  }

  try {
    const startRes = await axios.get(`https://podgate.ai/api/free-gpt?prompt=${encodeURIComponent('Inizia una partita a Akinator in italiano. Fai la prima domanda per indovinare il personaggio.')}`)
    
    sessions.set(chatId, { active: true })
    await conn.sendMessage(chatId, { text: `🎮 *AKINATOR AI*\n\n${startRes.data.response}` }, { quoted: m })
  } catch (err) {
    m.reply("❌ Servizio momentaneamente non disponibile.")
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
