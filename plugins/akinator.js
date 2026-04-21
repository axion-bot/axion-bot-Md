
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
      const { data } = await axios.get(`https://api.api-me.pro/api/gpt4?q=${encodeURIComponent('Rispondi come Akinator in italiano. L\'utente dice: ' + m.text + '. Se hai capito il personaggio scrivi "INDOVINATO: [nome]", altrimenti fai la prossima domanda.')}`)
      
      const replyText = data.content || data.result

      if (replyText.includes("INDOVINATO:")) {
          const nome = replyText.split("INDOVINATO:")[1]
          await conn.sendMessage(chatId, { text: `✨ *VITTORIA!*\n\nStavi pensando a: *${nome.trim()}*` }, { quoted: m })
          sessions.delete(chatId)
      } else {
          await conn.sendMessage(chatId, { text: replyText }, { quoted: m })
      }
    } catch (e) {
      sessions.delete(chatId)
      m.reply("❌ Errore nel caricamento della risposta.")
    }
    return
  }

  try {
    const { data } = await axios.get(`https://api.api-me.pro/api/gpt4?q=${encodeURIComponent('Inizia una partita a Akinator in italiano. Saluta e fai la prima domanda.')}`)
    
    sessions.set(chatId, { active: true })
    const startTxt = data.content || data.result
    await conn.sendMessage(chatId, { text: `🎮 *AKINATOR AI*\n\n${startTxt}` }, { quoted: m })
  } catch (err) {
    m.reply("❌ *ERRORE*, Perché? Perché sono gay.")
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
