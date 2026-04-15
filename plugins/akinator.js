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
      const { data } = await axios.post('https://www.blackbox.ai/api/chat', {
        messages: [{ role: 'user', content: `Rispondi come Akinator in italiano. L'utente dice: ${m.text}. Se hai capito chi è scrivi "FINE: [nome]", altrimenti fai la prossima domanda.` }],
        model: 'deepseek-v3'
      })
      
      const replyText = data

      if (replyText.includes("FINE:")) {
          const nome = replyText.split("FINE:")[1]
          await conn.sendMessage(chatId, { text: `✨ *INDOVINATO!*\n\nStavi pensando a: *${nome.trim()}*` }, { quoted: m })
          sessions.delete(chatId)
      } else {
          await conn.sendMessage(chatId, { text: replyText }, { quoted: m })
      }
    } catch (e) {
      sessions.delete(chatId)
      m.reply("❌ Errore nel processare la risposta.")
    }
    return
  }

  try {
    const { data } = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ role: 'user', content: 'Inizia una partita a Akinator in italiano. Fai la prima domanda.' }],
      model: 'deepseek-v3'
    })
    
    sessions.set(chatId, { active: true })
    await conn.sendMessage(chatId, { text: `🎮 *AKINATOR AI*\n\n${data}` }, { quoted: m })
  } catch (err) {
    m.reply("❌ Sistema AI non disponibile. Prova più tardi.")
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
