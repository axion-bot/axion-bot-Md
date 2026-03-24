let handler = async (m, { conn, command, usedPrefix }) => {
  let chat = global.db.data.chats[m.chat]

  if (!chat || !chat.archivioMessaggi || chat.archivioMessaggi.totali === 0) {
    return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\nNessun messaggio registrato oggi in questo gruppo.")
  }

  let dati = chat.archivioMessaggi

  let limite = 3
  if (command === "top5") limite = 5
  if (command === "top10") limite = 10

  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite)

  const medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅']

  let testo = `╭━〔 📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀* 📊 〕━⬣\n`
  testo += `┃ 💬 Messaggi totali: ${dati.totali}\n`
  testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`

  testo += `🏆 *𝐓𝐎𝐏 ${limite} 𝐃𝐈 𝐎𝐆𝐆𝐈*\n\n`

  let menzioni = classifica.map(u => u[0])

  classifica.forEach((u, i) => {
    let id = u[0]
    let conteggio = u[1].conteggio

    testo += `${medaglie[i]} @${id.split("@")[0]}\n`
    testo += `   ${conteggio} messaggi\n\n`
  })

  testo += `──────────────────\n`
  testo += `⏳ Il conteggio si azzera al cambio giorno`

  const buttons = [
    { buttonId: `${usedPrefix}top5`, buttonText: { displayText: '🏆 Top 5' }, type: 1 },
    { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '🏆 Top 10' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    footer: 'Seleziona un bottone per cambiare la classifica',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.archivioMessaggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (chat.archivioMessaggi.ultimoReset !== oggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  let archivio = chat.archivioMessaggi
  archivio.totali += 1

  if (!archivio.utenti[m.sender]) archivio.utenti[m.sender] = { conteggio: 0 }
  archivio.utenti[m.sender].conteggio += 1
}

if (!global.topResetInterval) {
  global.topResetInterval = setInterval(async () => {
    try {
      let chats = global.db.data.chats
      if (!chats) return

      let oggi = new Date().toDateString()

      for (let jid in chats) {
        let chat = chats[jid]
        if (!chat.archivioMessaggi) continue

        let dati = chat.archivioMessaggi

        if (!dati.ultimoReset) {
          dati.ultimoReset = oggi
          continue
        }

        if (dati.ultimoReset === oggi) continue

        if (dati.totali > 0) {
          let classifica = Object.entries(dati.utenti)
            .sort((a, b) => b[1].conteggio - a[1].conteggio)
            .slice(0, 3)

          let testo = `╭━〔 🏆 *𝐅𝐈𝐍𝐀𝐋𝐄* 🏆 〕━⬣\n`
          testo += `┃ 📊 Totale messaggi: ${dati.totali}\n`
          testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`

          let menzioni = classifica.map(u => u[0])
          const medaglie = ['🥇', '🥈', '🥉']

          classifica.forEach((u, i) => {
            testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio} messaggi\n`
          })

          testo += `\n🔄 Classifica resettata`

          if (global.conn) {
            await global.conn.sendMessage(jid, {
              text: testo,
              mentions: menzioni
            })
          }
        }

        chat.archivioMessaggi = {
          totali: 0,
          utenti: {},
          ultimoReset: oggi
        }
      }
    } catch (e) {
      console.error('Errore reset classifica:', e)
    }
  }, 60000)
}

handler.help = ['top', 'top5', 'top10']
handler.tags = ['strumenti']
handler.command = /^(top|top5|top10)$/i
handler.group = true

export default handler